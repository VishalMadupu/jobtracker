<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Job Application Tracker

An automated and intelligent Job Application Tracker designed to streamline the job hunt process. 

## 🎯 What We Want to Achieve

The primary goal of this application is to consolidate and automate the tracking of job applications across multiple platforms. Instead of manually updating spreadsheets or checking different platform dashboards, this tool will act as a central hub for all your job hunting activities.

### Key Objectives
- **Centralized Dashboard**: A single place to view all applied jobs, their current statuses, and upcoming interviews or tasks.
- **Automated Tracking**: Minimize manual entry by integrating with popular job boards and communication channels.
- **Status Updates**: Keep track of where you are in the hiring pipeline for each role (e.g., Applied, Screening, Interview, Offered, Rejected).
- **Analytics & Insights**: Understand application success rates, response times, and identify which platforms yield the best results.

## 🔄 Application Flow & Integrations

The application will integrate with major job portals and email services to fetch and update application data seamlessly.

### 1. LinkedIn Integration
- **Flow**: Parse application confirmations from LinkedIn or use browser extensions to track jobs applied for via "Easy Apply" or external links.
- **Goal**: Automatically log company name, role, application date, and job description directly into the tracker.

### 2. Naukri Integration
- **Flow**: Monitor Naukri profile activity or parse email alerts for successful applications.
- **Goal**: Sync applied jobs, recruiter messages, and profile views directly into the tracker.

### 3. Foundit (formerly Monster) Integration
- **Flow**: Similar to Naukri, track applications sent through the Foundit platform.
- **Goal**: Maintain a consistent log of all Foundit applications and their respective statuses.

### 4. Email Integration (Gmail/Outlook)
- **Flow**: The core of the automated status updates. The application will scan specific incoming emails for keywords (e.g., "application received", "interview invitation", "offer letter", "unfortunately").
- **Goal**: Automatically move applications through the pipeline based on email communications with recruiters, saving you the hassle of manual status updates.

## 🚀 Future Scope
- **Chrome Extension**: To allow users to easily save a job listing from any website directly into the tracker with one click.
- **AI Resume Matching**: Suggest improvements to your resume based on the job description of the tracked application.
- **Interview Scheduling**: Parse interview invites and automatically add them to your calendar.

---

## 💻 Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set the `GEMINI_API_KEY` and other necessary integration keys in `.env` or `.env.local`
3. Run the app:
   ```bash
   npm run dev
   ```
