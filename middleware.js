import { NextResponse } from 'next/server';

export function middleware(request) {
  const authToken = request.cookies.get('auth-token');
  const secret = process.env.DASHBOARD_SECRET;

  if (!authToken || !secret || authToken.value !== secret) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
