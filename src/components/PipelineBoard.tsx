/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, AlertTriangle, MessageSquare, List, LayoutGrid, FileText, Calendar, ArrowRight } from 'lucide-react';
import { JobApplication } from '../types';

interface PipelineBoardProps {
  applications: JobApplication[];
  onSelectApplication: (app: JobApplication) => void;
  onOpenManualAdd: () => void;
  selectedSource: string;
  setSelectedSource: (source: string) => void;
  selectedSmartFilter: string;
  setSelectedSmartFilter: (filter: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export default function PipelineBoard({
  applications,
  onSelectApplication,
  onOpenManualAdd,
  selectedSource,
  setSelectedSource,
  selectedSmartFilter,
  setSelectedSmartFilter,
  searchTerm,
  setSearchTerm,
}: PipelineBoardProps) {
  
  // High Density default view is 'table' matching the requested mockup
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  // Kanban lanes definition
  const columns: { id: JobApplication['status']; title: string; headingColor: string; colorClass: string }[] = [
    { id: 'applied', title: 'Applied', headingColor: 'border-l-4 border-indigo-500', colorClass: 'bg-indigo-50 text-indigo-700' },
    { id: 'assessment', title: 'Assessments', headingColor: 'border-l-4 border-amber-500', colorClass: 'bg-amber-50 text-amber-700 font-bold' },
    { id: 'interview', title: 'Interviews', headingColor: 'border-l-4 border-blue-500', colorClass: 'bg-blue-50 text-blue-700 font-bold' },
    { id: 'offer', title: 'Offers', headingColor: 'border-l-4 border-emerald-500', colorClass: 'bg-emerald-50 text-emerald-700 font-bold' },
    { id: 'rejected', title: 'Rejections', headingColor: 'border-l-4 border-rose-400', colorClass: 'bg-rose-50 text-rose-700' },
  ];

  // Filtering applications logic based on search, source, and sidebar smart filter
  const filteredApps = applications.filter((app) => {
    const matchesSearch = 
      app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.notes || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.snippet || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSource = selectedSource === 'all' || app.source === selectedSource;
    
    let matchesSmart = true;
    if (selectedSmartFilter === 'applied') {
      matchesSmart = app.status === 'applied';
    } else if (selectedSmartFilter === 'assessments') {
      matchesSmart = app.pendingAssessment || app.status === 'assessment';
    } else if (selectedSmartFilter === 'interviews') {
      matchesSmart = app.status === 'interview' || app.replyReceived;
    }

    return matchesSearch && matchesSource && matchesSmart;
  });

  const getSourceBadgeStyle = (source: string) => {
    switch (source) {
      case 'linkedin':
        return 'bg-blue-100 text-blue-700 border border-blue-200 ring-1 ring-blue-400/20';
      case 'naukri':
        return 'bg-slate-900 text-white border border-slate-700 ring-1 ring-slate-400/20';
      case 'foundit':
        return 'bg-purple-100 text-purple-700 border border-purple-200 ring-1 ring-purple-400/20';
      case 'gmail':
        return 'bg-red-50 text-red-700 border border-red-100 ring-1 ring-red-400/20';
      case 'manual':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-100 ring-1 ring-emerald-400/20';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'linkedin': return '🔗';
      case 'naukri': return '💼';
      case 'foundit': return '🔍';
      case 'gmail': return '📧';
      case 'manual': return '📝';
      default: return '📍';
    }
  };

  return (
    <div id="pipeline-board-container" className="bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden shadow-sm">
      
      {/* Top Header Controls bar */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/40 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Title and Active indicator */}
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-slate-800 tracking-tight">Application Pipeline</h2>
          <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded-full text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
            A.I. Active
          </div>
        </div>

        {/* Filters and search ribbon */}
        <div className="flex flex-1 items-center justify-end gap-3 flex-wrap">
          
          {/* Text search */}
          <div className="relative min-w-[180px] max-w-sm flex-1">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              id="search-pipeline-input"
              type="text"
              placeholder="Search jobs, skills, keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs font-sans pl-8.5 pr-3 py-1.8 rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Source filters selector */}
          <select
            id="source-filter-select"
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="p-1.5 border border-slate-200 rounded-lg text-xs font-sans bg-white focus:outline-hidden font-medium"
          >
            <option value="all">All Channels</option>
            <option value="linkedin">LinkedIn</option>
            <option value="naukri">Naukri.com</option>
            <option value="foundit">Foundit</option>
            <option value="gmail">Gmail</option>
            <option value="manual">Manual Log</option>
          </select>

          {/* View mode toggle switcher (High Density List vs Swimlanes) */}
          <div className="bg-slate-100 p-0.5 rounded-lg flex items-center border border-slate-200/80">
            <button
              id="set-view-table-btn"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md flex items-center gap-1 text-xs font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-slate-800 shadow-xs border border-slate-200/40'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Compact Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Compact Table</span>
            </button>
            <button
              id="set-view-kanban-btn"
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md flex items-center gap-1 text-xs font-semibold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white text-slate-800 shadow-xs border border-slate-200/40'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Kanban Columns View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kanban Board</span>
            </button>
          </div>

          {/* Manual Add Trigger Button */}
          <button
            id="manual-add-application-btn"
            onClick={onOpenManualAdd}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-1.8 px-3 rounded-lg flex items-center gap-1 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Record</span>
          </button>

        </div>
      </div>

      {/* Grid or Columns Main Renderer */}
      <div className="flex-1 overflow-hidden min-h-[460px]">
        {viewMode === 'table' ? (
          
          /* COMPACT HIGH DENSITY TABLE VIEW */
          <div className="flex flex-col h-full overflow-y-auto">
            
            {/* Table Header Row */}
            <div className="grid grid-cols-12 px-6 py-3 border-b border-slate-150 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              <div className="col-span-4">Job & Company</div>
              <div className="col-span-2 text-center">Source Profile</div>
              <div className="col-span-3">Pipeline Status Progress</div>
              <div className="col-span-2">Last Action Extract</div>
              <div className="col-span-1 text-right">Progress</div>
            </div>

            {/* Table Content List */}
            <div className="divide-y divide-slate-100 overflow-y-auto">
              {filteredApps.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <FileText className="w-10 h-10 text-slate-300 pointer-events-none mb-3" />
                  <p className="text-sm font-semibold text-slate-500 font-sans">No applications match the current active filters.</p>
                  <p className="text-xs text-slate-450 font-sans mt-1">Try to clear the search filter or change the selected sidebar category.</p>
                </div>
              ) : (
                filteredApps.map((app) => {
                  
                  // Stage mapping logic matching high density progress
                  let percent = 20;
                  let progressTitle = "Applied Stage";
                  let progressBarColor = "bg-slate-400";
                  let statusBadgeColor = "bg-slate-100 text-slate-500 uppercase";
                  let statusText = "SENT";

                  if (app.status === 'applied') {
                    percent = 20;
                    progressTitle = "Applied";
                    progressBarColor = "bg-slate-400";
                    statusBadgeColor = "text-[10px] font-black py-1 px-2 bg-slate-100 text-slate-500 rounded";
                    statusText = "SENT";
                  } else if (app.status === 'assessment') {
                    percent = 55;
                    progressTitle = "Assessment stage";
                    progressBarColor = "bg-amber-400";
                    statusBadgeColor = "text-[10px] font-black py-1 px-2 bg-amber-500 text-white rounded";
                    statusText = "TEST";
                  } else if (app.status === 'interview') {
                    percent = 85;
                    progressTitle = "Interview Scheduled";
                    progressBarColor = "bg-blue-500";
                    statusBadgeColor = "text-[10px] font-black py-1 px-2 bg-blue-100 text-blue-600 rounded";
                    statusText = "REPLY";
                  } else if (app.status === 'offer') {
                    percent = 100;
                    progressTitle = "Offer Extended";
                    progressBarColor = "bg-emerald-500";
                    statusBadgeColor = "text-[10px] font-black py-1 px-2 bg-emerald-500 text-white rounded";
                    statusText = "OFFER";
                  } else if (app.status === 'rejected') {
                    percent = 10;
                    progressTitle = "Rejection closed";
                    progressBarColor = "bg-rose-450";
                    statusBadgeColor = "text-[10px] font-black py-1 px-2 bg-rose-100 text-rose-500 rounded";
                    statusText = "CLOSED";
                  } else {
                    percent = 35;
                    progressTitle = "Active Progress";
                    progressBarColor = "bg-indigo-500";
                    statusBadgeColor = "text-[10px] font-black py-1 px-2 bg-indigo-100 text-indigo-700 rounded";
                    statusText = "ACTIVE";
                  }

                  const isRowHighlighted = app.pendingAssessment || app.status === 'assessment';

                  return (
                    <motion.div
                      id={`table-row-${app.id}`}
                      key={app.id}
                      onClick={() => onSelectApplication(app)}
                      className={`grid grid-cols-12 px-6 py-4 items-center hover:bg-slate-50/80 transition-colors cursor-pointer border-b border-slate-50 ${
                        isRowHighlighted ? 'bg-amber-50/20' : ''
                      }`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {/* Job & Company */}
                      <div className="col-span-4">
                        <div className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{app.role}</div>
                        <div className="text-xs text-slate-500 mt-0.5 font-sans">
                          {app.company}
                        </div>
                      </div>

                      {/* Source badge */}
                      <div className="col-span-2 flex justify-center">
                        <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-tighter ${getSourceBadgeStyle(app.source)}`}>
                          {app.source}
                        </span>
                      </div>

                      {/* Current Progress */}
                      <div className="col-span-3 pr-8">
                        <div className="flex justify-between text-[10px] mb-1 font-bold">
                          <span className={app.status === 'assessment' ? 'text-amber-600' : app.status === 'interview' ? 'text-blue-600' : app.status === 'offer' ? 'text-emerald-600' : 'text-slate-500'}>
                            {progressTitle}
                          </span>
                          <span>{percent}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`${progressBarColor} h-full transition-all duration-500`} style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>

                      {/* Last email/action summary */}
                      <div className="col-span-2 pr-4">
                        <div className="text-xs font-semibold text-slate-700 line-clamp-1" title={app.snippet}>
                          {app.snippet}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5 font-sans leading-none">
                          <Calendar className="w-3 h-3 text-slate-300 pointer-events-none shrink-0" />
                          <span>Filed: {app.date}</span>
                        </div>
                      </div>

                      {/* Type Label */}
                      <div className="col-span-1 text-right">
                        <span className={statusBadgeColor}>{statusText}</span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

          </div>
        ) : (
          
          /* TRADITIONAL KANBAN SWIMLANES VIEW (Optimized with High Density styling metrics) */
          <div id="swimlanes-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-0.5 bg-slate-150 p-0.5 overflow-x-auto min-h-[460px]">
            {columns.map((column) => {
              const columnApps = filteredApps.filter((app) => app.status === column.id);

              return (
                <div
                  id={`swimlane-col-${column.id}`}
                  key={column.id}
                  className="bg-white p-4 flex flex-col min-h-[460px]"
                >
                  {/* Column Header */}
                  <div className={`pb-2 mb-3 border-b border-slate-100 flex items-center justify-between ${column.headingColor}`}>
                    <h4 className="font-bold text-slate-800 text-xs font-sans tracking-tight uppercase">
                      {column.title}
                    </h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${column.colorClass}`}>
                      {columnApps.length}
                    </span>
                  </div>

                  {/* Cards inside column */}
                  <div className="space-y-2.5 overflow-y-auto flex-1 pr-1 scrollbar-thin">
                    {columnApps.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                        <p className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase font-sans">Empty</p>
                      </div>
                    ) : (
                      columnApps.map((app) => (
                        <div
                          id={`job-card-${app.id}`}
                          key={app.id}
                          onClick={() => onSelectApplication(app)}
                          className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs hover:border-slate-400 cursor-pointer transition-all flex flex-col justify-between gap-2 transform hover:-translate-y-0.5"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1">
                              <span className={`text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded ${getSourceBadgeStyle(app.source)}`}>
                                {app.source}
                              </span>
                              <span className="text-[9px] text-slate-400 font-mono">
                                {app.date}
                              </span>
                            </div>

                            <h5 className="font-bold text-slate-800 text-xs mt-2 font-sans tracking-tight line-clamp-1">
                              {app.role}
                            </h5>
                            <p className="text-[10px] font-semibold text-slate-500 font-sans line-clamp-1">
                              {app.company}
                            </p>
                          </div>

                          <div className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 font-sans leading-tight">
                            {app.snippet}
                          </div>

                          {/* Dynamic triggers display inside cards */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 mt-1">
                            {app.pendingAssessment && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-amber-700 bg-amber-50 px-1 py-0.5 rounded" title="Pending Assessment test">
                                <AlertTriangle className="w-2.5 h-2.5 text-amber-500 shrink-0" /> TEST
                              </span>
                            )}
                            {app.replyReceived && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-blue-700 bg-blue-50 px-1 py-0.5 rounded" title="Human response received">
                                <MessageSquare className="w-2.5 h-2.5 text-blue-500 shrink-0" /> REPLY
                              </span>
                            )}
                            {app.notes && (
                              <span className="inline-flex items-center text-[9px] font-bold text-slate-500 bg-slate-100 px-1 py-0.5 rounded" title="Has notes">
                                NOTE
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
