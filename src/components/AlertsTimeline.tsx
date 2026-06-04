/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Bell, Trash2, CheckCircle, ExternalLink, Sparkles } from 'lucide-react';
import { JobAlert } from '../types';

interface AlertsTimelineProps {
  alerts: JobAlert[];
  onDismissAlert: (id: string) => void;
  onApplyAlert: (alert: JobAlert) => void;
}

export default function AlertsTimeline({ alerts, onDismissAlert, onApplyAlert }: AlertsTimelineProps) {
  
  // High density theme dynamic source tags
  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'linkedin':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200 uppercase tracking-tighter">
            LinkedIn
          </span>
        );
      case 'naukri':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white uppercase tracking-tighter">
            Naukri
          </span>
        );
      case 'foundit':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200 uppercase tracking-tighter">
            Foundit
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-750 border border-slate-200 uppercase tracking-tighter">
            Alert
          </span>
        );
    }
  };

  return (
    <div id="alerts-timeline-container" className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-sm flex flex-col h-full max-h-[580px]">
      
      {/* Header section with counts */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-150 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1 text-slate-800">
            <Bell className="w-4 h-4 pointer-events-none" />
          </div>
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider font-sans">
            Job Bulletins & Alerts Feed
          </h3>
        </div>
        <span className="text-[10px] bg-slate-100 text-slate-650 font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
          {alerts.length} Bulletin{alerts.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Main feed list */}
      <div className="overflow-y-auto mt-3.5 space-y-3 pr-1 flex-1 scrollbar-thin">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Sparkles className="w-8 h-8 text-slate-300 pointer-events-none mb-2" />
            <p className="text-xs font-semibold text-slate-500 font-sans">No job board bulletins or alert digests in queue.</p>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">Use Gmail sync or the sandbox parser to trigger recommendations.</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <motion.div
              id={`alert-card-${alert.id}`}
              key={alert.id}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="p-3.5 rounded-lg border border-slate-150 bg-slate-50/20 hover:bg-slate-50/60 transition-colors flex flex-col justify-between gap-2 border-l-4 border-l-slate-400"
            >
              <div>
                <div className="flex items-center justify-between gap-2 shrink-0">
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {getSourceBadge(alert.source)}
                    <span className="text-[9px] text-slate-400 font-mono">{alert.date}</span>
                  </div>
                  
                  {/* Actions to dismiss or apply directly */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      id={`apply-alert-btn-${alert.id}`}
                      onClick={() => onApplyAlert(alert)}
                      className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-55 rounded transition-colors cursor-pointer"
                      title="File in Pipeline"
                    >
                      <CheckCircle className="w-3.5 h-3.5 pointer-events-none" />
                    </button>
                    <button
                      id={`dismiss-alert-btn-${alert.id}`}
                      onClick={() => onDismissAlert(alert.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-55 rounded transition-colors cursor-pointer"
                      title="Dismiss Alert"
                    >
                      <Trash2 className="w-3.5 h-3.5 pointer-events-none" />
                    </button>
                  </div>
                </div>

                <h4 className="font-bold text-slate-900 text-xs mt-2.5 font-sans tracking-tight line-clamp-1">
                  {alert.title}
                </h4>
                <p className="text-[10px] font-semibold text-slate-500 font-sans">
                  {alert.company}
                </p>
                <p className="text-xs text-slate-650 font-sans mt-1.5 line-clamp-3 leading-snug">
                  {alert.snippet}
                </p>
              </div>

              {alert.link && (
                <div className="mt-1 pt-2 border-t border-slate-150 flex justify-end">
                  <a
                    id={`alert-link-${alert.id}`}
                    href={alert.link}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    <span>Inspect Post</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

    </div>
  );
}
