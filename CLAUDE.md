# tedsolomon.com

> Project memory for the agent team. The team's global rules live in `~/.claude/CLAUDE.md`. Keep this file short and current.

## Client & goal
- **Client:** Ted Solomon (personal site). Product Manager at Beck Technology.
- **Audience:** (1) Public: recruiters, peers and collaborators checking out Ted as a PM and builder. (2) Private: Ted himself, using `/dashboard` as a personal command center.
- **Primary goal:** A career brand site plus private tools. Both matter equally.
- **Success looks like:** The public pages clearly show Ted's work and writing, and the dashboard is useful every day and reliable.

## Links
- Repo: https://github.com/TedJSolomon/tedsolomon.com
- Production: https://tedsolomon.com · Vercel project: `tedsolomon-com`
- Asana project: _none yet. CEO to create one later (see STATUS.md)._
- Supabase SQL editor (manual DDL): https://supabase.com/dashboard/project/yzgfpteoyyubfmmlixbz/sql

## Stack & conventions
- Framework: Next.js 16.2 (App Router, Turbopack) · React 19 · **JavaScript, not TypeScript** · Styling: plain CSS (`app/globals.css`, `app/dashboard/dashboard.css`, per-feature CSS files) plus some inline styles. No Tailwind.
- Libraries: `motion` (animation), `lenis` (smooth scroll), `chart.js` + `react-chartjs-2`, `@supabase/supabase-js`. Dev: `playwright`, `pg`.
- Package manager: npm · Scripts: `npm run dev` / `build` / `lint` (**lint is broken**, see STATUS) · no test script yet.
- Folders: `app/` (routes), `app/components/` (public-site components), `app/lib/` (data access and helpers, Supabase queries), `app/dashboard/<feature>/` (page + `actions.js` server actions + client components), `app/api/` (route handlers), `app/tools/` (public tools), `supabase/schema.sql` (DB schema of record), `content/wins/` (legacy markdown wins).
- Auth: `middleware.js` guards `/dashboard/*` by checking the `auth-token` cookie against `DASHBOARD_SECRET`. Login lives at `app/login/`. Google OAuth (Calendar) is under `app/api/auth/google/*`.
- Data: Supabase (wins, goals, one-on-ones, wishlist + share tokens, transcription jobs). **There is no DDL access from the repo.** Schema changes mean updating `supabase/schema.sql` and asking the CEO to paste the SQL into the Supabase SQL editor.
- External APIs: OpenWeather, GNews, Google Calendar, MLB (Mets). A Vercel cron hits `/api/keep-alive` every day (`vercel.json`).
- Env var names (values live in `.env.local` and Vercel, never in git): `DASHBOARD_SECRET`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_OPENWEATHER_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GNEWS_API_KEY`, `CRON_SECRET`.
- Legacy: the root `index.html`, `about.html`, `contact.html`, `projects.html`, `blog/`, `css/` and `memory/` are from the pre-Next static site and are not used by the app.

## Brand
- Design system: **"void/chrome"**. Dark, near-black void with chrome/steel metallics and an amber accent. Mostly locked, but changes are welcome through Gate 2.
- Colors: `--void #07090C`, `--surface #0E1218`, `--steel #2A3441`, `--chrome #C8D2DE`, `--chrome-dark #7A8798`, `--accent #e8a838` (amber). Tokens are in `app/globals.css`.
- Fonts (`next/font/google`): DM Serif Display (display), JetBrains Mono (labels/meta), Outfit (body).
- Tone: confident, concise, a little dry and technical. It's a PM who ships.
- Assets: `public/` (for example `public/ted.jpg` portrait).
- Motion: page transitions and reveal-on-scroll (`PageTransition`, `Reveal`, `RevealGroup`). Must honor `prefers-reduced-motion`.

## Pages / features
- [x] Public: `/` home (hero, about, projects, blog, contact sections), `/about` (portrait + timeline), `/projects`, `/contact`, `/blog` (shell only)
- [x] `/tools/meeting-cost-calculator` (phases 0–3: ticker, recap, tone toggle, tips, receipt)
- [x] `/dashboard` overview (boot sequence, bento cards, calendar timeline, weather, news, Mets, daily focus)
- [x] `/dashboard/wins`, `/goals`, `/one-on-ones`, `/wishlist` (+ public `/wishlist/[share_token]`), `/transcription` (court-reporting job tracker with rush/proofreading pay), `/export`
- [ ] Real blog with MDX posts
- [ ] Tech hygiene (lint, audit, proxy migration, legacy cleanup, auth hardening)
- [ ] Meeting Cost Calculator phase 4 (Supabase dashboards, auth, RBAC). Spec is in `meeting-cost-calculator-requirements.md`.

## Client-specific rules
- `/dashboard` holds personal data (1:1 notes, income from transcription work). Any change to auth, the middleware/proxy, share tokens or data exposure needs a gate.
- DB schema changes: update `supabase/schema.sql` and give the CEO the exact SQL to run by hand.
- Keep the void/chrome look consistent. New public pages reuse the existing tokens and components.

## Definition of done
Lint + build pass · acceptance criteria met · works at 375/768/1280px · AA contrast · no console errors · security review CLEAR or CLEAR WITH NOTES · CEO approved the preview.
