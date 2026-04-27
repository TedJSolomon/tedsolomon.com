'use server';

import { createServerClient } from './supabase';

// ── Helpers ──────────────────────────────────────────────────────────────────

function todayET() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
}

function weekStartET() {
  const d   = new Date();
  const dow = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'America/New_York' }).format(d);
  // Days since Monday (Mon=0 … Sun=6)
  const offset = { Sun: 6, Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5 }[dow] ?? 0;
  const ws = new Date(d);
  ws.setDate(ws.getDate() - offset);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(ws);
}

// ── Increment a single field for today's row ──────────────────────────────────
// Silently no-ops on error so the calling action never fails because of tracking.
export async function incrementActivity(field) {
  try {
    const supabase = createServerClient();
    const today    = todayET();

    const { data } = await supabase
      .from('daily_activity')
      .select(field)
      .eq('date', today)
      .maybeSingle();

    if (data) {
      await supabase
        .from('daily_activity')
        .update({ [field]: (data[field] ?? 0) + 1 })
        .eq('date', today);
    } else {
      await supabase
        .from('daily_activity')
        .insert({ date: today, [field]: 1 });
    }
  } catch (err) {
    console.error('[dailyActivity] incrementActivity error:', err?.message);
  }
}

// ── Fetch all status-bar data ─────────────────────────────────────────────────
export async function fetchStatusData() {
  const supabase = createServerClient();
  const today    = todayET();
  const weekStart = weekStartET();

  // Ensure today's row exists (login marker)
  await supabase
    .from('daily_activity')
    .upsert({ date: today }, { onConflict: 'date', ignoreDuplicates: true });

  // Fetch last 60 days — enough headroom for streak calculation
  const sixtyAgo = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(
    new Date(Date.now() - 60 * 86_400_000)
  );

  const { data: rows } = await supabase
    .from('daily_activity')
    .select('date, wins_logged, subtasks_completed, goals_updated')
    .gte('date', sixtyAgo)
    .order('date', { ascending: false });

  const allRows = rows ?? [];
  const rowMap  = Object.fromEntries(allRows.map((r) => [r.date, r]));

  // ── Today ─────────────────────────────────────────────────────
  const todayRow = rowMap[today] ?? {};
  const wins     = todayRow.wins_logged        ?? 0;
  const subtasks = todayRow.subtasks_completed ?? 0;
  const goalUpds = todayRow.goals_updated      ?? 0;

  // ── Login streak (consecutive days where a row exists) ────────
  let loginStreak = 0;
  {
    const cur = new Date(today + 'T12:00:00');
    while (rowMap[new Intl.DateTimeFormat('en-CA').format(cur)]) {
      loginStreak++;
      cur.setDate(cur.getDate() - 1);
    }
  }

  // ── Win streak (consecutive days with wins_logged > 0) ────────
  let winStreak = 0;
  {
    const cur = new Date(today + 'T12:00:00');
    // If today has no wins yet, start checking from yesterday
    if (!wins) cur.setDate(cur.getDate() - 1);
    while (true) {
      const ds  = new Intl.DateTimeFormat('en-CA').format(cur);
      const row = rowMap[ds];
      if (!row || !(row.wins_logged > 0)) break;
      winStreak++;
      cur.setDate(cur.getDate() - 1);
    }
  }

  // ── Daily score ───────────────────────────────────────────────
  const streakBonus = Math.min(loginStreak * 5, 50);
  const dailyScore  = wins * 20 + subtasks * 10 + goalUpds * 10 + streakBonus;

  // ── Weekly momentum (target = 30 actions) ─────────────────────
  const weekTotal = allRows
    .filter((r) => r.date >= weekStart)
    .reduce(
      (s, r) => s + (r.wins_logged ?? 0) + (r.subtasks_completed ?? 0) + (r.goals_updated ?? 0),
      0
    );
  const momentum = Math.min(Math.round((weekTotal / 30) * 100), 100);

  return { dailyScore, winStreak, loginStreak, momentum };
}
