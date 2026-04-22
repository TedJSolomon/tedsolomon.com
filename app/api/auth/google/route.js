import { NextResponse } from 'next/server';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

export async function GET(request) {
  const origin      = new URL(request.url).origin;
  const redirectUri = `${origin}/api/auth/google/callback`;

  const params = new URLSearchParams({
    client_id:     CLIENT_ID,
    redirect_uri:  redirectUri,
    response_type: 'code',
    scope:         'https://www.googleapis.com/auth/calendar.readonly',
    access_type:   'offline',
    prompt:        'consent', // always get refresh_token
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  );
}
