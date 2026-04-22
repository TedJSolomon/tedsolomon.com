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

    // Build time windows in NY timezone
    const now   = new Date();
    const nyNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));

    const todayStart = new Date(nyNow);
    todayStart.setHours(0, 0, 0, 0);

    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(todayStart.getDate() + 1);

    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setDate(tomorrowStart.getDate() + 1);

    const params = new URLSearchParams({
      timeMin:      todayStart.toISOString(),
      timeMax:      tomorrowEnd.toISOString(),
      singleEvents: 'true',
      orderBy:      'startTime',
      maxResults:   '50',
    });

    const res = await fetch(`${BASE}/calendars/primary/events?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store', // page is force-dynamic; user-specific data
    });

    if (res.status === 401) {
      // Token revoked — clear and signal not connected
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
      const startDate = new Date(startIso).toLocaleDateString('en-US', { timeZone: 'America/New_York' });
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

    const todayDateStr    = todayStart.toLocaleDateString('en-US', { timeZone: 'America/New_York' });
    const tomorrowDateStr = tomorrowStart.toLocaleDateString('en-US', { timeZone: 'America/New_York' });

    const today    = items.map(mapEvent).filter((e) => e.startDate === todayDateStr);
    const tomorrow = items.map(mapEvent).filter((e) => e.startDate === tomorrowDateStr);

    return { connected: true, today, tomorrow };
  } catch (err) {
    // If this is a Supabase table-missing error, treat as not connected
    const msg = err?.message ?? String(err);
    if (msg.includes('does not exist') || msg.includes('no rows')) {
      return { connected: false };
    }
    return { connected: false, error: msg };
  }
}
