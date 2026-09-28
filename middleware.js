import { NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from './app/lib/session';

export async function middleware(request) {
  const authToken = request.cookies.get(SESSION_COOKIE);
  const session = authToken ? await verifySessionToken(authToken.value) : null;

  if (!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
