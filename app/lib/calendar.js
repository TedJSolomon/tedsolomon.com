/**
 * Google Calendar API helpers — server-side only.
 * Fetches events from the primary calendar and "the bun calendar" (if found),
 * merges them, and returns today/tomorrow split.
 */
import { getValidAccessToken, deleteTokens } from './googleAuth';

const BASE = 'https://www.googleapis.com/calendar/v3';

function toNYTime(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function mapEvent(ev, calendarKey, calendarLabel, calendarAccent) {
  const isAllDay  = !!ev.start?.date;
  const startIso  = ev.start?.dateTime ?? ev.start?.date;
  const endIso    = ev.end?.dateTime   ?? ev.end?.date;
  const startDate = new Date(startIso).toLocaleDateString('en-CA', {
    timeZone: 'America/New_York',
  });
  return {
    id:              ev.id,
    title:           ev.summary ?? '(No title)',
    location:        ev.location ?? null,
    isAllDay,
    startIso,
    endIso,
    startDate,
    startTime:       isAllDay ? null : toNYTime(startIso),
    endTime:         isAllDay ? null : toNYTime(endIso),
    color:           ev.colorId ?? null,
    calendarKey,    // 'primary' | 'bun'
    calendarLabel,  // null for primary, calendar name string for others
    calendarAccent, // hex color for left-border accent, null for primary
  };
}

export async function fetchCalendarEvents() {
  try {
    const token = await getValidAccessToken();
    if (!token) return { connected: false };

    const headers = { Authorization: `Bearer ${token}` };
    const now     = new Date();

    const nyDateStr = (d) =>
      new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(d);

    const todayDateStr    = nyDateStr(now);
    const tomorrowDateStr = nyDateStr(new Date(now.getTime() + 24 * 3_600_000));

    function nyMidnightUTC(isoDate) {
      const [y, m, d] = isoDate.split('-').map(Number);
      const base   = new Date(Date.UTC(y, m - 1, d));
      const nyHour = +new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York', hour: 'numeric', hour12: false,
      }).format(base);
      return new Date(base.getTime() + (24 - nyHour) * 3_600_000);
    }

    const todayStart  = nyMidnightUTC(todayDateStr);
    const tomorrowEnd = nyMidnightUTC(nyDateStr(new Date(now.getTime() + 48 * 3_600_000)));

    const params = new URLSearchParams({
      timeMin:      todayStart.toISOString(),
      timeMax:      tomorrowEnd.toISOString(),
      singleEvents: 'true',
      orderBy:      'startTime',
      maxResults:   '50',
    });

    // Calendar names to look up (case-insensitive substring match)
    const NAMED_CALENDARS = ['The Bun Calendar', 'Beck Tech'];

    // ── 1. Discover calendars via calendarList ────────────────────────────────
    let namedCals = []; // [{ id, summary, backgroundColor }, ...]
    try {
      const calListRes = await fetch(`${BASE}/users/me/calendarList`, {
        headers,
        cache: 'no-store',
      });
      if (calListRes.ok) {
        const calListData = await calListRes.json();
        const items = calListData.items ?? [];
        for (const name of NAMED_CALENDARS) {
          const match = items.find(
            (c) => !c.primary && c.summary?.toLowerCase().includes(name.toLowerCase())
          );
          if (match) namedCals.push(match);
        }
      }
    } catch {
      // calendarList failure is non-fatal — fall back to primary only
    }

    // ── 2. Fetch events from all calendars in parallel ────────────────────────
    const fetches = [
      fetch(`${BASE}/calendars/primary/events?${params}`, { headers, cache: 'no-store' }),
      ...namedCals.map((cal) =>
        fetch(
          `${BASE}/calendars/${encodeURIComponent(cal.id)}/events?${params}`,
          { headers, cache: 'no-store' }
        )
      ),
    ];

    const [primaryRes, ...namedRes] = await Promise.all(fetches);

    // 401 on primary = revoked token
    if (primaryRes.status === 401) {
      await deleteTokens();
      return { connected: false };
    }
    if (!primaryRes.ok) {
      const err = await primaryRes.json().catch(() => ({}));
      return { connected: true, error: err?.error?.message ?? `Calendar API ${primaryRes.status}` };
    }

    // ── 3. Merge events from all calendars ────────────────────────────────────
    const allItems = [];

    const primaryData = await primaryRes.json();
    for (const ev of primaryData.items ?? []) {
      allItems.push(mapEvent(ev, 'primary', null, null));
    }

    for (let i = 0; i < namedCals.length; i++) {
      const res = namedRes[i];
      if (!res?.ok) continue;
      const data   = await res.json();
      const cal    = namedCals[i];
      const accent = cal.backgroundColor ?? '#F6BF26';
      for (const ev of data.items ?? []) {
        allItems.push(mapEvent(ev, cal.id, cal.summary, accent));
      }
    }

    // Sort merged list by start ISO string (all-day "YYYY-MM-DD" sorts before dateTime of same day)
    allItems.sort((a, b) => (a.startIso ?? '').localeCompare(b.startIso ?? ''));

    const today    = allItems.filter((e) => e.startDate === todayDateStr);
    const tomorrow = allItems.filter((e) => e.startDate === tomorrowDateStr);

    return { connected: true, today, tomorrow };
  } catch (err) {
    const msg = err?.message ?? String(err);
    if (msg.includes('does not exist') || msg.includes('no rows')) {
      return { connected: false };
    }
    return { connected: false, error: msg };
  }
}
