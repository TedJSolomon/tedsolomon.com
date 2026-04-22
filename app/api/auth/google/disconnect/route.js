import { NextResponse } from 'next/server';
import { deleteTokens } from '../../../../lib/googleAuth';

export async function GET(request) {
  await deleteTokens();
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
