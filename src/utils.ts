/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { JobApplication, JobAlert } from './types';

export const SAMPLE_EMAIL_TEMPLATES: { name: string, text: string }[] = [];

export function getStoredApplications(): JobApplication[] {
  const data = localStorage.getItem('job_tracker_applications');
  if (!data) {
    return [];
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export function saveStoredApplications(apps: JobApplication[]) {
  localStorage.setItem('job_tracker_applications', JSON.stringify(apps));
}

export function getStoredAlerts(): JobAlert[] {
  const data = localStorage.getItem('job_tracker_alerts');
  if (!data) {
    return [];
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export function saveStoredAlerts(alerts: JobAlert[]) {
  localStorage.setItem('job_tracker_alerts', JSON.stringify(alerts));
}
