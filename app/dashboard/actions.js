'use server';

import { createServerClient } from '../lib/supabase';

function todayET() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
}

export async function saveDailyFocus(priority1, priority2, priority3) {
  const supabase = createServerClient();
  const today = todayET();
  const { error } = await supabase
    .from('daily_focus')
    .upsert(
      {
        date: today,
        priority_1: priority1 || null,
        priority_2: priority2 || null,
        priority_3: priority3 || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'date' }
    );
  if (error) throw new Error(error.message);
}
