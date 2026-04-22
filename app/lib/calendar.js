/**
 * Google Calendar API helpers — server-side only.
 */
import { getValidAccessToken, deleteTokens } from './googleAuth';

const BASE = 'https://www.googleapis.com/calendar/v3';

function toNYDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    timeZone: 'America/New_York',
    month: 'short',
    day: 'numeric',
  });
}

function toNYTime(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Returns { connected: false } if no token,
 * or { connected: true, today: Event[], tomorrow: Event[] }
 */
export async function fetchCalendarEvents() {
  try {
    const token = await getValidAccessToken();
    if (!token) return { connected: false };

    const now = new Date();

    // Format a Date as YYYY-MM-DD in America/New_York (en-CA gives ISO date format)
    const nyDateStr = (d) =>
      new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(d);

    const todayDateStr    = nyDateStr(now);
    const tomorrowDateStr = nyDateStr(new Date(now.getTime() + 24 * 3_600_000));

    // Convert a YYYY-MM-DD string to the UTC Date that equals midnight in America/New_York.
    // Strategy: start from UTC midnight of that calendar date, then find how many hours NY
    // is behind UTC at that moment (19 for EST, 20 for EDT), and advance by that offset.
    function nyMidnightUTC(isoDate) {
      const [y, m, d] = isoDate.split('-').map(Number);
      const base = new Date(Date.UTC(y, m - 1, d));
      const nyHour = +new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York', hour: 'numeric', hour12: false,
      }).format(base);
      return new Date(base.getTime() + (24 - nyHour) * 3_600_000);
    }

    const todayStart  = nyMidnightUTC(todayDateStr);
    // End = midnight ending tomorrow (start of day-after-tomorrow in NY)
    const tomorrowEnd = nyMidnightUTC(nyDateStr(new Date(now.getTime() + 48 * 3_600_000)));

    const params = new URLSearchParams({
      timeMin:      todayStart.toISOString(),
      timeMax:      tomorrowEnd.toISOString(),
      singleEvents: 'true',
      orderBy:      'startTime',
      maxResults:   '50',
    });

    const res = await fetch(`${BASE}/calendars/primary/events?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (res.status === 401) {
      await deleteTokens();
      return { connected: false };
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { connected: true, error: err?.error?.message ?? `Calendar API ${res.status}` };
    }

    const data = await res.json();
    const items = data.items ?? [];

    function mapEvent(ev) {
      const isAllDay  = !!ev.start?.date;
      const startIso  = ev.start?.dateTime ?? ev.start?.date;
      const endIso    = ev.end?.dateTime   ?? ev.end?.date;
      // Use en-CA (YYYY-MM-DD) to match todayDateStr / tomorrowDateStr
      const startDate = new Date(startIso).toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
      return {
        id:       ev.id,
        title:    ev.summary ?? '(No title)',
        location: ev.location ?? null,
        isAllDay,
        startIso,
        endIso,
        startDate,
        startTime: isAllDay ? null : toNYTime(startIso),
        endTime:   isAllDay ? null : toNYTime(endIso),
        color:     ev.colorId ?? null,
      };
    }

    const today    = items.map(mapEvent).filter((e) => e.startDate === todayDateStr);
    const tomorrow = items.map(mapEvent).filter((e) => e.startDate === tomorrowDateStr);

    return { connected: true, today, tomorrow };
  } catch (err) {
    const msg = err?.message ?? String(err);
    if (msg.includes('does not exist') || msg.includes('no rows')) {
      return { connected: false };
    }
    return { connected: false, error: msg };
  }
}
