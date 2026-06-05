/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Clipboard, CopyCheck, ArrowRight, RefreshCw, AlertTriangle } from 'lucide-react';
import { SAMPLE_EMAIL_TEMPLATES } from '../utils';
import { ParserResponse } from '../types';

interface EmailParserToolProps {
  onImportData: (data: ParserResponse) => void;
}

export default function EmailParserTool({ onImportData }: EmailParserToolProps) {
  const [inputText, setInputText] = useState('');
  const [selectedTemplateIdx, setSelectedTemplateIdx] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const handleTemplateSelect = (idx: number) => {
    if (!SAMPLE_EMAIL_TEMPLATES[idx]) return;
    setSelectedTemplateIdx(idx);
    setInputText(SAMPLE_EMAIL_TEMPLATES[idx].text);
    setSuccessMsg(null);
    setErrMsg(null);
  };

  const handleAiParse = async () => {
    if (!inputText.trim()) {
      setErrMsg("Please paste some email text (headers or body) to analyze.");
      return;
    }
    
    setIsLoading(true);
    setSuccessMsg(null);
    setErrMsg(null);

    try {
      const response = await fetch('/api/parse-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailContent: inputText, isBatch: false })
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || `Failed to parse: ${response.statusText}`);
      }

      const parsed: ParserResponse = await response.json();
      
      onImportData(parsed);

      let reportMsg = "";
      if (parsed.applications.length > 0) {
        reportMsg += `Successfully parsed ${parsed.applications.length} job application(s). `;
      }
      if (parsed.jobAlerts.length > 0) {
        reportMsg += `Successfully parsed ${parsed.jobAlerts.length} bulletin alert(s).`;
      }
      if (parsed.applications.length === 0 && parsed.jobAlerts.length === 0) {
        reportMsg = "A.I. finished scanning, but could not match any job applications or alert templates.";
      }
      setSuccessMsg(reportMsg);
    } catch (error: any) {
      console.error(error);
      setErrMsg(error?.message || "Parsing failed. Please verify your GEMINI_API_KEY in Settings.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="email-parser-container" className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-150">
        <div className="flex items-center gap-2">
          <div className="p-1 text-purple-750">
            <Sparkles className="w-4 h-4 pointer-events-none" />
          </div>
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider font-sans">
            A.I. Email Parser & Sandbox
          </h3>
        </div>
      </div>

      <p className="text-xs text-slate-500 font-sans mt-3">
        Test our Gemini-powered parser directly! Select an application email template below to populate the parser, or paste any real raw headers or bodies from your inbox.
      </p>

      {/* Templates Selector */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {SAMPLE_EMAIL_TEMPLATES.map((template, idx) => (
          <button
            id={`template-btn-${idx}`}
            key={idx}
            onClick={() => handleTemplateSelect(idx)}
            className={`px-2.5 py-1 text-xs rounded-lg font-bold tracking-tight transition-all cursor-pointer ${
              selectedTemplateIdx === idx
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50/85'
            }`}
          >
            {template.name}
          </button>
        ))}
      </div>

      {/* Editor Block */}
      <div className="mt-4 relative">
        <textarea
          id="parser-textarea"
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
            setSelectedTemplateIdx(-1);
          }}
          placeholder="Paste headers or messages here..."
          className="w-full text-xs font-mono p-4 bg-slate-900 text-slate-100 rounded-xl min-h-[180px] focus:outline-hidden focus:ring-2 focus:ring-purple-400"
        />
        <div className="absolute right-3 bottom-4 text-[10px] text-slate-400 font-mono">
          {inputText.length} chars
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
        <button
          id="parser-execute-btn"
          onClick={handleAiParse}
          disabled={isLoading}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analyzing Content...
            </>
          ) : (
            <>
              Analyze with Gemini <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {/* Status Indicators */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            id="parser-success-msg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl text-xs font-sans flex items-start gap-1.5"
          >
            <div className="font-semibold">✨ Success:</div>
            <div>{successMsg}</div>
          </motion.div>
        )}

        {errMsg && (
          <motion.div
            id="parser-error-msg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 p-3 bg-rose-50 text-rose-800 border border-rose-100 rounded-xl text-xs font-sans flex items-start gap-1.5"
          >
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 pointer-events-none" />
            <div>{errMsg}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
