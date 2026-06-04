/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Calendar, ClipboardCheck, Trash2, Edit3, MessageCircle, Link, Save, Briefcase, FileText } from 'lucide-react';
import { JobApplication } from '../types';

interface ApplicationDetailsProps {
  application: JobApplication;
  onClose: () => void;
  onUpdate: (app: JobApplication) => void;
  onDelete: (id: string) => void;
  googleToken: string | null;
  onConnectGoogle: () => void;
}

export default function ApplicationDetails({ application, onClose, onUpdate, onDelete, googleToken, onConnectGoogle }: ApplicationDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [company, setCompany] = useState(application.company);
  const [role, setRole] = useState(application.role);
  const [status, setStatus] = useState<JobApplication['status']>(application.status);
  const [notes, setNotes] = useState(application.notes || '');
  const [pendingAssessment, setPendingAssessment] = useState(application.pendingAssessment);
  const [assessmentDetails, setAssessmentDetails] = useState(application.assessmentDetails || '');
  const [snippet, setSnippet] = useState(application.snippet || '');

  const handleSave = () => {
    const updatedApp: JobApplication = {
      ...application,
      company: company.trim(),
      role: role.trim(),
      status,
      notes: notes.trim(),
      pendingAssessment,
      assessmentDetails: pendingAssessment && assessmentDetails.trim() ? assessmentDetails.trim() : null,
      replyReceived: status === 'interview' || status === 'offer' || application.replyReceived,
      snippet: snippet.trim(),
      updatedAt: new Date().toISOString()
    };
    onUpdate(updatedApp);
    setIsEditing(false);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'assessment':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'interview':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'offer':
        return 'bg-sky-50 text-sky-700 border-sky-100';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'linkedin':
        return 'bg-blue-50 text-blue-700';
      case 'naukri':
        return 'bg-cyan-50 text-cyan-700';
      case 'foundit':
        return 'bg-purple-50 text-purple-700';
      case 'gmail':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div id="details-backdrop" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div
        id="details-modal"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-50 rounded-lg text-slate-600">
              <FileText className="w-5 h-5 pointer-events-none" />
            </div>
            <h3 className="font-bold text-slate-800 font-sans tracking-tight text-lg">
              {isEditing ? 'Edit Application Details' : 'Application Logistics'}
            </h3>
          </div>
          <button
            id="close-details-btn"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5 pointer-events-none" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 font-sans tracking-wider">Company</label>
                  <input
                    id="edit-company"
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full mt-1.5 p-2 rounded-lg border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 font-sans tracking-wider">Role</label>
                  <input
                    id="edit-role"
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full mt-1.5 p-2 rounded-lg border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 font-sans tracking-wider">Status</label>
                <select
                  id="edit-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as JobApplication['status'])}
                  className="w-full mt-1.5 p-2 rounded-lg border border-slate-200 text-sm"
                >
                  <option value="applied">Applied</option>
                  <option value="assessment">Assessment</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  id="edit-pending-assessment"
                  type="checkbox"
                  checked={pendingAssessment}
                  onChange={(e) => setPendingAssessment(e.target.checked)}
                  className="w-4 h-4 rounded-sm border-slate-350"
                />
                <span className="text-xs font-semibold text-slate-600 font-sans">Pending technical test/assessment?</span>
              </div>

              {pendingAssessment && (
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 font-sans tracking-wider">Test Details</label>
                  <input
                    id="edit-assessment-details"
                    type="text"
                    value={assessmentDetails}
                    onChange={(e) => setAssessmentDetails(e.target.value)}
                    placeholder="Deadline, link, topic details..."
                    className="w-full mt-1.5 p-2 rounded-lg border border-slate-200 text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 font-sans tracking-wider">Metadata Summary / Snippet</label>
                <input
                  id="edit-snippet"
                  type="text"
                  value={snippet}
                  onChange={(e) => setSnippet(e.target.value)}
                  className="w-full mt-1.5 p-2 rounded-lg border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 font-sans tracking-wider">My Notes (Preparation / Tracking)</label>
                <textarea
                  id="edit-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full mt-1.5 p-2 rounded-lg border border-slate-200 text-sm min-h-[100px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  id="cancel-edit-btn"
                  onClick={() => setIsEditing(false)}
                  className="px-3.5 py-1.5 border border-slate-200 text-xs font-semibold rounded-lg text-slate-600"
                >
                  Cancel
                </button>
                <button
                  id="save-edit-btn"
                  onClick={handleSave}
                  className="px-3.5 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-slate-750 flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Profile Card Header */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(application.status)}`}>
                    {application.status}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getSourceBadge(application.source)}`}>
                    Linked via {application.source}
                  </span>
                </div>
                <h4 className="text-xl font-extrabold text-slate-800 font-sans mt-3 tracking-tight">
                  {application.company}
                </h4>
                <p className="text-sm font-semibold text-slate-500 font-sans mt-1">
                  {application.role}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-400 mt-4 pt-3 border-t border-slate-200/60 font-mono">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Filed: {application.date}
                  </div>
                  {application.replyReceived && (
                    <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                      <ClipboardCheck className="w-3.5 h-3.5" /> Recruiter Replied
                    </div>
                  )}
                </div>
              </div>

              {/* Google Calendar Interactive Booking widget */}
              {(application.status === 'interview' || application.status === 'assessment' || application.pendingAssessment) && (
                <div className="mt-4 p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-start gap-2 text-xs text-blue-800 font-sans">
                    <Calendar className="w-4.5 h-4.5 text-blue-500 shrink-0 mt-0.5 pointer-events-none" />
                    <div>
                      <span className="font-bold font-sans">Google Calendar Sync:</span>
                      <p className="text-[10px] text-blue-705 font-sans leading-relaxed mt-0.5">Publish this {application.status} milestone event directly to your live Google Schedule.</p>
                    </div>
                  </div>
                  <button
                    id="schedule-cal-entry-btn"
                    onClick={async () => {
                      if (!googleToken) {
                        onConnectGoogle();
                        return;
                      }
                      
                      const eventTitle = `${application.status.toUpperCase()} Prep: ${application.company} - ${application.role}`;
                      const confirmed = window.confirm(`Do you want to write a new event "${eventTitle}" on your Google Calendar?`);
                      if (!confirmed) return;

                      try {
                        const start = new Date();
                        // Schedule tomorrow morning at 10 AM by default
                        start.setDate(start.getDate() + 1);
                        start.setHours(10, 0, 0, 0);
                        const end = new Date(start.getTime() + 45 * 60 * 1000);

                        const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
                          method: 'POST',
                          headers: {
                            Authorization: `Bearer ${googleToken}`,
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({
                            summary: eventTitle,
                            description: `Interview Preparation Checklist:\n- Review job description: ${application.role}\n- Prep Company notes for: ${application.company}\n\nNotes logged so far:\n${application.notes || 'None'}\n\nSnippet summary: ${application.snippet || ''}`,
                            start: {
                              dateTime: start.toISOString(),
                              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
                            },
                            end: {
                              dateTime: end.toISOString(),
                              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
                            }
                          })
                        });

                        if (response.ok) {
                          alert(`Successfully scheduled "${eventTitle}" on your Google Calendar!`);
                        } else {
                          const errData = await response.json().catch(() => ({}));
                          throw new Error(errData.error?.message || `API error code ${response.status}`);
                        }
                      } catch (err: any) {
                        alert(`Failed to add calendar entry: ${err.message || err}`);
                      }
                    }}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold cursor-pointer shrink-0 transition-colors"
                  >
                    {!googleToken ? 'Pair Calendar' : 'Schedule Event'}
                  </button>
                </div>
              )}

              {/* Assessment notification */}
              {application.pendingAssessment && (
                <div className="mt-4 p-3 bg-amber-50/50 border border-amber-100 rounded-xl flex items-start gap-2.5 text-xs text-amber-800 font-sans">
                  <MessageCircle className="w-4 h-4 text-amber-500 shrink-0 pointer-events-none mt-0.5" />
                  <div>
                    <span className="font-bold">Pending Assessment round:</span>
                    <p className="text-[11px] text-amber-700 mt-0.5">{application.assessmentDetails || 'Requires immediate preparation.'}</p>
                  </div>
                </div>
              )}

              {/* Snippet summary info */}
              <div className="mt-4">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Email Summary / Notification Extract</span>
                <p className="text-xs text-slate-600 font-sans leading-relaxed mt-1">
                  {application.snippet}
                </p>
              </div>

              {/* Custom notes timeline */}
              <div className="mt-4">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Application Notes & Preparation Timeline</span>
                <div className="mt-1.5 p-3.5 bg-slate-50 border border-slate-150 rounded-xl relative">
                  {application.notes ? (
                    <p className="text-xs text-slate-600 font-sans whitespace-pre-wrap leading-relaxed">
                      {application.notes}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 font-sans italic">
                      No recruitment logging notes added yet. Click edit below to add notes about recruiters, preparation subjects, design architectures, or salary negotiations.
                    </p>
                  )}
                </div>
              </div>

              {/* Action buttons footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center flex-wrap gap-2">
                <button
                  id="delete-app-btn"
                  onClick={() => {
                    const ok = window.confirm(`Remove tracker record for ${application.company}? This cannot be undone.`);
                    if (ok) onDelete(application.id);
                  }}
                  className="px-3.5 py-1.5 hover:bg-rose-50 text-rose-500 hover:text-rose-600 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 shrink-0" /> Remove Record
                </button>

                <div className="flex gap-2">
                  <button
                    id="close-details-btn-2"
                    onClick={onClose}
                    className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-xs font-semibold rounded-lg text-slate-600 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    id="enter-edit-mode-btn"
                    onClick={() => setIsEditing(true)}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Details
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
