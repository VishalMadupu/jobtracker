/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, Plus, RefreshCw, Radio, FileCheck, CheckCircle2, Video, AlertCircle, Sparkles } from 'lucide-react';

interface GoogleCalendarPanelProps {
  token: string | null;
  onConnectGoogle: () => void;
}

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  htmlLink?: string;
}

export default function GoogleCalendarPanel({ token, onConnectGoogle }: GoogleCalendarPanelProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Event creation form state
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventSummary, setEventSummary] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventDuration, setEventDuration] = useState('45'); // minutes
  const [eventDescription, setEventDescription] = useState('');
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch calendar events
  const fetchCalendarEvents = useCallback(async (accessToken: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const now = new Date().toISOString();
      const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?orderBy=startTime&singleEvents=true&timeMin=${now}&maxResults=8`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        throw new Error(`Google Calendar API responded with status ${response.status}`);
      }

      const data = await response.json();
      setEvents(data.items || []);
    } catch (err: any) {
      console.error('Error fetching calendar events:', err);
      setErrorMsg(err.message || 'Failed to fetch calendar events check scopes or try reconnecting.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch events on token status
  useEffect(() => {
    if (token) {
      fetchCalendarEvents(token);
    } else {
      setEvents([]);
    }
  }, [token, fetchCalendarEvents]);

  // Create event action
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!eventSummary || !eventDate || !eventTime) {
      setErrorMsg('Please specify a title date and start time.');
      return;
    }

    const confirmed = window.confirm(
      `Do you want to schedule this new event "${eventSummary}" directly in your Google Calendar?`
    );
    if (!confirmed) return;

    setIsCreatingEvent(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Build start and end dates
      const startDateTimeStr = `${eventDate}T${eventTime}:00`;
      const startDateTime = new Date(startDateTimeStr);
      
      if (isNaN(startDateTime.getTime())) {
        throw new Error('Invalid date-time formatting specified.');
      }

      const durationMinutes = parseInt(eventDuration, 10) || 45;
      const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60 * 1000);

      const eventPayload = {
        summary: eventSummary,
        description: eventDescription || 'Scheduled via Enterprise Job Tracker Hub',
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
        }
      };

      const url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventPayload)
      });

      if (!response.ok) {
        throw new Error(`Calendar API rejected entry with status ${response.status}`);
      }

      setSuccessMsg(`"${eventSummary}" successfully created on your Google Calendar!`);
      setEventSummary('');
      setEventDescription('');
      setShowEventForm(false);
      
      // Refresh list
      fetchCalendarEvents(token);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to write session event.');
    } finally {
      setIsCreatingEvent(false);
    }
  };

  const formatEventTime = (dateTimeStr?: string, dateStr?: string) => {
    if (dateTimeStr) {
      try {
        const d = new Date(dateTimeStr);
        return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      } catch {
        return dateTimeStr;
      }
    }
    return dateStr || 'All Day';
  };

  return (
    <div id="google-calendar-container" className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-sm flex flex-col h-full max-h-[580px]">
      
      {/* Header section with counts */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-150 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1 text-sky-600">
            <Calendar className="w-4 h-4 pointer-events-none" />
          </div>
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider font-sans">
            Google Calendar Sync
          </h3>
        </div>
        {token && (
          <button
            id="open-event-form-btn"
            onClick={() => setShowEventForm(!showEventForm)}
            className="text-[10px] bg-slate-900 text-white font-black px-2 py-0.5 rounded-full hover:bg-slate-700 hover:shadow-xs transition-colors cursor-pointer uppercase tracking-tight flex items-center gap-0.5"
          >
            <Plus className="w-2.5 h-2.5" /> Book Interview
          </button>
        )}
      </div>

      {/* Main Display Area */}
      <div className="flex-1 overflow-y-auto mt-3 space-y-3 pr-1 scrollbar-thin">
        
        {/* Error Notification */}
        {errorMsg && (
          <div className="p-2.5 bg-rose-50 border border-rose-100 text-[11px] text-rose-800 rounded-lg flex items-start gap-1.5 font-sans">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Notification */}
        {successMsg && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-100 text-[11px] text-emerald-800 rounded-lg flex items-start gap-1.5 font-sans">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Create Event Dialog form overlay */}
        {showEventForm && (
          <motion.form
            id="calendar-quick-add-form"
            onSubmit={handleCreateEvent}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3"
          >
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-sans">Schedule Google Event</h4>
            
            <div className="space-y-2">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase">Event Summary / Title</label>
                <input
                  id="cal-title-input"
                  type="text"
                  required
                  placeholder="e.g. Interview with Uber (Technical Design)"
                  value={eventSummary}
                  onChange={(e) => setEventSummary(e.target.value)}
                  className="w-full mt-1 p-1.5 bg-white border border-slate-200 rounded-md text-xs font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase">Start Date</label>
                  <input
                    id="cal-date-input"
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full mt-1 p-1.5 bg-white border border-slate-200 rounded-md text-xs font-sans"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase">Start Time</label>
                  <input
                    id="cal-time-input"
                    type="time"
                    required
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full mt-1 p-1.5 bg-white border border-slate-200 rounded-md text-xs font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase">Duration</label>
                  <select
                    id="cal-duration-select"
                    value={eventDuration}
                    onChange={(e) => setEventDuration(e.target.value)}
                    className="w-full mt-1 p-1.5 bg-white border border-slate-200 rounded-md text-xs font-sans"
                  >
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    id="cal-submit-btn"
                    type="submit"
                    disabled={isCreatingEvent}
                    className="w-full h-8.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    {isCreatingEvent ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Clock className="w-3 h-3" />}
                    <span>Confirm Event</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase">Notes / Prep Details</label>
                <textarea
                  id="cal-desc-input"
                  placeholder="Paste links, virtual meet details, or checklist coordinates..."
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  className="w-full mt-1 p-1.5 bg-white border border-slate-200 rounded-md text-[11px] font-sans h-12"
                />
              </div>
            </div>
          </motion.form>
        )}

        {/* Token Authentication check */}
        {!token ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Radio className="w-8 h-8 text-slate-300 pointer-events-none mb-2 animate-pulse" />
            <p className="text-xs font-semibold text-slate-500 font-sans">Google Calendar access is waiting authorization.</p>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5 max-w-[280px] mx-auto">
              Authorize your Google workspace above or in Gmail Sync panel to sync and create interview reminders live on your Google account.
            </p>
            <button
              id="calendar-connect-btn"
              onClick={onConnectGoogle}
              className="mt-3.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer"
            >
              Sign In to Google Space
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-2">
            <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
            <p className="text-xs text-slate-450 font-sans">Connecting to live calendar queries...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Sparkles className="w-8 h-8 text-slate-300 pointer-events-none mb-2" />
            <p className="text-xs font-semibold text-slate-500 font-sans">No upcoming schedule calendar entries found.</p>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">Click "Book Interview" at the top to schedule a new test reminder!</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 px-1">Upcoming events schedule</div>
            {events.map((event) => {
              const hasVideo = event.location?.includes('zoom') || event.location?.includes('meet') || event.summary.toLowerCase().includes('interview');
              
              return (
                <div
                  id={`cal-event-${event.id}`}
                  key={event.id}
                  className="p-3 bg-slate-50/50 border border-slate-150 hover:bg-slate-50 rounded-lg flex flex-col gap-1 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <h5 className="text-[11px] font-bold text-slate-900 font-sans tracking-tight leading-tight line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {event.summary}
                    </h5>
                    {hasVideo && (
                      <span className="text-[9px] text-sky-600 bg-sky-50 px-1 py-0.2 rounded font-semibold inline-flex items-center gap-0.5 scale-90">
                        <Video className="w-2.5 h-2.5 text-sky-500 inline-block pointer-events-none" /> virtual
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-350" />
                      {formatEventTime(event.start.dateTime, event.start.date)}
                    </span>
                    {event.htmlLink && (
                      <a
                        id={`cal-event-link-${event.id}`}
                        href={event.htmlLink}
                        target="_blank"
                        referrerPolicy="no-referrer"
                        rel="noreferrer"
                        className="text-[9px] font-bold text-slate-400 hover:text-slate-800 transition-colors uppercase"
                      >
                        Inspect
                      </a>
                    )}
                  </div>

                  {event.description && (
                    <div className="text-[9px] text-slate-450 truncate mt-0.5 leading-none">
                      {event.description}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
