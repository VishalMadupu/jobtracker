/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileSpreadsheet, Download, RefreshCw, CheckCircle2, AlertCircle, ExternalLink, ShieldCheck, HelpCircle } from 'lucide-react';
import { JobApplication } from '../types';

interface GoogleSheetsPanelProps {
  token: string | null;
  onConnectGoogle: () => void;
  applications: JobApplication[];
}

export default function GoogleSheetsPanel({ token, onConnectGoogle, applications }: GoogleSheetsPanelProps) {
  const [sheetName, setSheetName] = useState('My Job Tracker Hub Export');
  const [isExporting, setIsExporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Track spreadsheet details in localStorage for dynamic persistence
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(() => {
    return localStorage.getItem('jobtracker_sheets_id') || null;
  });
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string | null>(() => {
    return localStorage.getItem('jobtracker_sheets_url') || null;
  });
  const [lastExported, setLastExported] = useState<string | null>(() => {
    return localStorage.getItem('jobtracker_sheets_time') || null;
  });

  // Export or overwrite data on a Google Sheet
  const handleExportData = async (e: React.FormEvent, createNew: boolean = true) => {
    e.preventDefault();
    if (!token) return;
    if (applications.length === 0) {
      setErrorMsg('No applications to export. Add some jobs first!');
      return;
    }

    const actionText = createNew ? 'create a brand new Google Sheet' : 'overwrite the existing synchronized Google Sheet';
    const confirmed = window.confirm(
      `Do you want to ${actionText} with your current ${applications.length} tracked application entries?`
    );
    if (!confirmed) return;

    setIsExporting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      let targetSpreadsheetId = spreadsheetId;
      let targetSpreadsheetUrl = spreadsheetUrl;

      // 1. Create a brand new Spreadsheet if requested or none exists
      if (createNew || !targetSpreadsheetId) {
        const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            properties: {
              title: `${sheetName} (${new Date().toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric' })})`
            }
          })
        });

        if (!createResponse.ok) {
          throw new Error(`Google Sheets API responded with status ${createResponse.status} during creation.`);
        }

        const resData = await createResponse.json();
        targetSpreadsheetId = resData.spreadsheetId;
        targetSpreadsheetUrl = resData.spreadsheetUrl;
        
        if (!targetSpreadsheetId) {
          throw new Error('Failed to resolve target spreadsheet specifications.');
        }
      }

      // 2. Format the application data into 2D array coordinates [row][col]
      const headers = [
        'Application ID',
        'Company',
        'Current Role / Title',
        'Status',
        'Source Channel',
        'Date Applied / Milestone',
        'Pending Assessment',
        'Milestone Assessment Details',
        'Reply Received',
        'Additional Notes / Prep Docs',
        'Last Updated Timestamp'
      ];

      const rows = applications.map((app) => [
        app.id,
        app.company,
        app.role,
        app.status.toUpperCase(),
        app.source.toUpperCase(),
        app.date,
        app.pendingAssessment ? 'YES' : 'NO',
        app.assessmentDetails || 'N/A',
        app.replyReceived ? 'YES' : 'NO',
        app.notes || '',
        app.updatedAt ? new Date(app.updatedAt).toLocaleString() : 'N/A'
      ]);

      // Add Headers to full dataset grid
      const sheetData = [headers, ...rows];

      // 3. Write/Publish the cells using ValueRange endpoints
      const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${targetSpreadsheetId}/values/Sheet1!A1?valueInputOption=USER_ENTERED`;
      const updateResponse = await fetch(updateUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          range: 'Sheet1!A1',
          majorDimension: 'ROWS',
          values: sheetData
        })
      });

      if (!updateResponse.ok) {
        throw new Error(`Failed to write cells. Sheets API status: ${updateResponse.status}`);
      }

      // 4. Save credentials/links dynamically to state + localStorage
      const timestamp = new Date().toLocaleString();
      setSpreadsheetId(targetSpreadsheetId);
      setSpreadsheetUrl(targetSpreadsheetUrl);
      setLastExported(timestamp);

      localStorage.setItem('jobtracker_sheets_id', targetSpreadsheetId);
      if (targetSpreadsheetUrl) {
        localStorage.setItem('jobtracker_sheets_url', targetSpreadsheetUrl);
      }
      localStorage.setItem('jobtracker_sheets_time', timestamp);

      setSuccessMsg(createNew 
        ? `Spreadsheet created and ${applications.length} applications loaded successfully!`
        : `Spreadsheet synchronization completed. Updated with ${applications.length} entries.`
      );
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to export job files to Google Sheets.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearSavedSpreadsheet = () => {
    if (window.confirm('Do you want to unlink the current spreadsheet reference? The spreadsheet itself will still exist in your Drive.')) {
      setSpreadsheetId(null);
      setSpreadsheetUrl(null);
      setLastExported(null);
      localStorage.removeItem('jobtracker_sheets_id');
      localStorage.removeItem('jobtracker_sheets_url');
      localStorage.removeItem('jobtracker_sheets_time');
    }
  };

  return (
    <div id="google-sheets-container" className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-sm flex flex-col h-full max-h-[580px]">
      
      {/* Header section with status badges */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-150 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1 text-emerald-600">
            <FileSpreadsheet className="w-4 h-4 pointer-events-none" />
          </div>
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider font-sans">
            Google Sheets Sync
          </h3>
        </div>
        {token && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-150 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3 h-3 text-emerald-650" /> Linked Sheets
          </span>
        )}
      </div>

      {/* Main Container Workarea */}
      <div className="flex-1 overflow-y-auto mt-3 space-y-3 pr-1 scrollbar-thin">
        
        {/* Error Details */}
        {errorMsg && (
          <div className="p-2.5 bg-rose-50 border border-rose-100 text-[11px] text-rose-800 rounded-lg flex items-start gap-1.5 font-sans">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Details */}
        {successMsg && (
          <div className="p-2.5 bg-indigo-50 border border-indigo-100 text-[11px] text-indigo-800 rounded-lg flex items-start gap-1.5 font-sans">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-indigo-500 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Authenticated user sync flow vs Auth Request */}
        {!token ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileSpreadsheet className="w-8 h-8 text-slate-350 pointer-events-none mb-2 animate-pulse" />
            <p className="text-xs font-semibold text-slate-500 font-sans">Google Sheets access is not yet activated.</p>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5 max-w-[280px] mx-auto">
              Link your workspace to export, back up, and synchronize job tracking boards live onto clean Google Spreadsheet rosters.
            </p>
            <button
              id="sheets-connect-btn"
              onClick={onConnectGoogle}
              className="mt-3.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer"
            >
              Sign In to Google Space
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Active Connected Spreadsheet panel details */}
            {spreadsheetId ? (
              <div className="p-3 bg-emerald-50/40 border border-emerald-100 rounded-lg space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Active Spreadsheet Connection</span>
                    <span className="text-[11px] font-bold text-slate-800 font-sans leading-tight line-clamp-1 mt-0.5">
                      Spreadsheet ID: <code className="text-[9px] bg-white border px-1 py-0.5 rounded text-indigo-700">{spreadsheetId.substring(0, 8)}...</code>
                    </span>
                  </div>
                  {spreadsheetUrl && (
                    <a
                      id="view-sheets-btn"
                      href={spreadsheetUrl}
                      target="_blank"
                      referrerPolicy="no-referrer"
                      rel="noreferrer"
                      className="text-[10px] font-extrabold text-indigo-650 hover:text-indigo-800 bg-white shadow-xs border border-indigo-200 px-2 py-0.8 rounded-md flex items-center gap-0.5 transition-all text-center uppercase whitespace-nowrap"
                    >
                      Open Sheet <ExternalLink className="w-2.5 h-2.5 text-indigo-500" />
                    </a>
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-150/50">
                  <span>Last exported: <strong>{lastExported || 'Never'}</strong></span>
                  <button
                    id="sheets-unlink-btn"
                    onClick={handleClearSavedSpreadsheet}
                    className="text-[9px] font-bold text-rose-500 hover:text-rose-700 uppercase"
                  >
                    Unlink
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    id="sheets-sync-btn"
                    onClick={(e) => handleExportData(e, false)}
                    disabled={isExporting}
                    className="w-full h-8.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-sm font-sans"
                  >
                    {isExporting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    <span>Push Updates</span>
                  </button>

                  <button
                    id="sheets-recreate-btn"
                    onClick={(e) => handleExportData(e, true)}
                    disabled={isExporting}
                    className="w-full h-8.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 font-sans"
                  >
                    <Download className="w-3 h-3" />
                    <span>Export New File</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={(e) => handleExportData(e, true)} className="space-y-3">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">Export Spreadsheet Name</label>
                  <input
                    id="sheets-name-input"
                    type="text"
                    required
                    value={sheetName}
                    onChange={(e) => setSheetName(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans text-slate-800 focus:outline-none focus:border-indigo-400"
                    placeholder="e.g. My Job Applications"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 font-sans">
                    This will create a new sheet, format automatic column headers representing status fields, and append your active {applications.length} applications.
                  </p>
                </div>

                <button
                  id="sheets-submit-btn"
                  type="submit"
                  disabled={isExporting}
                  className="w-full h-9.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-extrabold rounded-lg transition-all shadow-sm flex items-center justify-center gap-1.5 uppercase cursor-pointer"
                >
                  {isExporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  <span>Export to Google Sheets</span>
                </button>
              </form>
            )}

            {/* Explanatory utility check */}
            <div className="p-2.5 bg-slate-50 border border-slate-150 rounded-lg text-[10px] text-slate-500 flex gap-2 font-sans">
              <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 pointer-events-none mt-0.5" />
              <div>
                <p className="font-bold text-slate-650 leading-tight">Live Worksheet Interoperability:</p>
                <p className="leading-relaxed mt-0.5 text-slate-450">Fields exported: Company, Role, Status, Source channel, Timestamps, Milestones, and Notes. Linking allows matching rows to overwrite sync on-demand.</p>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
