/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Calendar, Plus, Mail, HelpCircle, LayoutGrid, CheckSquare, Layers, FolderDot } from 'lucide-react';
import { JobApplication, JobAlert, ParserResponse } from './types';
import {
  getStoredApplications,
  saveStoredApplications,
  getStoredAlerts,
  saveStoredAlerts,
} from './utils';

import DashboardStats from './components/DashboardStats';
import PipelineBoard from './components/PipelineBoard';
import AlertsTimeline from './components/AlertsTimeline';
import GmailSyncPanel from './components/GmailSyncPanel';
import GoogleCalendarPanel from './components/GoogleCalendarPanel';
import GoogleSheetsPanel from './components/GoogleSheetsPanel';
import EmailParserTool from './components/EmailParserTool';
import ManualAddForm from './components/ManualAddForm';
import ApplicationDetails from './components/ApplicationDetails';
import LinkedInSyncPanel from './components/LinkedInSyncPanel';

export default function App() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [alerts, setAlerts] = useState<JobAlert[]>([]);
  const [activeApplication, setActiveApplication] = useState<JobApplication | null>(null);
  const [isManualAddOpen, setIsManualAddOpen] = useState(false);

  // Global Google Workspace Authentication tokens
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [googleClientId, setGoogleClientId] = useState<string | null>(null);
  
  // LinkedIn native token
  const [linkedInToken, setLinkedInToken] = useState<string | null>(null);

  // Load client ID configuration on mount
  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.googleClientId) {
          setGoogleClientId(data.googleClientId);
        }
      })
      .catch((err) => console.error('Error loading config:', err));
  }, []);

  // Sync Google Identity Services client script globally
  useEffect(() => {
    if (!googleClientId) return;
    const script = document.createElement('script');
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [googleClientId]);

  // Listen for LinkedIn OAuth postMessage
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Allow local and preview run environments
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'LINKEDIN_AUTH_SUCCESS') {
        if (event.data.token) {
          setLinkedInToken(event.data.token);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Launch unified multi-scope Google authorization panel
  const handleConnectGoogle = () => {
    if (!googleClientId) {
      alert("No Google Client ID set up. Navigate to environments of compile config or paste an Access Token manually below.");
      return;
    }

    try {
      // @ts-ignore
      const client = google.accounts.oauth2.initTokenClient({
        client_id: googleClientId,
        scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events.readonly https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/spreadsheets',
        prompt: 'consent',
        callback: (tokenResponse: any) => {
          if (tokenResponse.access_token) {
            setGoogleToken(tokenResponse.access_token);
          } else {
            alert("Authorization closed or rejected.");
          }
        },
      });
      client.requestAccessToken();
    } catch (err: any) {
      console.error(err);
      alert("Failed to initialize Google OAuth connection: " + (err?.message || err));
    }
  };

  // Launch LinkedIn OAuth window
  const handleConnectLinkedIn = async () => {
    try {
      const response = await fetch('/api/linkedin/auth/url');
      if (!response.ok) {
        throw new Error('Failed to get auth URL');
      }
      const { url } = await response.json();
      
      const authWindow = window.open(
        url,
        'oauth_popup',
        'width=600,height=700'
      );

      if (!authWindow) {
        alert('Please allow popups for this site to connect your LinkedIn account.');
      }
    } catch (error) {
      console.error('LinkedIn OAuth error:', error);
      alert('Failed to initialize LinkedIn connection.');
    }
  };

  // Synced Global Navigation States
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedSmartFilter, setSelectedSmartFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Load datasets on boot
  useEffect(() => {
    setApplications(getStoredApplications());
    setAlerts(getStoredAlerts());
  }, []);

  // Sync state modifications back to localstorage
  const handleUpdateApplications = (updatedList: JobApplication[]) => {
    setApplications(updatedList);
    saveStoredApplications(updatedList);
  };

  const handleUpdateAlerts = (updatedAlertsList: JobAlert[]) => {
    setAlerts(updatedAlertsList);
    saveStoredAlerts(updatedAlertsList);
  };

  // 1. Action: Manual job tracker addition 
  const handleAddApplication = (newApp: JobApplication) => {
    const updated = [newApp, ...applications];
    handleUpdateApplications(updated);
    setIsManualAddOpen(false);
  };

  // 2. Action: Update notes or logistics on individual cards
  const handleUpdateSingleApplication = (updatedApp: JobApplication) => {
    const updated = applications.map((app) => (app.id === updatedApp.id ? updatedApp : app));
    handleUpdateApplications(updated);
    if (activeApplication?.id === updatedApp.id) {
      setActiveApplication(updatedApp);
    }
  };

  // 3. Action: Delete single job card
  const handleDeleteApplication = (id: string) => {
    const updated = applications.filter((app) => app.id !== id);
    handleUpdateApplications(updated);
    setActiveApplication(null);
  };

  // 4. Action: Dismiss bulletin alert item
  const handleDismissAlert = (id: string) => {
    const updated = alerts.filter((a) => a.id !== id);
    handleUpdateAlerts(updated);
  };

  // 5. Action: Mark alert as applied -> prompts a direct pipeline submission card
  const handleApplyAlert = (alert: JobAlert) => {
    const newApp: JobApplication = {
      id: `applied-alert-${Date.now()}`,
      company: alert.company,
      role: alert.title,
      status: 'applied',
      source: alert.source as any,
      date: new Date().toISOString().split('T')[0],
      snippet: alert.snippet,
      pendingAssessment: false,
      assessmentDetails: null,
      replyReceived: false,
      notes: 'Quick logged from job bulletin alerts feed.',
      updatedAt: new Date().toISOString()
    };
    
    // Add application and dismiss associated alert
    handleUpdateApplications([newApp, ...applications]);
    handleUpdateAlerts(alerts.filter((a) => a.id !== alert.id));
  };

  // 6. Action: Merge imported logs from Gmail live queries or sandbox parsing
  const handleImportedData = (data: ParserResponse) => {
    // Merge applications intelligently (de-duplicate on same company + same role)
    const newAppsList = [...applications];
    data.applications.forEach((incoming) => {
      const existingIdx = newAppsList.findIndex(
        (ex) => ex.company.toLowerCase() === incoming.company.toLowerCase() && 
                ex.role.toLowerCase() === incoming.role.toLowerCase()
      );

      if (existingIdx > -1) {
        // Update status and details of existing
        newAppsList[existingIdx] = {
          ...newAppsList[existingIdx],
          status: incoming.status,
          snippet: incoming.snippet,
          pendingAssessment: incoming.pendingAssessment,
          assessmentDetails: incoming.assessmentDetails,
          replyReceived: incoming.replyReceived || newAppsList[existingIdx].replyReceived,
          updatedAt: new Date().toISOString()
        };
      } else {
        // Prepend new application item
        newAppsList.unshift({
          ...incoming,
          id: `ai-${Math.random().toString(36).substr(2, 9)}`,
          updatedAt: new Date().toISOString()
        });
      }
    });

    // Merge alerts similarly
    const newAlertsList = [...alerts];
    data.jobAlerts.forEach((incomingAlert) => {
      const exists = newAlertsList.some(
        (ex) => ex.company.toLowerCase() === incomingAlert.company.toLowerCase() && 
                ex.title.toLowerCase() === incomingAlert.title.toLowerCase()
      );
      if (!exists) {
        newAlertsList.unshift({
          ...incomingAlert,
          id: `ai-alert-${Math.random().toString(36).substr(2, 9)}`,
          status: 'new'
        });
      }
    });

    handleUpdateApplications(newAppsList);
    handleUpdateAlerts(newAlertsList);
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="w-58 bg-slate-900 text-white flex flex-col shrink-0 border-r border-slate-800 select-none">
        
        {/* Workspace Brand Title */}
        <div className="p-5 border-b border-slate-800/60 shrink-0">
          <h1 className="text-base font-black tracking-tight flex items-center gap-2">
            <span className="bg-blue-600 p-1.5 rounded-lg inline-flex items-center justify-center">
              <Mail className="w-4 h-4 text-white" />
            </span>
            JobTracker
          </h1>
        </div>

        {/* Channels & Filters list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-none">
          
          <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-3 mb-2">
            Origins & Sources
          </div>

          <button
            onClick={() => {
              setSelectedSource('all');
              setSelectedSmartFilter('all');
            }}
            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] font-bold tracking-tight transition-all text-left cursor-pointer ${
              selectedSource === 'all' && selectedSmartFilter === 'all'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
            }`}
          >
            <FolderDot className="w-3.5 h-3.5 text-slate-450" />
            <span>All Channels</span>
            <span className="ml-auto bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded text-[9px] font-bold">
              {applications.length}
            </span>
          </button>

          <button
            onClick={() => {
              setSelectedSource('linkedin');
              setSelectedSmartFilter('all');
            }}
            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] font-bold tracking-tight transition-all text-left cursor-pointer ${
              selectedSource === 'linkedin'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-blue-500"></span>
            <span>LinkedIn</span>
            <span className="ml-auto bg-blue-500/20 text-blue-400 px-1.5 py-0.2 rounded text-[9px] font-bold">
              {applications.filter(app => app.source === 'linkedin').length}
            </span>
          </button>

          <button
            onClick={() => {
              setSelectedSource('naukri');
              setSelectedSmartFilter('all');
            }}
            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] font-bold tracking-tight transition-all text-left cursor-pointer ${
              selectedSource === 'naukri'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-slate-400"></span>
            <span>Naukri.com</span>
            <span className="ml-auto bg-slate-700 text-slate-300 px-1.5 py-0.2 rounded text-[9px] font-bold">
              {applications.filter(app => app.source === 'naukri').length}
            </span>
          </button>

          <button
            onClick={() => {
              setSelectedSource('foundit');
              setSelectedSmartFilter('all');
            }}
            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] font-bold tracking-tight transition-all text-left cursor-pointer ${
              selectedSource === 'foundit'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-purple-500"></span>
            <span>Foundit</span>
            <span className="ml-auto bg-purple-500/20 text-purple-400 px-1.5 py-0.2 rounded text-[9px] font-bold">
              {applications.filter(app => app.source === 'foundit').length}
            </span>
          </button>

          <button
            onClick={() => {
              setSelectedSource('gmail');
              setSelectedSmartFilter('all');
            }}
            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] font-bold tracking-tight transition-all text-left cursor-pointer ${
              selectedSource === 'gmail'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
            <span>Gmail Syncs</span>
            <span className="ml-auto bg-red-550/20 text-red-450 px-1.5 py-0.2 rounded text-[9px] font-bold">
              {applications.filter(app => app.source === 'gmail').length}
            </span>
          </button>

          <button
            onClick={() => {
              setSelectedSource('manual');
              setSelectedSmartFilter('all');
            }}
            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] font-bold tracking-tight transition-all text-left cursor-pointer ${
              selectedSource === 'manual'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>Manual Track</span>
            <span className="ml-auto bg-slate-700 text-slate-400 px-1.5 py-0.2 rounded text-[9px] font-bold">
              {applications.filter(app => app.source === 'manual').length}
            </span>
          </button>

          {/* Smart categories segmentation filters */}
          <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-3 pt-6 mb-2">
            Smart Filters
          </div>

          <button
            onClick={() => {
              setSelectedSource('all');
              setSelectedSmartFilter('applied');
            }}
            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] font-bold tracking-tight transition-all text-left cursor-pointer ${
              selectedSmartFilter === 'applied'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Sent Only</span>
            <span className="ml-auto bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded text-[9px] font-bold">
              {applications.filter(app => app.status === 'applied').length}
            </span>
          </button>

          <button
            onClick={() => {
              setSelectedSource('all');
              setSelectedSmartFilter('assessments');
            }}
            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] font-bold tracking-tight transition-all text-left cursor-pointer ${
              selectedSmartFilter === 'assessments'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Assessments</span>
            <span className="ml-auto bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded text-[9px] font-bold">
              {applications.filter(app => app.pendingAssessment || app.status === 'assessment').length}
            </span>
          </button>

          <button
            onClick={() => {
              setSelectedSource('all');
              setSelectedSmartFilter('interviews');
            }}
            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] font-bold tracking-tight transition-all text-left cursor-pointer ${
              selectedSmartFilter === 'interviews'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Interviews & Replies</span>
            <span className="ml-auto bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded text-[9px] font-bold">
              {applications.filter(app => app.status === 'interview' || app.replyReceived).length}
            </span>
          </button>

        </nav>

        {/* User context layout bottom footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/45 shrink-0">
          <div className="flex items-center gap-2 md:gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-black text-white shrink-0">
              VR
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-black text-slate-100 truncate">Vishal Reddy</p>
              <p className="text-[9px] text-slate-500 truncate">vishalreddy354@gmail.com</p>
            </div>
          </div>
        </div>

      </aside>

      {/* MAIN RIGHT PANEL CONTENT SCROLL CONTAINER */}
      <main className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
        
        {/* Horizontal Status Ribbon */}
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase tracking-widest font-black text-slate-400">Section</span>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-bold text-slate-600 font-sans">Enterprise Job Tracker Hub</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold bg-slate-100 px-2.5 py-1 rounded-lg">
            <Calendar className="w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <span>Synced 2m ago</span>
          </div>
        </header>

        {/* Scrollable Layout Context */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          
          {/* Dynamic numerical stats card grid */}
          <section id="metrics-overview">
            <DashboardStats applications={applications} />
          </section>

          {/* Core Table List or Lanes visual map */}
          <section id="applications-pipeline">
            <PipelineBoard
              applications={applications}
              onSelectApplication={setActiveApplication}
              onOpenManualAdd={() => setIsManualAddOpen(true)}
              selectedSource={selectedSource}
              setSelectedSource={setSelectedSource}
              selectedSmartFilter={selectedSmartFilter}
              setSelectedSmartFilter={setSelectedSmartFilter}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </section>

          {/* Lower layout parsers sandboxes & alerts bulletins columns */}
          <div id="lower-dashboard-layout" className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-1">
            
            {/* Sync Integrations & Sandbox parsers section (Left) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <LinkedInSyncPanel
                token={linkedInToken}
                onConnectLinkedIn={handleConnectLinkedIn}
                onImportData={handleImportedData}
              />
              <GmailSyncPanel
                token={googleToken}
                onConnectGoogle={handleConnectGoogle}
                onImportData={handleImportedData}
              />
              <GoogleCalendarPanel
                token={googleToken}
                onConnectGoogle={handleConnectGoogle}
              />
              <GoogleSheetsPanel
                token={googleToken}
                onConnectGoogle={handleConnectGoogle}
                applications={applications}
              />
              <EmailParserTool onImportData={handleImportedData} />
            </div>

            {/* Live Bullet Alerts feed (Right) */}
            <div className="lg:col-span-7">
              <AlertsTimeline
                alerts={alerts}
                onDismissAlert={handleDismissAlert}
                onApplyAlert={handleApplyAlert}
              />
            </div>

          </div>

          {/* Legal / status signature */}
          <footer className="pt-6 pb-2 border-t border-slate-200 text-center text-[10px] text-slate-400 font-sans tracking-wide">
            Powered by standard client-side sandbox cache & Gemini LLM parsing models. Unified profile: vishalreddy354@gmail.com
          </footer>

        </div>

      </main>

      {/* FORMS MODALS OVERLAYS */}
      <AnimatePresence>
        {isManualAddOpen && (
          <ManualAddForm
            onClose={() => setIsManualAddOpen(false)}
            onAdd={handleAddApplication}
          />
        )}

        {activeApplication && (
          <ApplicationDetails
            application={activeApplication}
            onClose={() => setActiveApplication(null)}
            onUpdate={handleUpdateSingleApplication}
            onDelete={handleDeleteApplication}
            googleToken={googleToken}
            onConnectGoogle={handleConnectGoogle}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
