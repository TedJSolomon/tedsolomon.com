# Security Review — dashboard-auth

**Diff reviewed:** `git diff chore/adopt-team...HEAD` (branch `feature/dashboard-auth`)
**Verdict: CLEAR WITH NOTES**

No Critical or High findings. The signed-session redesign is a clear improvement over the previous raw-secret cookie (no expiry, cookie value equaled the password itself). Implementation is fail-closed, constant-time where it matters, and the open-redirect surface on `from` is closed.

## Findings

| # | Severity | Location | Risk | Fix |
|---|----------|----------|------|-----|
| 1 | Medium | `app/login/actions.js` (`login`) | No rate limiting or lockout on the login server action. Single-user password site is brute-forceable by an automated client hitting the server action repeatedly (Vercel doesn't rate-limit this by default). | Add a basic per-IP or global rate limit (e.g. Vercel Edge Config counter, or a simple in-memory/Upstash token bucket) and/or a short delay-on-failure. Not a blocker for a personal site with a strong password, but worth a follow-up ticket. |
| 2 | Low | `app/lib/session.js` `verifySessionToken` | No check that `iat` is not in the future / no leeway on `exp`; a token with a manipulated (but correctly-signed — not exploitable without the key) or clock-skewed timestamp has no tolerance window. Purely theoretical since the token is HMAC-signed and the server is the only issuer. | No action required; noting for completeness. |
| 3 | Low | `app/lib/session.js` `getSigningKey` caching | The derived key is cached in module scope keyed by the current `secret` value. If `DASHBOARD_SECRET` is rotated in a long-lived process without a redeploy, the old key could remain cached until the value is re-read from `process.env` and differs. In practice Vercel functions restart on env var changes/redeploys, so this is not currently exploitable. | No action required; documents the assumption for future maintainers. |
| 4 | Info (pre-existing, out of scope) | `middleware.js` matcher (`/dashboard/:path*`) vs. `app/api/calendar/events/route.js` | `/api/calendar/events` returns Ted's calendar data with no auth check and is not covered by the dashboard matcher — it's reachable by anyone who requests the URL directly. This predates this branch (matcher scope is unchanged by this diff) but is personal data exposure worth flagging. `app/api/mets`, `/news`, `/weather` are public, non-sensitive data and fine unauthenticated. `/api/keep-alive` already checks `CRON_SECRET`. | Follow-up ticket: gate `/api/calendar/events` behind the same session check (import `verifySessionToken` and check the cookie), or fold it under `/dashboard/api/*` so the matcher covers it. |

## What was checked and is fine

- **`app/lib/session.js`**: token format `base64url(JSON payload).base64url(HMAC-SHA256 signature)`. Verification order is correct (verify signature via `crypto.subtle.verify` before trusting/parsing payload fields... actually signature is verified over the raw `payloadPart` bytes, then payload is decoded only after signature passes) — no way to get JSON.parse to run on unverified attacker data that then gets acted on beyond type checks. All parsing (base64url decode, JSON.parse) is wrapped in try/catch; any exception or unexpected shape returns `null`. Missing `DASHBOARD_SECRET` fails closed (`getSigningKey` returns `null` → `verifySessionToken` returns `null`). `crypto.subtle.verify` for HMAC is constant-time by design (WebCrypto spec), so no timing side-channel on signature comparison.
- **`middleware.js`**: `await`s `verifySessionToken`, treats any falsy result (missing cookie, bad signature, expired, malformed) as unauthenticated and redirects to `/login?from=<path>`. Fail-closed.
- **`app/login/actions.js`**:
  - Password comparison (`constantTimeEquals`) hashes both operands with SHA-256 and does a fixed-length XOR-accumulate compare with no early exit — constant-time regardless of where a mismatch occurs. Reasonable for a single shared password.
  - `safeFromPath` only allows redirect targets that start with `/dashboard`, reject `//` (protocol-relative) and backslashes — closes the open-redirect vector on the `from` query param that flows from `app/login/page.js` into the hidden form field back into `redirect()`.
  - Session token is never logged; only stored in the httpOnly cookie.
  - `logout()` clears the cookie and redirects to `/`. No explicit CSRF token, but Next.js Server Actions verify the `Origin` header against the deployment host for POST submissions, which mitigates cross-site triggering; impact of a forced logout is low (self-inflicted logout, not data exposure) even if that protection were bypassed.
- **`app/dashboard/layout.js`**: logout is a plain `<form action={logout}>` with a submit button — works without JS, no client-side token handling, no data leakage.
- **`scripts/test-session.mjs`**: no real secrets committed. The one place `DASHBOARD_SECRET` appears is a usage comment (`DASHBOARD_SECRET=test-secret node ...`) with an obviously-fake placeholder value, and tests otherwise rely on `process.env.DASHBOARD_SECRET` set by whoever runs them. Test 7 ("Missing DASHBOARD_SECRET fails closed") is a no-op/placeholder that doesn't actually exercise the fail-closed path — flagged for QA/follow-up but not a security issue.
- **Cookie flags**: `httpOnly: true`, `secure` in production, `sameSite: 'lax'`, `path: '/'`, `maxAge` matches the 12h TTL. Consistent with the CEO's decisions below.
- **Dependencies**: no new packages added in this diff; `npm audit --omit=dev` not re-run here since nothing in `package.json` changed on this branch.

## Accepted risks (CEO decisions, PRD Gate 1 — not re-flagged as findings)
- TTL is 12 hours (down from 7 days), matching cookie `maxAge`.
- Signing key is derived from `DASHBOARD_SECRET` via HMAC (`HMAC-SHA256(DASHBOARD_SECRET, "dashboard-session-v1")`) rather than a separate `SESSION_SECRET`. Rotating the login password invalidates all sessions, which is intended.
- Logout clears the cookie only; no server-side revocation table. A copied/stolen token remains valid until it expires (max 12h) or the password is rotated.
- Single-user system; no RBAC or per-user session scoping needed.

## Needs a human decision
- Whether to open a follow-up ticket now for rate-limiting the login action (Medium, #1) and for gating `/api/calendar/events` (pre-existing exposure, #4), or defer both to the tech-hygiene backlog.
