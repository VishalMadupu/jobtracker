/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

// Load environmental variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initializer for Google GenAI client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is required but missing.');
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// 1. API: Server configurations (for Google OAuth Client ID)
app.get('/api/config', (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || '954450664882-lllerk44sn3pppa4r4f2ejtrt5hb4soh.apps.googleusercontent.com',
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    defaultSpreadsheetId: process.env.GOOGLE_SPREADSHEET_ID || null,
    defaultSearchQuery: process.env.DEFAULT_SEARCH_QUERY || 'subject:(job OR application OR interview OR assessment OR resume OR placement) OR "LinkedIn" OR "Naukri" OR "foundit"',
  });
});

// Helper prompt to instruct Gemini on classification rules
const SYSTEM_INSTRUCTION = `
You are a highly details-focused Recruitment Analytics AI. Your task is to process email headers, threads, or copy-pasted email blocks and extract job applications, recruiter replies, assessments, and job board alerts.

Follow these classification rules strictly:
1. "applications": User's active applications. Identify elements such as:
   - Company name & Job title/role.
   - Origin source: 'gmail' (general), 'linkedin', 'naukri', or 'foundit' (previously Monster India).
   - "status":
     - 'applied': The user submitted a resume, applied on a board, or received an auto-acknowledgment.
     - 'assessment': An online test link, cognitive test, HackerRank/LeetCode invitation, or technical assessment invitation is found or referenced.
     - 'interview': Booking a call, Calendly links, recruiter interview schedule, technical round, video interview, or offer negotiation calls.
     - 'offer': Job offer letter, contract details.
     - 'rejected': Hard-rejection letters, "not moving forward".
   - "pendingAssessment": Set to true if there is an active assessment/test invitation that requires completion.
   - "assessmentDetails": Extract details of the test (e.g., deadline, assessment platform like HackerRank, duration) if present, otherwise null.
   - "replyReceived": Set to true if the email is a conversational reply from a real human recruiter rather than an automated no-reply newsletter/marketing campaign.

2. "jobAlerts": Job alerts, recommendations, board queries, or notification digests that aren't a direct personal application or direct personal recruiter reply.
   - Sources: LinkedIn Recommendations, Naukri Jobs alert, Foundit (foundit.in / foundit / Monster) matches.
   - Extract title, company, source ('linkedin', 'naukri', 'foundit', or 'other'), date, and a helpful description snippet.

Always transform dates to human-readable strings (e.g. "June 4, 2026" or "Yesterday"). Keep snippets clear and summaries of active status concise.
`;

// 2. API: Parse raw email content text or Gmail batch payload
app.post('/api/parse-email', async (req, res) => {
  try {
    const { emailContent, isBatch, emails } = req.body;
    const ai = getGeminiClient();

    let userPromptString = "";
    if (isBatch && Array.isArray(emails)) {
      userPromptString = `Please analyze this batch of ${emails.length} Gmail messages and classify them:\n\n` + 
        emails.map((m, idx) => `
        --- Message #${idx + 1} ---
        From: ${m.from || 'Unknown'}
        Subject: ${m.subject || 'No Subject'}
        Date: ${m.date || 'Unknown'}
        Snippet: ${m.snippet || ''}
        Full text snippet or body: ${m.body || m.snippet || ''}
        `).join('\n\n');
    } else {
      if (!emailContent || typeof emailContent !== 'string') {
        return res.status(400).json({ error: 'Missing emailContent input.' });
      }
      userPromptString = `Please analyze the following copy-pasted email headers and body texts:\n\n${emailContent}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: userPromptString,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            applications: {
              type: Type.ARRAY,
              description: "Array of extracted or updated job applications active in pipeline",
              items: {
                type: Type.OBJECT,
                properties: {
                  company: { type: Type.STRING },
                  role: { type: Type.STRING },
                  status: { 
                    type: Type.STRING, 
                    description: "Status must be 'applied', 'assessment', 'interview', 'offer', 'rejected', or 'other'." 
                  },
                  source: { 
                    type: Type.STRING, 
                    description: "Source platform: 'gmail', 'linkedin', 'naukri', 'foundit', or 'manual'." 
                  },
                  date: { type: Type.STRING },
                  snippet: { type: Type.STRING, description: "A very brief 1-2 sentence summary of the email context." },
                  pendingAssessment: { type: Type.BOOLEAN },
                  assessmentDetails: { type: Type.STRING, description: "Deadlines, platform (HackerRank/etc), null if none" },
                  replyReceived: { type: Type.BOOLEAN }
                },
                required: ["company", "role", "status", "source", "date", "snippet", "pendingAssessment", "replyReceived"]
              }
            },
            jobAlerts: {
              type: Type.ARRAY,
              description: "Array of extracted general job alert digests or recommendations from boards like LinkedIn, Naukri, or Foundit.",
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  company: { type: Type.STRING },
                  source: { type: Type.STRING, description: "Must be one of 'linkedin', 'naukri', 'foundit', or 'other'." },
                  date: { type: Type.STRING },
                  snippet: { type: Type.STRING },
                  link: { type: Type.STRING, description: "Null if not found." }
                },
                required: ["title", "company", "source", "date", "snippet"]
              }
            }
          },
          required: ["applications", "jobAlerts"]
        }
      }
    });

    if (!response || !response.text) {
      console.error('Gemini API returned an empty or invalid response:', response);
      return res.status(500).json({ error: 'Gemini API returned an empty response. This might be due to safety filters or an invalid prompt.' });
    }

    try {
      const parsedData = JSON.parse(response.text);
      res.json(parsedData);
    } catch (parseError) {
      console.error('Failed to parse Gemini JSON response:', response.text);
      res.status(500).json({ error: 'Gemini returned an invalid JSON format. Please try again or refine your query.' });
    }
  } catch (error: any) {
    console.error('Email parsing endpoint error:', error);
    // Provide more descriptive error for common SDK/API issues
    let errorMsg = error?.message || 'Server error occurred during analysis.';
    if (errorMsg.includes('API key not valid')) {
      errorMsg = 'Invalid Gemini API Key. Please verify your GEMINI_API_KEY in the .env file.';
    }
    res.status(500).json({ error: errorMsg });
  }
});

// Configure Vite middleware or Static files build serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files from compiled dist directory in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Job Application Tracker server running on port ${PORT}`);
  });
}

startServer();
