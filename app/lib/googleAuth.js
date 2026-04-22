/**
 * Google OAuth helpers — server-side only.
 * Tokens are stored in Supabase table `google_tokens` (single-row, keyed by user='default').
 */
import { createServerClient } from './supabase';

const CLIENT_ID     = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const TOKEN_URL     = 'https://oauth2.googleapis.com/token';

// ── Token storage (Supabase) ─────────────────────────────────

export async function saveTokens({ access_token, refresh_token, expires_in }) {
  const db = createServerClient();
  const expires_at = new Date(Date.now() + expires_in * 1000).toISOString();
  const { error } = await db
    .from('google_tokens')
    .upsert({ user_id: 'default', access_token, refresh_token, expires_at }, { onConflict: 'user_id' });
  if (error) throw new Error(`saveTokens: ${error.message}`);
}

export async function loadTokens() {
  const db = createServerClient();
  const { data, error } = await db
    .from('google_tokens')
    .select('access_token, refresh_token, expires_at')
    .eq('user_id', 'default')
    .single();
  if (error || !data) return null;
  return data;
}

export async function deleteTokens() {
  const db = createServerClient();
  await db.from('google_tokens').delete().eq('user_id', 'default');
}

// ── Token refresh ────────────────────────────────────────────

async function refreshAccessToken(refresh_token) {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'refresh_token',
      client_id:     CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token,
    }),
  });
  if (!res.ok) throw new Error(`Token refresh failed: ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(`Token refresh error: ${json.error}`);
  return json;
}

// ── Get a valid access token (refresh if needed) ─────────────

export async function getValidAccessToken() {
  const tokens = await loadTokens();
  if (!tokens) return null;

  const { access_token, refresh_token, expires_at } = tokens;
  const expiresAt = new Date(expires_at).getTime();
  const bufferMs  = 5 * 60 * 1000; // refresh 5 min early

  if (Date.now() + bufferMs < expiresAt) {
    return access_token;
  }

  // Need refresh
  if (!refresh_token) return null;
  const refreshed = await refreshAccessToken(refresh_token);
  await saveTokens({
    access_token:  refreshed.access_token,
    refresh_token: refreshed.refresh_token ?? refresh_token, // Google may not return a new one
    expires_in:    refreshed.expires_in ?? 3600,
  });
  return refreshed.access_token;
}
