/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { JobApplication, JobAlert } from './types';

export const INITIAL_APPLICATIONS: JobApplication[] = [
  {
    id: 'demo-1',
    company: 'Google',
    role: 'Frontend Engineer, AI Studio',
    status: 'interview',
    source: 'linkedin',
    date: '2026-06-03',
    snippet: 'Hi Vishal, we loved your profile! Let us connect for an initial technical chat next Monday (June 8) via Google Meet.',
    pendingAssessment: false,
    assessmentDetails: null,
    replyReceived: true,
    notes: 'Preparing core Javascript concepts, CSS Flexbox/Grid, and systemic full-stack routing structures.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'demo-2',
    company: 'Stripe',
    role: 'Software Engineer II (Full-Stack)',
    status: 'assessment',
    source: 'gmail',
    date: '2026-06-01',
    snippet: 'Invitation to complete Stripe Technical Assessment. You have 7 days to finish this live coding exercise on HackerRank.',
    pendingAssessment: true,
    assessmentDetails: 'HackerRank test - Deadline: June 8, 2026 (90 mins)',
    replyReceived: false,
    notes: 'Need to review currency formatting algorithms and concurrent ledger event transaction safety.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'demo-3',
    company: 'Swiggy',
    role: 'Senior React Developer',
    status: 'applied',
    source: 'naukri',
    date: '2026-05-28',
    snippet: 'Your application for Swiggy - Senior React Developer has been successfully forwarded to the hiring team.',
    pendingAssessment: false,
    assessmentDetails: null,
    replyReceived: false,
    notes: 'Awaiting initial recruiter screening.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'demo-4',
    company: 'Razorpay',
    role: 'Frontend Architect',
    status: 'offer',
    source: 'foundit',
    date: '2026-05-25',
    snippet: 'Razorpay Offer Letter - We are thrilled to offer you the position of Frontend Architect. Let’s make transactions magical.',
    pendingAssessment: false,
    assessmentDetails: null,
    replyReceived: true,
    notes: 'Received draft offer with premium performance components. Scheduling a call to discuss joining dates.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'demo-5',
    company: 'Deel',
    role: 'React/Node Native Developer',
    status: 'rejected',
    source: 'linkedin',
    date: '2026-05-18',
    snippet: 'Thank you for your interest in Deel. Unfortunately, we have decided to move forward with other candidates at this time.',
    pendingAssessment: false,
    assessmentDetails: null,
    replyReceived: false,
    notes: 'They went with someone with higher mobile-native experience. Standard rejection, moving forward.',
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_ALERTS: JobAlert[] = [
  {
    id: 'alert-1',
    title: 'Senior Software Engineer, UI Platform',
    company: 'Atlassian',
    source: 'linkedin',
    date: '2026-06-04',
    snippet: 'Matching your key skills: React, TypeScript, Tailwinds CSS, System Design, Full-Stack Express. 12 mutual connections.',
    link: 'https://linkedin.com/jobs',
    status: 'new'
  },
  {
    id: 'alert-2',
    title: 'Design System Lead',
    company: 'Tech Mahindra',
    source: 'naukri',
    date: '2026-06-03',
    snippet: 'Urgent hiring for front-end visual architect. Experience creating comprehensive UI libraries for large scale enterprises.',
    link: 'https://naukri.com',
    status: 'new'
  },
  {
    id: 'alert-3',
    title: 'AI Interface Engineer',
    company: 'Cognizant',
    source: 'foundit',
    date: '2026-06-02',
    snippet: 'Foundit Hot Job Match! Position specializes in integrating generative models and optimizing model interactions on dashboards.',
    link: 'https://foundit.in',
    status: 'new'
  }
];

// Helper templates to make manual copy-pasting for testing extremely simple.
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
    localStorage.setItem('job_tracker_applications', JSON.stringify(INITIAL_APPLICATIONS));
    return INITIAL_APPLICATIONS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_APPLICATIONS;
  }
}

export function saveStoredApplications(apps: JobApplication[]) {
  localStorage.setItem('job_tracker_applications', JSON.stringify(apps));
}

export function getStoredAlerts(): JobAlert[] {
  const data = localStorage.getItem('job_tracker_alerts');
  if (!data) {
    localStorage.setItem('job_tracker_alerts', JSON.stringify(INITIAL_ALERTS));
    return INITIAL_ALERTS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_ALERTS;
  }
}

export function saveStoredAlerts(alerts: JobAlert[]) {
  localStorage.setItem('job_tracker_alerts', JSON.stringify(alerts));
}
