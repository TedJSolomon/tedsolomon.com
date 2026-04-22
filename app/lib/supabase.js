import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');

/**
 * Server-side client using the service role key.
 * Bypasses RLS — use only in server components and server actions.
 */
export function createServerClient() {
  if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

/**
 * Browser-safe client using the anon key.
 * Respects RLS — use only in client components if ever needed.
 */
export function createBrowserClient() {
  if (!anonKey) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
  return createClient(url, anonKey);
}
