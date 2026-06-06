/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { JobApplication, JobAlert } from './types';

export const SAMPLE_EMAIL_TEMPLATES = [
  {
    name: 'HackerRank test (Stripe)',
    text: `Subject: Action Required: Complete your Stripe Technical Assessment
From: candidate@stripe.com
Date: June 3, 2026

Dear candidate,
Thank you for submitting your application. We invite you to complete our online software engineering assessment.
The assessment is hosted on HackerRank. You will have 90 minutes to complete the tasks.

Test link: https://hackerrank.com/test/stripe-eval-2026
Deadline: Please complete this within 5 days (Latest by June 12, 2026).`
  },
  {
    name: 'Interview Invite (Uber)',
    text: `Subject: Uber Scheduling: Next steps on your interview!
From: tech-recruiter@uber.com
Date: June 4, 2026

Hi Vishal,
Thanks for chatting with our lead screening officer. We are pleased to move you to the Technical System Design round!
This will be a 45-minute virtual technical video interview discussing caching strategies, front-end optimization, and state management.

Please select a convenient time on my Calendly: https://calendly.com/uber/tech-round`
  },
  {
    name: 'Rejection mail (Spotify)',
    text: `Subject: Spotify - Your Application for Software Engineer
From: no-reply@spotify.com
Date: June 1, 2026

Thank you for taking the time to talk with our team at Spotify.
While we were impressed by your technical skill, we have chosen to advance other candidates whose backgrounds more closely match our immediate goals.
Best of luck on your search!`
  },
  {
    name: 'LinkedIn Job Alert',
    text: `Subject: LinkedIn Jobs - 15 new matches for "React Developer"
From: jobalerts-noreply@linkedin.com
Date: June 4, 2026

LinkedIn Jobs

Hi Vishal, here are today's top matching jobs for your search:
- Frontend Engineer at Atlassian (React, Tailwind, Motion)
- UI Architect at Accenture (Design systems specialist, 8+ years)
- Generative AI Engineer at Anthropic`
  },
  {
    name: 'Naukri alerts',
    text: `Subject: Naukri Job Alert - Top companies hiring React / Node developers
From: alerts@naukri.com
Date: June 3, 2026

Naukri FastForward matching alerts:
- Senior UI Developer at Swiggy (Location: Bangalore / Hybrid)
- Staff Engineer at Meesho (React-native experience preferred)
Apply directly on naukri.com to speed up recruitment process.`
  }
];

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
