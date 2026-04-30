'use client';
import { useState, useEffect, useMemo } from 'react';

const PX_PER_MIN    = 1.5;
const MIN_START_HOUR = 7;   // never begin before 7 AM
const DEFAULT_END    = 19;  // fallback end when no events

function toNYMinutes(isoStr) {
  if (!isoStr) return null;
  const d = new Date(isoStr);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d);
  let h = 0, m = 0;
  for (const p of parts) {
    if (p.type === 'hour') h = Number(p.value) % 24;
    if (p.type === 'minute') m = Number(p.value);
  }
  return h * 60 + m;
}

function getAccent(ev) {
  if (!ev.calendarLabel) return '#e8a838';
  if ((ev.calendarLabel ?? '').toLowerCase().includes('bun')) return '#f472b6';
  return '#7eb8f7';
}

function computeLayout(events) {
  const timed = events
    .filter(e => !e.isAllDay && e.startIso && e.endIso)
    .map(e => {
      const sMin = toNYMinutes(e.startIso);
      let eMin = toNYMinutes(e.endIso);
      if (sMin != null && eMin != null && eMin <= sMin) eMin = sMin + 15;
      return { ...e, startMin: sMin, endMin: eMin, accent: getAccent(e) };
    })
    .filter(e => e.startMin != null && e.endMin != null)
    .sort((a, b) => a.startMin - b.startMin || b.endMin - a.endMin);

  // Greedy column assignment
  const colEnds = [];
  timed.forEach(ev => {
    let col = colEnds.findIndex(end => end <= ev.startMin);
    if (col === -1) { col = colEnds.length; colEnds.push(ev.endMin); }
    else colEnds[col] = ev.endMin;
    ev.col = col;
  });

  // Total concurrent columns per event
  timed.forEach(ev => {
    const concurrent = timed.filter(o => o.startMin < ev.endMin && o.endMin > ev.startMin);
    ev.totalCols = Math.max(...concurrent.map(o => o.col)) + 1;
  });

  return timed;
}

function fmt12(h) {
  if (h === 0 || h === 24) return '12 AM';
  if (h === 12) return '12 PM';
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

export default function CalTimeline({ events, isToday = false }) {
  const [nowMin, setNowMin] = useState(null);

  useEffect(() => {
    if (!isToday) return;
    const tick = () => setNowMin(toNYMinutes(new Date().toISOString()));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [isToday]);

  const allDay  = useMemo(() => events.filter(e => e.isAllDay), [events]);
  const layout  = useMemo(() => computeLayout(events), [events]);

  // Dynamic range: 1 hr before first event (min 7 AM) → 1 hr after last event
  const firstHour = layout.length > 0
    ? Math.max(MIN_START_HOUR, Math.floor(Math.min(...layout.map(e => e.startMin)) / 60) - 1)
    : MIN_START_HOUR;
  const lastHour = layout.length > 0
    ? Math.ceil(Math.max(...layout.map(e => e.endMin)) / 60) + 1
    : DEFAULT_END;

  const startMin = firstHour * 60;
  const totalPx  = (lastHour - firstHour) * 60 * PX_PER_MIN;
  const hours    = Array.from({ length: lastHour - firstHour + 1 }, (_, i) => firstHour + i);
  const showNow  = isToday && nowMin != null && nowMin >= startMin && nowMin <= lastHour * 60;

  return (
    <div className="cal-timeline">
      {allDay.length > 0 && (
        <div className="cal-tl-allday">
          {allDay.map(ev => (
            <div key={ev.id} className="cal-tl-allday-event" style={{ '--cal-accent': getAccent(ev) }}>
              <span className="cal-tl-allday-lbl">All day</span>
              <span className="cal-tl-allday-title">{ev.title}</span>
            </div>
          ))}
        </div>
      )}

      <div className="cal-tl-body" style={{ height: `${totalPx + 24}px` }}>
        {/* Fixed 7 AM–7 PM hour grid */}
        {hours.map(h => (
          <div
            key={h}
            className="cal-tl-hour"
            style={{ top: `${(h * 60 - startMin) * PX_PER_MIN}px` }}
          >
            <span className="cal-tl-hour-lbl">{fmt12(h)}</span>
          </div>
        ))}

        {/* Current time indicator — today only */}
        {showNow && (
          <div
            className="cal-tl-now"
            style={{ top: `${(nowMin - startMin) * PX_PER_MIN}px` }}
          />
        )}

        {/* Event blocks */}
        <div className="cal-tl-events">
          {layout.map(ev => {
            // Clamp top to grid bounds; min-height drives growth, not height
            const top   = Math.max(0, (ev.startMin - startMin) * PX_PER_MIN);
            const minH  = Math.max((ev.endMin - ev.startMin) * PX_PER_MIN, 28);
            return (
              <div
                key={ev.id}
                className="cal-tl-ev"
                style={{
                  top:       `${top}px`,
                  minHeight: `${minH}px`,
                  left:      `${(ev.col / ev.totalCols) * 100}%`,
                  width:     `calc(${(1 / ev.totalCols) * 100}% - 3px)`,
                  '--cal-accent': ev.accent,
                }}
              >
                <span className="cal-tl-ev-name">{ev.title}</span>
                <span className="cal-tl-ev-time">
                  {ev.startTime}{ev.endTime ? ` – ${ev.endTime}` : ''}
                </span>
                {ev.calendarLabel && (
                  <span className="cal-tl-ev-cal">{ev.calendarLabel}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
