# Status — tedsolomon.com

_Last updated: 2026-09-27 by orchestrator_

## Now
- _adopt-team_ — branch `chore/adopt-team` — stage: PR — onboarding docs (CLAUDE.md, STATUS.md, docs folders)

## Waiting on CEO
- 🛑 Gate 4 for _adopt-team_ — review and merge the onboarding PR

## Next up
1. **tech-hygiene**: fix `npm run lint` (Next 16 removed `next lint`; add ESLint flat config + `eslint .` script), `npm audit` fixes, rename `middleware.js` → `proxy.js`, remove legacy static files (root `*.html`, `blog/`, `css/`, `memory/`) and test data (`content/wins/2026-04-16-fdgfdg.md`), harden dashboard auth (cookie currently stores the raw `DASHBOARD_SECRET`; use a signed/hashed session token). Auth change → gate.
2. **blog**: real blog on `/blog` with MDX posts, index + post pages, in the void/chrome style.
3. Meeting Cost Calculator phase 4: Supabase dashboards, auth, RBAC (see `meeting-cost-calculator-requirements.md`). New data model + auth → Gate 3.
4. Add a basic test setup (Playwright is installed but unused) and a `test` script.

## Shipped
- 2026-09 — Reveal viewport fix; double-animation fix on navigation; /about full page with portrait + timeline
- 2026-09 — Public site redesign (void/chrome aesthetic, animated shell); /contact and /blog restyled
- 2026-06-19 — Transcription: rush job upcharge
- 2026-06-17 — Transcription dashboard (`/dashboard/transcription`)
- 2026-05 — Meeting Cost Calculator phases 0–3

## Known issues
- `npm run lint` fails with "Invalid project directory … /lint" because `next lint` was removed in Next 16 and there's no ESLint config — Medium — `package.json`
- `npm audit`: 6 vulnerabilities (1 critical, 4 high, 1 moderate) — High — dependencies
- Build warns that the `middleware` file convention is deprecated, so it should use `proxy` — Low — `middleware.js`
- Dashboard auth compares the cookie to the raw `DASHBOARD_SECRET`, so the secret itself is stored in the browser — Medium — `middleware.js`, `app/login/actions.js`
- No automated tests — Medium — repo
- Leftover static site files and a junk test win in the repo — Low — repo root, `content/wins/`
- `npm run build` passes (Next 16.2.4, 28 routes).

## Asana follow-ups
- CEO to create an Asana project for tedsolomon.com. Then add its link to CLAUDE.md and backfill the Next up items.

## Decisions log
- 2026-09-27 — Adopted the project under the agent team — standard pipeline from here on
- 2026-09-27 — void/chrome is the working design system (mostly locked, changes via Gate 2) — CEO preference
- 2026-06 — Schema changes are applied by hand in the Supabase SQL editor — no DDL access from the repo
