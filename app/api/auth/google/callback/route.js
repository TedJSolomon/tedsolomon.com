import { NextResponse } from 'next/server';
import { saveTokens } from '../../../../lib/googleAuth';

const CLIENT_ID     = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

export async function GET(request) {
  const requestUrl  = new URL(request.url);
  const origin      = requestUrl.origin;
  const redirectUri = `${origin}/api/auth/google/callback`;

  const code  = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');

  console.log('[google/callback] hit — code present:', !!code, '| error:', error ?? 'none');

  if (error || !code) {
    console.log('[google/callback] aborting — access denied or no code');
    return NextResponse.redirect(
      new URL('/dashboard?cal_error=access_denied', request.url)
    );
  }

  try {
    console.log('[google/callback] exchanging code for tokens, redirect_uri:', redirectUri);
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id:     CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri:  redirectUri,
        grant_type:    'authorization_code',
      }),
    });

    if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
    const json = await res.json();
    if (json.error) throw new Error(json.error_description ?? json.error);

    console.log('[google/callback] tokens received — access_token present:', !!json.access_token, '| refresh_token present:', !!json.refresh_token);

    await saveTokens({
      access_token:  json.access_token,
      refresh_token: json.refresh_token,
      expires_in:    json.expires_in ?? 3600,
    });

    console.log('[google/callback] tokens saved to Supabase — redirecting to /dashboard');

    // Hard redirect — clears any stale JS/CSS state, ensures full page reload
    const dashboardUrl = new URL('/dashboard', request.url);
    const response = NextResponse.redirect(dashboardUrl, { status: 302 });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (err) {
    console.error('[google/callback] error:', err.message);
    return NextResponse.redirect(
      new URL(`/dashboard?cal_error=${encodeURIComponent(err.message)}`, request.url)
    );
  }
}
