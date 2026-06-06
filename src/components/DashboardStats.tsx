/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { JobApplication } from '../types';

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

  // Let's calculate some nice dynamic subtitle tags like "+1 this week" to make it lively
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
    <div id="stats bg-density-row" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-1 shrink-0">
      
      {/* 1. Total Applications */}
      <div id="stat-total" className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <p className="text-xs text-slate-500 uppercase font-black tracking-wider font-sans">Total Applications</p>
        <div className="flex items-baseline justify-between mt-2.5">
          <p className="text-3xl font-black text-slate-900 tracking-tight">{total}</p>
          {appliedThisWeek > 0 && (
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-sans">
              +{appliedThisWeek} new this week
            </span>
          )}
        </div>
      </div>

      {/* 2. Replies Received */}
      <div id="stat-replies" className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <p className="text-xs text-slate-500 uppercase font-black tracking-wider font-sans">Replies Received</p>
        <div className="flex items-baseline justify-between mt-2.5">
          <p className="text-3xl font-black text-slate-900 tracking-tight">{repliesReceived}</p>
          <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-sans">
            Level Active
          </span>
        </div>
      </div>

      {/* 3. Pending Assessments */}
      <div id="stat-assessments" className="bg-amber-50/70 p-4.5 rounded-xl border border-amber-200 shadow-sm flex flex-col justify-between">
        <p className="text-xs text-amber-850 uppercase font-black tracking-wider font-sans">Pending Assessments</p>
        <div className="flex items-baseline justify-between mt-2.5">
          <p className="text-3xl font-black text-amber-900 tracking-tight">{pendingAssessments}</p>
          {pendingAssessments > 0 && (
            <span className="text-[10px] font-black tracking-widest bg-amber-500 text-white px-2 py-0.5 rounded animate-pulse">
              ACTION REQUIRED
            </span>
          )}
        </div>
      </div>

      {/* 4. Conversion Rate */}
      <div id="stat-conversion" className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <p className="text-xs text-slate-500 uppercase font-black tracking-wider font-sans">Offers / Conversion Rate</p>
        <div className="flex items-baseline justify-between mt-2.5">
          <p className="text-3xl font-black text-slate-900 tracking-tight">{conversionRate}%</p>
          <span className="text-[11px] font-mono font-semibold text-slate-500">
            {offersCount} Offer{offersCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

    </div>
  );
}
