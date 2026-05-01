'use client';

import { useState, useEffect } from 'react';
import { fetchStatusData } from '../lib/dailyActivity';

// ── Momentum gauge — inline SVG, no JS animation libraries ───────────────────
function MomentumGauge({ pct }) {
  const r      = 10;
  const circ   = 2 * Math.PI * r;        // ≈ 62.8
  const clamped = Math.min(Math.max(pct, 0), 100);
  const offset = circ - (clamped / 100) * circ;

  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      aria-label={`Momentum ${clamped}%`}
      style={{ display: 'block', flexShrink: 0 }}
    >
      {/* Track — visible dim ring */}
      <circle
        cx="14" cy="14" r={r}
        fill="none"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="3"
      />
      {/* Filled arc — amber, starts at 12 o'clock */}
      <circle
        cx="14" cy="14" r={r}
        fill="none"
        stroke="#e8a838"
        strokeWidth="3"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 14 14)"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      {/* Percentage label */}
      <text
        x="14"
        y="18"
        textAnchor="middle"
        fill="#e8a838"
        fontSize="7"
        fontFamily="'JetBrains Mono', monospace"
        fontWeight="700"
      >
        {clamped}
      </text>
    </svg>
  );
}

// ── Streak milestone label ────────────────────────────────────────────────────
function streakMilestone(n) {
  if (n >= 100) return 'Legendary';
  if (n >= 60)  return 'Relentless';
  if (n >= 30)  return 'Unstoppable';
  if (n >= 14)  return 'On a roll';
  if (n >= 7)   return '1 week strong';
  if (n >= 3)   return 'Building momentum';
  if (n >= 1)   return 'Getting started';
  return null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getGreeting(hourET) {
  if (hourET >= 5  && hourET < 12) return 'Good morning, Ted';
  if (hourET >= 12 && hourET < 17) return 'Good afternoon, Ted';
  if (hourET >= 17 && hourET < 21) return 'Good evening, Ted';
  return 'Late night, Ted';
}

function formatClock(d) {
  const opts    = { timeZone: 'America/New_York' };
  const weekday = d.toLocaleDateString('en-US', { ...opts, weekday: 'short' }).toUpperCase();
  const month   = d.toLocaleDateString('en-US', { ...opts, month: 'short' }).toUpperCase();
  const day     = d.toLocaleDateString('en-US', { ...opts, day: 'numeric' });
  const time    = d.toLocaleTimeString('en-US', {
    ...opts, hour: 'numeric', minute: '2-digit', second: '2-digit',
  });
  return `${weekday} ${month} ${day} · ${time} ET`;
}

function nyHour(d) {
  return Number(
    d.toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: 'America/New_York' })
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function StatusBar() {
  const [now,      setNow]      = useState(null);
  const [score,    setScore]    = useState(0);
  const [streak,   setStreak]   = useState(0);
  const [momentum, setMomentum] = useState(0);
  const [greeting, setGreeting] = useState('');
  const [cursor,   setCursor]   = useState(false);

  // Live clock — updates every second
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Fetch activity data on mount and every 60 s — sets display values directly
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchStatusData();
        if (cancelled) return;
        setScore(data.dailyScore    ?? 0);
        setStreak(data.winStreak    ?? 0);
        setMomentum(data.momentum   ?? 0);
      } catch { /* non-fatal */ }
    }
    load();
    const id = setInterval(load, 60_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  // Typewriter greeting — runs once after clock is ready
  useEffect(() => {
    if (!now) return;
    const full = getGreeting(nyHour(now));
    setGreeting('');
    setCursor(true);
    let i = 0;
    const iv = setInterval(() => {
      setGreeting(full.slice(0, ++i));
      if (i >= full.length) {
        clearInterval(iv);
        setTimeout(() => setCursor(false), 800);
      }
    }, 50);
    return () => clearInterval(iv);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const clockStr = now ? formatClock(now) : '';
  const hourET   = now ? nyHour(now) : 12;

  return (
    <div className="db-statusbar" role="status" aria-live="off">

      <span className="db-sb-clock">{clockStr}</span>

      <span className="db-sb-greeting">
        {greeting || getGreeting(hourET)}
        {cursor && <span className="db-sb-cursor" aria-hidden="true" />}
      </span>

      <span className="db-sb-spacer" />

      <span className="db-sb-metric" title="Daily Score">
        <span className="db-sb-metric-icon" aria-hidden="true">&#9889;</span>
        <span className="db-sb-metric-val">{score}</span>
        <span className="db-sb-metric-label">score</span>
      </span>

      <span className="db-sb-metric" title={`${streak}-day win streak`}>
        <span className="db-sb-metric-icon" aria-hidden="true">&#128293;</span>
        <span style={{ display: 'flex', flexDirection: 'column', gap: '1px', lineHeight: 1 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span className="db-sb-metric-val">{streak}</span>
            <span className="db-sb-metric-label">streak</span>
          </span>
          {streakMilestone(streak) && (
            <span style={{
              fontSize: '0.5rem',
              color: '#e8a838',
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              opacity: 0.8,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {streakMilestone(streak)}
            </span>
          )}
        </span>
      </span>

      <span className="db-sb-metric" title={`Weekly momentum: ${momentum}%`}>
        <MomentumGauge pct={momentum} />
        <span className="db-sb-metric-label">momentum</span>
      </span>

    </div>
  );
}
