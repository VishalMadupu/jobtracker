/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { JobApplication } from '../types';
import { BarChart3, PieChart, Activity, Target, Briefcase, CheckCircle2 } from 'lucide-react';

interface DashboardStatsProps {
  applications: JobApplication[];
}

export default function DashboardStats({ applications }: DashboardStatsProps) {
  const total = applications.length;
  
  const repliesReceived = applications.filter(
    (app) => app.replyReceived
  ).length;
  
  const pendingAssessments = applications.filter(
    (app) => app.pendingAssessment || app.status === 'assessment'
  ).length;
  
  const offersCount = applications.filter((app) => app.status === 'offer').length;
  const conversionRate = total > 0 ? Math.round((offersCount / total) * 100) : 0;

  // Source distribution
  const sources = {
    linkedin: applications.filter(app => app.source === 'linkedin').length,
    naukri: applications.filter(app => app.source === 'naukri').length,
    foundit: applications.filter(app => app.source === 'foundit').length,
    gmail: applications.filter(app => app.source === 'gmail').length,
    manual: applications.filter(app => app.source === 'manual').length,
  };

  // Status breakdown
  const statusCounts = {
    applied: applications.filter(app => app.status === 'applied').length,
    interview: applications.filter(app => app.status === 'interview').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
  };

  const appliedThisWeek = applications.filter(app => {
    try {
      const dateVal = new Date(app.date);
      const diffTime = Math.abs(new Date().getTime() - dateVal.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    } catch {
      return false;
    }
  }).length;

  return (
    <div className="space-y-6">
      <div id="stats-row" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-1">
        
        {/* 1. Total Applications */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 uppercase font-black tracking-wider font-sans">Total Pipeline</p>
            <Briefcase className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline justify-between mt-2.5">
            <p className="text-3xl font-black text-slate-900 tracking-tight">{total}</p>
            {appliedThisWeek > 0 && (
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-sans">
                +{appliedThisWeek} new
              </span>
            )}
          </div>
        </div>

        {/* 2. Response Rate */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 uppercase font-black tracking-wider font-sans">Response Rate</p>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline justify-between mt-2.5">
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              {total > 0 ? Math.round((repliesReceived / total) * 100) : 0}%
            </p>
            <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-sans">
              {repliesReceived} Replies
            </span>
          </div>
        </div>

        {/* 3. Pending Assessments */}
        <div className="bg-amber-50/70 p-4.5 rounded-xl border border-amber-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-xs text-amber-850 uppercase font-black tracking-wider font-sans">Tests Pending</p>
            <Target className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline justify-between mt-2.5">
            <p className="text-3xl font-black text-amber-900 tracking-tight">{pendingAssessments}</p>
            {pendingAssessments > 0 && (
              <span className="text-[10px] font-black tracking-widest bg-amber-500 text-white px-2 py-0.5 rounded animate-pulse">
                ACTION
              </span>
            )}
          </div>
        </div>

        {/* 4. Win Rate */}
        <div className="bg-emerald-50/50 p-4.5 rounded-xl border border-emerald-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-xs text-emerald-800 uppercase font-black tracking-wider font-sans">Offer Win Rate</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline justify-between mt-2.5">
            <p className="text-3xl font-black text-emerald-900 tracking-tight">{conversionRate}%</p>
            <span className="text-[11px] font-semibold text-emerald-700 font-sans">
              {offersCount} Offers
            </span>
          </div>
        </div>
      </div>

      {/* Advanced Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Distribution Bar Chart Representation */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-indigo-500" />
            <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">Source Distribution</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'LinkedIn', value: sources.linkedin, color: 'bg-blue-500' },
              { label: 'Naukri.com', value: sources.naukri, color: 'bg-slate-700' },
              { label: 'Foundit', value: sources.foundit, color: 'bg-purple-500' },
              { label: 'Gmail', value: sources.gmail, color: 'bg-red-500' },
              { label: 'Manual', value: sources.manual, color: 'bg-emerald-500' },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                  <span>{s.label}</span>
                  <span>{s.value}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`${s.color} h-full transition-all duration-500`} 
                    style={{ width: `${total > 0 ? (s.value / total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-4 h-4 text-indigo-500" />
            <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">Pipeline Breakdown</h3>
          </div>
          <div className="flex items-center gap-8 py-2">
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="text-xs font-bold text-slate-600">Applied</span>
                </div>
                <span className="text-xs font-black text-slate-900">{statusCounts.applied}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-xs font-bold text-slate-600">Interviews</span>
                </div>
                <span className="text-xs font-black text-slate-900">{statusCounts.interview}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-xs font-bold text-slate-600">Rejections</span>
                </div>
                <span className="text-xs font-black text-slate-900">{statusCounts.rejected}</span>
              </div>
            </div>
            <div className="w-24 h-24 rounded-full border-8 border-slate-50 flex items-center justify-center relative">
              <div className="text-[10px] font-black text-slate-400 uppercase">Stages</div>
              {/* Simple visual representation of status distribution */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 overflow-visible">
                {total > 0 && (
                  <>
                    <circle
                      cx="50%"
                      cy="50%"
                      r="40%"
                      className="fill-none stroke-indigo-500 stroke-[8]"
                      style={{ 
                        strokeDasharray: `${(statusCounts.applied / total) * 100} 100`,
                        strokeDashoffset: 0
                      }}
                    />
                    <circle
                      cx="50%"
                      cy="50%"
                      r="40%"
                      className="fill-none stroke-blue-500 stroke-[8]"
                      style={{ 
                        strokeDasharray: `${(statusCounts.interview / total) * 100} 100`,
                        strokeDashoffset: `-${(statusCounts.applied / total) * 100}`
                      }}
                    />
                  </>
                )}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
