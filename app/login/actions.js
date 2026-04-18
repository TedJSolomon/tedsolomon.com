'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(prevState, formData) {
  const password = formData.get('password');
  const secret = process.env.DASHBOARD_SECRET;

  if (!password || password !== secret) {
    return { error: 'Incorrect password.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('auth-token', secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect('/dashboard');
}
