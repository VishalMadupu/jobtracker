/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { JobApplication } from '../types';

interface ManualAddFormProps {
  onClose: () => void;
  onAdd: (app: JobApplication) => void;
}

export default function ManualAddForm({ onClose, onAdd }: ManualAddFormProps) {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState<JobApplication['status']>('applied');
  const [source, setSource] = useState<JobApplication['source']>('manual');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [snippet, setSnippet] = useState('');
  const [pendingAssessment, setPendingAssessment] = useState(false);
  const [assessmentDetails, setAssessmentDetails] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;

    const newApp: JobApplication = {
      id: `manual-${Date.now()}`,
      company: company.trim(),
      role: role.trim(),
      status,
      source,
      date,
      snippet: snippet.trim() || `Manually tracked application to ${company.trim()}`,
      pendingAssessment,
      assessmentDetails: pendingAssessment && assessmentDetails.trim() ? assessmentDetails.trim() : null,
      replyReceived: status === 'interview' || status === 'offer',
      notes: notes.trim(),
      updatedAt: new Date().toISOString()
    };

    onAdd(newApp);
  };

  return (
    <div id="manual-add-backdrop" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div
        id="manual-add-modal"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 font-sans tracking-tight text-lg">
            Add New Job Application
          </h3>
          <button
            id="close-manual-add-btn"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5 pointer-events-none" />
          </button>
        </div>

        <form id="manual-add-form" onSubmit={handleSubmit} className="p-5 space-y-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 font-sans tracking-wider">
                Company Name *
              </label>
              <input
                id="input-company"
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Stripe, Google"
                className="w-full mt-1.5 p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-1 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 font-sans tracking-wider">
                Role Name *
              </label>
              <input
                id="input-role"
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Frontend Engineer"
                className="w-full mt-1.5 p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-1 focus:ring-indigo-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 font-sans tracking-wider">
                Pipeline Status
              </label>
              <select
                id="select-status"
                value={status}
                onChange={(e) => {
                  const val = e.target.value as JobApplication['status'];
                  setStatus(val);
                  if (val === 'assessment') {
                    setPendingAssessment(true);
                  }
                }}
                className="w-full mt-1.5 p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-1 focus:ring-indigo-400"
              >
                <option value="applied">Applied</option>
                <option value="assessment">Assessment Invitation</option>
                <option value="interview">Interview Rounds</option>
                <option value="offer">Offered</option>
                <option value="rejected">Rejected</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 font-sans tracking-wider">
                Lead Source
              </label>
              <select
                id="select-source"
                value={source}
                onChange={(e) => setSource(e.target.value as JobApplication['source'])}
                className="w-full mt-1.5 p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-1 focus:ring-indigo-400"
              >
                <option value="manual">Manual Entry</option>
                <option value="linkedin">LinkedIn Job</option>
                <option value="naukri">Naukri.com</option>
                <option value="foundit">Foundit</option>
                <option value="gmail">Gmail Message</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 font-sans tracking-wider">
                Application Date
              </label>
              <input
                id="input-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full mt-1.5 p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-1 focus:ring-indigo-400 font-mono"
              />
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  id="checkbox-assessment"
                  type="checkbox"
                  checked={pendingAssessment}
                  onChange={(e) => setPendingAssessment(e.target.checked)}
                  className="w-4 h-4 rounded-sm text-indigo-600 border-slate-350 focus:ring-indigo-400"
                />
                <span className="text-sm text-slate-600 font-sans font-medium">Pending Assessment test?</span>
              </label>
            </div>
          </div>

          {pendingAssessment && (
            <div className="transition-all">
              <label className="block text-xs font-bold uppercase text-slate-400 font-sans tracking-wider">
                Assessment Details
              </label>
              <input
                id="input-assessment-details"
                type="text"
                value={assessmentDetails}
                onChange={(e) => setAssessmentDetails(e.target.value)}
                placeholder="e.g. HackerRank Coding Round - Deadline: June 15"
                className="w-full mt-1.5 p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-1 focus:ring-indigo-400"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 font-sans tracking-wider">
              Excerpt / Email Snippet Summary
            </label>
            <input
              id="input-snippet"
              type="text"
              value={snippet}
              onChange={(e) => setSnippet(e.target.value)}
              placeholder="e.g. Received automatic confirmation, profile submitted successfully."
              className="w-full mt-1.5 p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-1 focus:ring-indigo-400 pb-3"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 font-sans tracking-wider">
              Notes
            </label>
            <textarea
              id="textarea-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Review system design architectures. Interviewer mentioned emphasizing React state engines."
              className="w-full mt-1.5 p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-1 focus:ring-indigo-400 min-h-[80px]"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button
              id="cancel-manual-add"
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="submit-manual-add"
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md cursor-pointer transition-all"
            >
              Add Application
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
