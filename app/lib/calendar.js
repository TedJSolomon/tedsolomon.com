/**
 * Google Calendar API helpers — server-side only.
 *
 * Fetches events from three sources:
 *   1. Primary calendar (discovered via OAuth token)
 *   2. "The Bun Calendar" (discovered via calendarList name match)
 *   3. Beck Tech Outlook calendar (hard-coded ID — shows as "Calendar" in the API
 *      but is Ted's work Outlook calendar imported from Exchange)
 */
import { getValidAccessToken, deleteTokens } from './googleAuth';

const BASE = 'https://www.googleapis.com/calendar/v3';

// Hard-coded calendar IDs that can't be reliably found by name
const HARDCODED_CALENDARS = [
  {
    id:     '3jc1ea8ah2banc99udfmug7tilfd4boc@import.calendar.google.com',
    label:  'BECK TECH',
    accent: '#7eb8f7', // blue accent to distinguish from personal events
  },
];

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
    calendarKey,
    calendarLabel,  // null = primary (no badge), string = show badge
    calendarAccent, // hex for left-border and badge color
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

    // ── 1. Discover named calendars via calendarList ──────────────────────────
    const NAMED_CALENDAR_PATTERNS = ['The Bun Calendar'];
    let namedCals = [];
    try {
      const calListRes = await fetch(`${BASE}/users/me/calendarList`, {
        headers,
        cache: 'no-store',
      });
      if (calListRes.ok) {
        const items = (await calListRes.json()).items ?? [];

        console.log('[calendar] calendarList — all calendars:');
        for (const c of items) {
          console.log(`  ${c.primary ? '[PRIMARY]' : '         '} "${c.summary}" → ${c.id}`);
        }

        for (const pattern of NAMED_CALENDAR_PATTERNS) {
          const match = items.find(
            (c) => !c.primary && c.summary?.trim().toLowerCase().includes(pattern.trim().toLowerCase())
          );
          if (match) {
            console.log(`[calendar] ✓ matched "${pattern}" → "${match.summary}" (${match.id})`);
            namedCals.push({ id: match.id, label: match.summary, accent: match.backgroundColor ?? '#F6BF26' });
          } else {
            console.log(`[calendar] ✗ no match for "${pattern}"`);
          }
        }
      }
    } catch {
      // calendarList failure is non-fatal
    }

    // Combine discovered + hard-coded calendars
    const allExtraCalendars = [...namedCals, ...HARDCODED_CALENDARS];

    // ── 2. Fetch events from primary + all extra calendars in parallel ─────────
    const fetches = [
      fetch(`${BASE}/calendars/primary/events?${params}`, { headers, cache: 'no-store' }),
      ...allExtraCalendars.map((cal) =>
        fetch(
          `${BASE}/calendars/${encodeURIComponent(cal.id)}/events?${params}`,
          { headers, cache: 'no-store' }
        )
      ),
    ];

    const [primaryRes, ...extraRes] = await Promise.all(fetches);

    if (primaryRes.status === 401) {
      await deleteTokens();
      return { connected: false };
    }
    if (!primaryRes.ok) {
      const err = await primaryRes.json().catch(() => ({}));
      return { connected: true, error: err?.error?.message ?? `Calendar API ${primaryRes.status}` };
    }

    // ── 3. Merge and sort ─────────────────────────────────────────────────────
    const allItems = [];

    const primaryData = await primaryRes.json();
    for (const ev of primaryData.items ?? []) {
      allItems.push(mapEvent(ev, 'primary', null, null));
    }

    for (let i = 0; i < allExtraCalendars.length; i++) {
      const res = extraRes[i];
      if (!res?.ok) {
        console.log(`[calendar] ✗ failed to fetch events for "${allExtraCalendars[i].label}" (${res?.status})`);
        continue;
      }
      const data = await res.json();
      const cal  = allExtraCalendars[i];
      console.log(`[calendar] ✓ fetched ${data.items?.length ?? 0} events from "${cal.label}"`);
      for (const ev of data.items ?? []) {
        allItems.push(mapEvent(ev, cal.id, cal.label, cal.accent));
      }
    }

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
