# PRD: Dashboard Auth — Signed Session Tokens

## Problem
The dashboard auth currently stores the raw `DASHBOARD_SECRET` in the browser cookie, which means anyone who finds the cookie has permanent access to the dashboard. A single secret with no expiration or revocation mechanism is a security risk for a personal site holding income and private notes.

## Goal / success
- Auth protects the `/dashboard` with a signed, expiring session token instead of the raw secret.
- Login UX stays identical: password prompt, same styling, same redirect behavior.
- Logout clears the session (at minimum, removes the cookie; optionally prevents login during that deploy cycle).
- No multi-user or OAuth scope change.
- Lint + build pass, acceptance criteria met, no console errors, security review CLEAR, CEO approved the preview.

## Scope — in
- **Token generation & verification**: HMAC-SHA256 signed token using Web Crypto API. Payload includes `iat` (issued-at), `exp` (expiry), `sessionId` (random 32-char string), and `version` (for key rotation). Token is URL-safe Base64 encoded.
- **Middleware check**: verify token signature and expiry in `middleware.js` (renamed to `proxy.js` per CLAUDE.md task). Constant-time comparison for HMAC verification.
- **Cookie attributes**: httpOnly, secure in prod, sameSite lax, path `/`, maxAge 7 days (recommend; open question for CEO).
- **Login action**: on password match, generate a new signed token, set it in the `auth-token` cookie, redirect to `/dashboard` (or the `from` param if safe).
- **Logout**: a server action `app/logout/actions.js` and a small logout button/link in the dashboard that calls it. The action clears the `auth-token` cookie. No database revocation table in scope (see Scope — out). Existing sessions on production deployment become invalid when the signing key changes (or after TTL expires).
- **Signing key strategy**: recommend a separate `SESSION_SECRET` env var instead of reusing `DASHBOARD_SECRET` (see below). List both options with trade-offs in the design spec or PR, for the CEO to decide at Gate 1.

## Scope — out
- Multi-user sessions or session revocation table (Supabase `dashboard_sessions`). Logout clears the cookie only; no server-side record.
- Session rotation or refresh tokens. Single token per login; lasts 7 days or until logout.
- Persistent "remember me" or sliding expiration. Session expires 7 days from login, period.
- Admin panel or session management UI. No listing/terminating other sessions.
- OAuth or passwordless login. Password-only, as today.
- Tests or integration with Playwright. QA will write tests separately.

## User stories
- **As Ted,** I want to log in with a password, so I can access my dashboard.
- **As Ted,** I want my session to expire automatically after a week, so I don't have to worry about old cookies being valid forever.
- **As Ted,** I want to log out, so I can immediately end my session and clear the cookie.
- **As Ted,** I want the login page to remember where I came from (the `from` param), so I can go back to the page I was viewing after I log in. _(nice-to-have)_

## Acceptance criteria
1. **Token generation**: login action creates an HMAC-SHA256 signed token with `iat`, `exp`, `sessionId`, and `version` fields. Token is URL-safe Base64 encoded and fits in a cookie.
2. **Token verification**: middleware verifies the token signature using constant-time comparison. If invalid or expired, redirect to `/login?from=<path>`.
3. **Cookie attributes**: `auth-token` cookie is httpOnly, secure (in prod), sameSite lax, path `/`, maxAge 604800 (7 days). Cookie is not accessible to JavaScript.
4. **Signing key**: separate `SESSION_SECRET` env var is defined and used to sign tokens (or document the trade-offs if reusing `DASHBOARD_SECRET`).
5. **Logout endpoint**: `POST /api/logout` or `app/logout/actions.js` server action exists and clears the `auth-token` cookie. Calling it logs out the user.
6. **Logout UI**: dashboard has a logout button/link (in the header, footer, or navigation). Clicking it calls the logout action and redirects to `/login` or `/`.
7. **No data leakage**: token is not logged or exposed in error messages. `SESSION_SECRET` is never shipped in the bundle.
8. **Redirect `from` param**: after login, if `from` is a safe relative path (starts with `/`, not `//`, no `://`), redirect to `from`. Otherwise, redirect to `/dashboard`.
9. **No expired cookie display**: when a cookie expires, middleware catches it before rendering the page; user sees `/login`, not a broken dashboard.
10. **Build & lint**: `npm run build` and `npm run lint` pass (lint fix is part of tech-hygiene but needed for this to pass).

## Constraints
- **Stack**: Next.js 16.2, JavaScript, Web Crypto API for signing (runs in middleware, no third-party lib).
- **Env vars**: new `SESSION_SECRET` recommended (or decide to reuse `DASHBOARD_SECRET`). Set by CEO in `.env.local` (dev) and Vercel env settings (prod). Never in git.
- **Deadline**: no specific deadline given; prioritize after tech-hygiene lint fix.
- **Content/DDL**: no new Supabase tables or DDL in scope. No CEO-provided content needed.
- **Data sensitivity**: `/dashboard` holds income and private notes. Auth changes are Medium priority for security.

## Open questions
1. **TTL**: recommend 7 days (matches current maxAge). Accept or propose a different duration?
2. **Signing key**: recommend a separate `SESSION_SECRET` env var to allow rotation independent of `DASHBOARD_SECRET`. Trade-offs:
   - **Separate `SESSION_SECRET`**: new env var, clearer intent, easier key rotation, but one more secret to manage.
   - **Reuse `DASHBOARD_SECRET`**: one secret, simpler initially, but ties auth to the login password and harder to rotate without breaking auth.
   - **Decision**: separate, recommend.
3. **Logout revocation**: recommend clearing cookie only (logout button clears `auth-token`). No server-side session table. Accept, or prefer a Supabase `dashboard_sessions` table checked on each request? (Adds DB call per request, requires manual DDL, but allows revocation before TTL expires.)
   - **Decision**: cookie-only for this PR; session table as a follow-up if needed.
4. **"Remember me" or session persistence**: out of scope. User logs in once per 7 days. Acceptable?

## Notes
- **Middleware rename**: `middleware.js` → `proxy.js` is a separate known issue in tech-hygiene, but the middleware code is part of this PRD.
- **Signing algorithm**: HMAC-SHA256 is sufficient for a single-user personal dashboard. No need for asymmetric keys.
- **Token storage**: not in localStorage; cookie only. HttpOnly prevents XSS leakage.
- **Logout redirection**: After logout, redirect to `/` (home) or `/login`. Recommend `/` for UX (logged-out user lands on public site).
