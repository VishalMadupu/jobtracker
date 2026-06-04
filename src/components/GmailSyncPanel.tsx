/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, RefreshCw, Key, ShieldCheck, Info, Sparkles, ExternalLink } from 'lucide-react';
import { ParserResponse } from '../types';

interface GmailSyncPanelProps {
  onImportData: (data: ParserResponse) => void;
}

export default function GmailSyncPanel({ onImportData }: GmailSyncPanelProps) {
  const [clientId, setClientId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [manualTokenInput, setManualTokenInput] = useState('');
  const [query, setQuery] = useState('subject:(job OR application OR interview OR assessment OR resume OR placement) OR "LinkedIn" OR "Naukri" OR "foundit"');
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(true);
  const [showTokenSettings, setShowTokenSettings] = useState(false);

  // Fetch client ID configuration on mount
  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.googleClientId) {
          setClientId(data.googleClientId);
        }
      })
      .catch((err) => console.error('Error fetching server config:', err));
  }, []);

  // Sync Google Identity Services client script
  useEffect(() => {
    if (!clientId) return;
    const script = document.createElement('script');
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [clientId]);

  // Launch standard Google Client ID OAuth pop-up login
  const handleOAuthLogin = () => {
    if (!clientId) {
      setStatusMsg("No Google Client ID set up. Navigate to Settings or paste an Access Token manually below.");
      setIsSuccess(false);
      return;
    }

    try {
      // @ts-ignore
      const client = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/gmail.readonly',
        callback: (tokenResponse: any) => {
          if (tokenResponse.access_token) {
            setToken(tokenResponse.access_token);
            setStatusMsg("Successfully authorized Gmail via Google!");
            setIsSuccess(true);
          } else {
            setStatusMsg("Authorization popup was closed or failed.");
            setIsSuccess(false);
          }
        },
      });
      client.requestAccessToken();
    } catch (err: any) {
      console.error(err);
      setStatusMsg("Failed to open OAuth Client pop-up: " + (err?.message || err));
      setIsSuccess(false);
    }
  };

  const syncGmailMessages = async (accessToken: string) => {
    setIsSyncing(true);
    setStatusMsg("Syncing: Connecting to Google Gmail API...");
    setIsSuccess(true);

    try {
      // Step 1: List matching messages
      const searchUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=15&q=${encodeURIComponent(query)}`;
      const searchRes = await fetch(searchUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!searchRes.ok) {
        throw new Error(`Gmail API search request rejected (${searchRes.status}). Verify your token permissions.`);
      }

      const searchData = await searchRes.json();
      const messages = searchData.messages || [];

      if (messages.length === 0) {
        setStatusMsg("Successfully synced, but 0 matching messages found with current query.");
        setIsSyncing(false);
        return;
      }

      setStatusMsg(`Found ${messages.length} messages. Fetching email snippets & details...`);

      // Step 2: Fetch details for messages in parallel
      const detailedEmails = await Promise.all(
        messages.map(async (m: { id: string }) => {
          const detailUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=minimal`;
          const detailRes = await fetch(detailUrl, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (!detailRes.ok) return null;
          const detailData = await detailRes.json();

          // Extract Subject, From, Date headers
          const headers = detailData.payload?.headers || [];
          const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || 'No Subject';
          const from = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || 'Unknown Sender';
          const date = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value || 'Unknown Date';

          return {
            id: m.id,
            subject,
            from,
            date,
            snippet: detailData.snippet || '',
          };
        })
      );

      const validEmails = detailedEmails.filter(Boolean);
      setStatusMsg("Running A.I. extraction with Gemini to parse your jobs pipeline...");

      // Step 3: Analyze the raw emails bundle in our backend
      const analyzeRes = await fetch('/api/parse-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isBatch: true,
          emails: validEmails,
        }),
      });

      if (!analyzeRes.ok) {
        throw new Error("Gemini parser backend rejected the email bundle. Verify GEMINI_API_KEY.");
      }

      const parsedResponse: ParserResponse = await analyzeRes.json();
      onImportData(parsedResponse);

      const appCount = parsedResponse.applications.length;
      const alertCount = parsedResponse.jobAlerts.length;
      setStatusMsg(`Successfully scanned Gmail! Loaded ${appCount} applications and ${alertCount} alerts context.`);
      setIsSuccess(true);
    } catch (err: any) {
      console.error(err);
      setStatusMsg(err?.message || "Sync failed. Your access token might have expired.");
      setIsSuccess(false);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleManualTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTokenInput.trim()) return;
    setToken(manualTokenInput.trim());
    setStatusMsg("Saved manual access token for Gmail queries!");
    setIsSuccess(true);
    setManualTokenInput('');
  };

  return (
    <div id="gmail-sync-panel-container" className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-150">
        <div className="flex items-center gap-2">
          <div className="p-1 text-red-650">
            <Mail className="w-4 h-4 pointer-events-none" />
          </div>
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider font-sans">
            Live Gmail Integration
          </h3>
        </div>
        {token && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-150 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3 h-3 text-emerald-600" /> Linked
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {/* Dynamic description info */}
        <div className="text-xs text-slate-600 space-y-2">
          <p className="font-sans leading-relaxed">
            Directly connect your Google mailbox to sync live application responses and job listings matching your pipeline.
          </p>
        </div>

        {/* Query modifier */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 font-sans tracking-wider">
            Gmail Search Filter Query
          </label>
          <input
            id="sync-query-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full mt-1.5 p-2 rounded-lg border border-slate-200 text-xs text-slate-700 font-mono tracking-tight focus:outline-hidden focus:ring-1 focus:ring-red-400"
          />
        </div>

        {/* Sync Controls */}
        <div className="flex flex-wrap gap-2 pt-2 items-center">
          {token ? (
            <button
              id="gmail-sync-start-btn"
              onClick={() => syncGmailMessages(token)}
              disabled={isSyncing}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white hover:shadow-md cursor-pointer rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {isSyncing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              Fetch & Parse Gmail
            </button>
          ) : (
            <button
              id="google-login-oauth-btn"
              onClick={handleOAuthLogin}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Mail className="w-3.5 h-3.5 text-white pointer-events-none" /> Authorize Gmail Sync
            </button>
          )}

          <button
            id="toggle-token-btn"
            onClick={() => setShowTokenSettings(!showTokenSettings)}
            className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-medium text-xs transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Key className="w-3.5 h-3.5 pointer-events-none" /> Developer Token Auth
          </button>
        </div>

        {/* Token auth settings dropdown panel */}
        {showTokenSettings && (
          <motion.form
            id="token-settings-form"
            onSubmit={handleManualTokenSubmit}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="p-4 bg-slate-50 border border-slate-100 rounded-xl"
          >
            <div className="flex items-start gap-1.5 mb-2 text-slate-500 text-[10px]">
              <Info className="w-3.5 h-3.5 shrink-0 hover:text-indigo-600" />
              <p className="font-sans">
                Inside sandbox environments, Google POP-ups are often limited by local origins. You may paste a temporary Google Access Token (e.g. from the 
                <a 
                  href="https://developers.google.com/oauthplayground" 
                  target="_blank" 
                  referrerPolicy="no-referrer"
                  rel="noreferrer" 
                  className="text-red-500 hover:underline mx-1 inline-flex items-center gap-0.5"
                >
                  OAuth Playground <ExternalLink className="w-2.5 h-2.5" />
                </a> 
                with <code>gmail.readonly</code> scope) to query your mailbox directly.
              </p>
            </div>
            <div className="flex gap-2">
              <input
                id="dev-token-input"
                type="text"
                placeholder="ya29.a0Acv..."
                value={manualTokenInput}
                onChange={(e) => setManualTokenInput(e.target.value)}
                className="flex-1 p-2 bg-white rounded-lg border border-slate-200 text-xs font-mono"
              />
              <button
                id="save-dev-token-btn"
                type="submit"
                className="px-3 py-2 bg-slate-800 text-white font-semibold text-xs rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
              >
                Apply
              </button>
            </div>
          </motion.form>
        )}

        {/* Reports / Messages */}
        {statusMsg && (
          <div
            id="gmail-sync-status-box"
            className={`p-3 rounded-xl border text-xs font-sans ${
              isSuccess 
                ? 'bg-emerald-50/50 text-emerald-800 border-emerald-100' 
                : 'bg-rose-50/50 text-rose-800 border-rose-100'
            }`}
          >
            {statusMsg}
          </div>
        )}
      </div>
    </div>
  );
}
