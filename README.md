# GrouPulse

**A platform for group facilitators to prepare sessions, document them, and turn that documentation into AI-generated summaries and insights.**

GrouPulse helps moderators who run support and therapy groups keep everything in one place: group and participant management, session preparation, attendance and notes during the session, and an analytics center that surfaces patterns across sessions with the **Google Gemini API**. Institutes get an overview of all their groups, moderators, and participants.

> The interface is in **Hebrew (RTL)**.

## Features

**For moderators**
- Registration, login, and password reset (Supabase Auth)
- Dashboard with activity metrics and alerts
- Create groups and add participants
- Session preparation: session goals and an AI-suggested focus for the session
- Session log: group documentation, attendance checklist, and individual notes per participant
- AI-generated session summary with Google Gemini, ready to print or download
- Participant profile: AI analysis, progress graph, and all notes collected across sessions
- Calendar of upcoming and past sessions
- Analytics center: periodic report, group cohesion, per-participant analytics, and AI pattern detection (printable)
- Settings: profile, display, and security

**For institutes**
- Institute dashboard with an overview of groups, moderators, and participants
- Analytics across the institute's groups

## Tech Stack

| Area | Technology |
|---|---|
| Framework | Next.js (App Router), React, TypeScript |
| Styling | Tailwind CSS, RTL layout |
| Database and auth | Supabase (PostgreSQL, Auth) |
| AI | Google Gemini API (`@google/genai`, `gemini-2.5-flash`) |
| UI libraries | react-calendar, lucide-react |

## How the AI Part Works

AI requests go through a server-side route (`app/api/gen-summary`), so the Gemini API key is never exposed to the browser. The route retries when the model is temporarily busy and returns clear error codes for quota limits and model overload, which the UI handles gracefully.

## Project Structure

```
app/
  (auth)/          login, register, reset password
  api/gen-summary/ Gemini API route
  dashboard/       moderator dashboard
  groups/          create groups, preparation, session log, AI summary
  participants/    participant profile
  calendar/        session calendar
  analytics/       analytics center
  institute/       institute views (groups, moderators, participants)
  settings/        profile, display, security
components/ui/     shared navigation components
lib/               Supabase client
types/             shared TypeScript types
```

## Getting Started

### Prerequisites

- Node.js 20 or later
- A [Supabase](https://supabase.com) project
- A [Google Gemini API key](https://aistudio.google.com/apikey)

### Installation

```bash
git clone https://github.com/EttyGotlib/GrouPulse.git
cd GrouPulse
npm install
```

### Environment variables

Create a `.env.local` file in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

`.env.local` is listed in `.gitignore` and must never be committed.

### Database

The app expects these tables in your Supabase project: `Profiles`, `Groups`, `Participants`, `Sessions`, and `Individual_Notes`.

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts: `npm run build`, `npm run start`, `npm run lint`.

## Known Limitations

- AI summaries are generated on demand and are not stored in the database. A moderator can download them, or regenerate them from the session documentation saved in the database.
- Known bug: using the app in two browser tabs at the same time can mix up data.
- The app uses Gemini's free tier, so requests are subject to a quota.

## Team

GrouPulse was developed as a team project by four developers.
