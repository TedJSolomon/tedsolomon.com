# Status — tedsolomon.com

_Last updated: 2026-09-28 by orchestrator_

## Now
- _(nothing in progress)_

## Waiting on CEO
- _(nothing pending)_

## Next up
1. **protect-api-routes** (TOP PRIORITY): require the session token on `/api/calendar/events` and all `/api/auth/google/*` routes; keep the Google OAuth callback working. Auth change → gate. ([Asana](https://app.asana.com/1/201180046394194/project/1218933205708679/task/1218933044915528))
2. **login-rate-limit**: limit repeated password guesses on the login page (`app/login/actions.js`); prefer no new services or env vars. Auth change → gate. ([Asana](https://app.asana.com/1/201180046394194/project/1218933205708679/task/1218933044003375))
3. **tech-hygiene**: fix `npm run lint` (Next 16 removed `next lint`; add ESLint flat config + `eslint .` script), `npm audit` fixes, rename `middleware.js` → `proxy.js`, remove legacy static files (root `*.html`, `blog/`, `css/`, `memory/`) and test data (`content/wins/2026-04-16-fdgfdg.md`). ([Asana](https://app.asana.com/0/1218933205708679/1218930620653479))
4. **blog**: real blog on `/blog` with MDX posts, index + post pages, in the void/chrome style. ([Asana](https://app.asana.com/0/1218933205708679/1218929254764744))
5. Meeting Cost Calculator phase 4: Supabase dashboards, auth, RBAC (see `meeting-cost-calculator-requirements.md`). New data model + auth → Gate 3. ([Asana](https://app.asana.com/0/1218933205708679/1218932538065674))
6. Add a basic test setup (Playwright is installed but unused) and a `test` script. ([Asana](https://app.asana.com/0/1218933205708679/1218932537971235))

## Shipped
- 2026-09-28 — Dashboard auth: signed 12h session token (key derived from `DASHBOARD_SECRET`), logout button, safe `from` redirect ([#2](https://github.com/TedJSolomon/tedsolomon.com/pull/2))
- 2026-09-27 — Agent team onboarding docs ([#1](https://github.com/TedJSolomon/tedsolomon.com/pull/1))
- 2026-09 — Reveal viewport fix; double-animation fix on navigation; /about full page with portrait + timeline
- 2026-09 — Public site redesign (void/chrome aesthetic, animated shell); /contact and /blog restyled
- 2026-06-19 — Transcription: rush job upcharge
- 2026-06-17 — Transcription dashboard (`/dashboard/transcription`)
- 2026-05 — Meeting Cost Calculator phases 0–3

## Known issues
- `/api/calendar/events` returns personal calendar data with no auth, and `/api/auth/google/*` (incl. disconnect) look unguarded; not covered by the `/dashboard/:path*` matcher — High — `app/api/` → _protect-api-routes_
- Login has no rate limiting (brute-force) — Medium — `app/login/actions.js` → _login-rate-limit_
- `npm run lint` fails with "Invalid project directory … /lint" because `next lint` was removed in Next 16 and there's no ESLint config — Medium — `package.json`
- `npm audit`: 6 vulnerabilities (1 critical, 4 high, 1 moderate) — High — dependencies
- Build warns that the `middleware` file convention is deprecated, so it should use `proxy` — Low — `middleware.js`
- No automated tests (only `scripts/test-session.mjs`) — Medium — repo
- Leftover static site files and a junk test win in the repo — Low — repo root, `content/wins/`
- `npm run build` passes (Next 16.2.4).

## Decisions log
- 2026-09-28 — API route protection and login rate limiting split into separate follow-ups, protect-api-routes first — CEO call at dashboard-auth wrap-up
- 2026-09-27 — dashboard-auth: 12h HMAC-signed session token, key derived from DASHBOARD_SECRET, logout clears cookie (no DB table) — CEO wants zero manual work; single user
- 2026-09-27 — Created Asana project "tedsolomon.com — Website"; one task per Next up item, moved through sections as work progresses — keep Asana and STATUS.md in sync
- 2026-09-27 — Adopted the project under the agent team — standard pipeline from here on
- 2026-09-27 — void/chrome is the working design system (mostly locked, changes via Gate 2) — CEO preference
- 2026-06 — Schema changes are applied by hand in the Supabase SQL editor — no DDL access from the repo
