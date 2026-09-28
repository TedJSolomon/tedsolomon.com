'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSessionToken, sessionCookieOptions, SESSION_COOKIE } from '../lib/session';

const encoder = new TextEncoder();

// Compares two strings in constant time by hashing both (so length itself
// doesn't leak via early-exit comparison) and comparing the fixed-length
// digests byte-by-byte without short-circuiting.
async function constantTimeEquals(a, b) {
  const [digestA, digestB] = await Promise.all([
    globalThis.crypto.subtle.digest('SHA-256', encoder.encode(a)),
    globalThis.crypto.subtle.digest('SHA-256', encoder.encode(b)),
  ]);
  const bytesA = new Uint8Array(digestA);
  const bytesB = new Uint8Array(digestB);

  let diff = 0;
  for (let i = 0; i < bytesA.length; i++) {
    diff |= bytesA[i] ^ bytesB[i];
  }
  return diff === 0;
}

// Only honor the `from` redirect target if it's a safe, relative /dashboard path.
function safeFromPath(from) {
  if (
    typeof from === 'string' &&
    from.startsWith('/dashboard') &&
    !from.startsWith('//') &&
    !from.includes('\\')
  ) {
    return from;
  }
  return '/dashboard';
}

export async function login(prevState, formData) {
  const password = formData.get('password');
  const secret = process.env.DASHBOARD_SECRET;

  if (!password || !secret || !(await constantTimeEquals(password, secret))) {
    return { error: 'Incorrect password.' };
  }

  const token = await createSessionToken();
  if (!token) {
    return { error: 'Login is not configured. Try again later.' };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions);

  redirect(safeFromPath(formData.get('from')));
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect('/');
}
