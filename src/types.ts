/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  status: 'applied' | 'assessment' | 'interview' | 'offer' | 'rejected' | 'other';
  source: 'gmail' | 'linkedin' | 'naukri' | 'foundit' | 'manual';
  date: string; // ISO string or simple date phrase
  snippet: string;
  pendingAssessment: boolean;
  assessmentDetails: string | null;
  replyReceived: boolean;
  notes?: string;
  emailId?: string; // Reference to gmail message ID
  updatedAt: string;
}

export interface JobAlert {
  id: string;
  title: string;
  company: string;
  source: 'linkedin' | 'naukri' | 'foundit' | 'other';
  date: string;
  snippet: string;
  link: string | null;
  status: 'new' | 'seen' | 'applied';
}

export interface GmailSyncStatus {
  connected: boolean;
  email: string | null;
  lastSynced: string | null;
  isLoading: boolean;
}

export interface ParserResponse {
  applications: Omit<JobApplication, 'id' | 'updatedAt'>[];
  jobAlerts: Omit<JobAlert, 'id' | 'status'>[];
}
