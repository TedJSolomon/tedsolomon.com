import Link from 'next/link';
import { getAllWins } from '../lib/wins';
import { getAllGoals, CATEGORY_COLORS } from '../lib/goals';
import { fetchWeather } from '../lib/weather';
import { fetchMets } from '../lib/mets';
import { fetchCalendarEvents } from '../lib/calendar';
import BentoNews from './BentoNews';
import CountUp from './CountUp';

export const metadata = { title: 'Overview — Dashboard' };
export const dynamic  = 'force-dynamic';

// ── Date helpers ─────────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function weekStartStr() {
  const d = new Date();
  const day = d.getUTCDay();
  const daysBack = day === 0 ? 6 : day - 1;
  const mon = new Date(d);
  mon.setUTCDate(d.getUTCDate() - daysBack);
  return mon.toISOString().slice(0, 10);
}
function formatDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}
function formatDueDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const date  = new Date(Number(y), Number(m) - 1, Number(d));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diff  = Math.round((date - today) / 86400000);
  if (diff === 0)  return 'Today';
  if (diff === 1)  return 'Tomorrow';
  if (diff < 0)   return `${Math.abs(diff)}d ago`;
  if (diff < 7)   return `in ${diff}d`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── Subtask helpers ──────────────────────────────────────────
function subtaskProgressLabel(s) {
  if (!s.measure_type || s.measure_type === 'Yes/No') return null;
  const cur  = Number(s.current_value ?? 0);
  const tgt  = Number(s.target_value  ?? 0);
  if (!tgt) return null;
  const unit = s.measure_unit || '';
  switch (s.measure_type) {
    case 'Percentage':    return `${cur}%`;
    case 'Currency ($)':  return `$${cur.toLocaleString()}`;
    case 'Hours':         return `${cur}h/${tgt}h`;
    case 'Weight (lbs)':  return `${cur}/${tgt}lbs`;
    case 'Count (each)':  return unit ? `${cur}/${tgt} ${unit}` : `${cur}/${tgt}`;
    case 'Custom':        return unit ? `${cur}/${tgt} ${unit}` : `${cur}/${tgt}`;
    default:              return `${cur}/${tgt}`;
  }
}

// ── Quote ────────────────────────────────────────────────────
const FALLBACK_QUOTE = { q: 'The secret of getting ahead is getting started.', a: 'Mark Twain' };
async function getQuote() {
  try {
    const res = await fetch('https://zenquotes.io/api/random', { next: { revalidate: 86400 } });
    if (!res.ok) throw new Error('bad response');
    const data = await res.json();
    if (data?.[0]?.q && data[0].q.length < 260) return { q: data[0].q, a: data[0].a };
  } catch {}
  return FALLBACK_QUOTE;
}

// ── Icons ────────────────────────────────────────────────────
function IconWin() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IconChat() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function IconHeart() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

// ── Calendar event renderer ──────────────────────────────────
const GCal_COLORS = {
  '1': '#a4bdfc', '2': '#7ae7bf', '3': '#dbadff', '4': '#ff887c',
  '5': '#fbd75b', '6': '#ffb878', '7': '#46d6db', '8': '#e1e1e1',
  '9': '#5484ed', '10': '#51b749', '11': '#dc2127',
};
function CalEventList({ events, emptyText }) {
  if (!events.length) return <p className="cal-empty">{emptyText}</p>;
  return (
    <ul className="cal-event-list">
      {events.map((ev) => {
        // Priority: event-specific color → calendar color → default amber
        const accentColor = ev.color
          ? (GCal_COLORS[ev.color] ?? ev.calendarAccent ?? '#e8a838')
          : (ev.calendarAccent ?? '#e8a838');
        return (
          <li key={ev.id} className="cal-event" style={{ '--cal-accent': accentColor }}>
            <span className="cal-event-time">
              {ev.isAllDay ? 'All day' : `${ev.startTime}${ev.endTime ? ` – ${ev.endTime}` : ''}`}
            </span>
            <span className="cal-event-title">{ev.title}</span>
            {ev.location && <span className="cal-event-loc">{ev.location}</span>}
            {ev.calendarLabel && (
              <span className="cal-cal-name" style={{ color: ev.calendarAccent ?? '#e8a838' }}>
                {ev.calendarLabel}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// ── Page ─────────────────────────────────────────────────────
export default async function DashboardOverview() {
  const [wins, goals, quote, weather, mets, calendar] = await Promise.all([
    getAllWins(),
    getAllGoals(),
    getQuote(),
    fetchWeather(),
    fetchMets(),
    fetchCalendarEvents().catch(() => ({ connected: false })),
  ]);

  const today     = todayStr();
  const weekStart = weekStartStr();
  const winsToday    = wins.filter((w) => w.date === today).length;
  const winsThisWeek = wins.filter((w) => w.date >= weekStart).length;

  // Upcoming subtasks with due dates, sorted soonest first
  const upcomingSubtasks = goals
    .filter((g) => g.status !== 'cancelled')
    .flatMap((g) =>
      (g.subtasks || [])
        .filter((s) => s.due_date && !s.completed)
        .map((s) => ({
          id:        s.id,
          title:     s.title,
          goalTitle: g.title,
          goalColor: CATEGORY_COLORS[g.category]?.bg ?? '#e8a838',
          dueDate:   s.due_date,
          isOverdue: s.due_date < today,
          progress:  subtaskProgressLabel(s),
        }))
    )
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 10);

  return (
    <div className="db-content overview-page">

      <div className="overview-header">
        <p className="overview-date">{formatDate()}</p>
        <h1 className="db-page-title">Welcome back, Ted.</h1>
      </div>

      <div className="bento-grid">

        {/* ── ROW 1: CALENDAR (~40%) ── */}
        <div className="bento-card bento-calendar">
          <div className="bento-card-header">
            <span className="bento-card-label">
              <span className="cal-icon"><IconCalendar /></span>
              Google Calendar
            </span>
            {calendar.connected && (
              <span className="cal-disconnect-wrap">
                <a href="/api/auth/google/disconnect" className="bento-card-link cal-disconnect">Disconnect</a>
              </span>
            )}
          </div>
          {!calendar.connected ? (
            <div className="cal-connect">
              <p className="cal-connect-desc">Connect your Google Calendar to see your daily agenda here.</p>
              <a href="/api/auth/google" className="bento-action-btn cal-connect-btn">
                Connect Google Calendar →
              </a>
            </div>
          ) : calendar.error ? (
            <p className="bento-empty bento-error">{calendar.error}</p>
          ) : (
            <div className="cal-body">
              <div className="cal-section">
                <h3 className="cal-section-label">Today</h3>
                <CalEventList events={calendar.today} emptyText="Nothing scheduled today" />
              </div>
              <div className="cal-section">
                <h3 className="cal-section-label">Tomorrow</h3>
                <CalEventList events={calendar.tomorrow} emptyText="Nothing scheduled tomorrow" />
              </div>
            </div>
          )}
        </div>

        {/* ── ROW 1: NEWS (~30%) — client component renders its own card ── */}
        <BentoNews />

        {/* ── ROW 1: WEATHER (~30%) ── */}
        <div className="bento-card bento-weather">
          <div className="bento-card-header">
            <span className="bento-card-label">Weather · {weather.city ?? 'Farmingdale'}</span>
          </div>
          {weather.error ? (
            <p className="bento-empty bento-error">
              {weather.error.includes('not set') ? 'Add NEXT_PUBLIC_OPENWEATHER_API_KEY to .env.local' : weather.error}
            </p>
          ) : (
            <>
              {/* Compact current conditions */}
              <div className="bento-wx-now">
                <span className="bento-wx-emoji" aria-label={weather.condition}>{weather.emoji}</span>
                <div className="bento-wx-center">
                  <span className="bento-wx-temp"><CountUp value={weather.temp} delay={0.85} suffix="°" /></span>
                  <span className="bento-wx-desc">
                    {weather.description.charAt(0).toUpperCase() + weather.description.slice(1)}
                  </span>
                </div>
                <div className="bento-wx-hl">
                  <span>H {weather.high}°</span>
                  <span>L {weather.low}°</span>
                </div>
              </div>
              <div className="bento-wx-meta">
                <span>Feels {weather.feelsLike}°</span>
                <span>{weather.humidity}% humid</span>
                <span>{weather.windSpeed} mph</span>
              </div>
              {/* 5-day forecast */}
              {weather.forecast?.length > 0 && (
                <div className="bento-wx-forecast">
                  {weather.forecast.map((day) => (
                    <div key={day.day} className="bento-wx-fc-row">
                      <span className="bento-wx-fc-day">{day.day}</span>
                      <span className="bento-wx-fc-icon">{day.emoji}</span>
                      <span className="bento-wx-fc-hi">{day.high}°</span>
                      <span className="bento-wx-fc-lo">{day.low}°</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── ROW 2: GOALS — UPCOMING TASKS ── */}
        <div className="bento-card bento-goals">
          <div className="bento-card-header">
            <span className="bento-card-label">Upcoming Tasks</span>
            <Link href="/dashboard/goals" className="bento-card-link">All goals →</Link>
          </div>
          {upcomingSubtasks.length === 0 ? (
            <p className="bento-empty">No upcoming tasks with due dates.</p>
          ) : (
            <div className="bento-tasks-list">
              {upcomingSubtasks.map((s) => (
                <div key={s.id} className={`bento-task-row${s.isOverdue ? ' overdue' : ''}`}>
                  <div className="bento-task-main">
                    <span className="bento-task-title">{s.title}</span>
                    <span className="bento-task-goal" style={{ color: s.goalColor }}>{s.goalTitle}</span>
                  </div>
                  <div className="bento-task-right">
                    {s.progress && <span className="bento-task-progress">{s.progress}</span>}
                    <span className={`bento-task-due${s.isOverdue ? ' overdue' : ''}`}>
                      {formatDueDate(s.dueDate)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── ROW 2: METS ── */}
        <div className="bento-card bento-mets">
          <div className="bento-card-header">
            <div className="bento-mets-title">
              <span className="bento-mets-logo">
                <span className="bento-mets-ny">NY</span>
                <span className="bento-mets-mets">METS</span>
              </span>
            </div>
            {mets.record && (
              <span className="bento-mets-record">
                {mets.record.wins}–{mets.record.losses}
                <span className="bento-mets-pct"> ({mets.record.pct})</span>
              </span>
            )}
          </div>
          {mets.error ? (
            <p className="bento-empty bento-error">{mets.error}</p>
          ) : (
            <div className="bento-mets-body">
              {mets.lastGame && (
                <div className="bento-mets-row">
                  <span className="bento-mets-row-label">Last</span>
                  <span className={`bento-result-badge bento-result-${mets.lastGame.result.toLowerCase()}`}>
                    {mets.lastGame.result}
                  </span>
                  <span className="bento-mets-score">
                    {mets.lastGame.metsScore}–{mets.lastGame.oppScore}
                  </span>
                  <span className="bento-mets-opp">
                    {mets.lastGame.homeAway} {mets.lastGame.opponent}
                  </span>
                </div>
              )}
              {mets.upcomingGames?.map((game, i) => (
                <div key={i} className="bento-mets-row">
                  <span className="bento-mets-row-label">{game.weekday}</span>
                  {game.isLive ? (
                    <>
                      <span className="bento-live-badge">LIVE</span>
                      <span className="bento-mets-score">{game.liveScore?.mets}–{game.liveScore?.opp}</span>
                      <span className="bento-mets-opp">{game.homeAway} {game.opponent}</span>
                    </>
                  ) : (
                    <span className="bento-mets-next-info">
                      {game.homeAway} {game.opponent}
                      <span className="bento-mets-time"> · {game.date} · {game.time}</span>
                    </span>
                  )}
                </div>
              ))}
              {!mets.lastGame && !mets.upcomingGames?.length && (
                <p className="bento-empty">No recent games found.</p>
              )}
            </div>
          )}
        </div>

        {/* ── ROW 2: WINS — compact ── */}
        <div className="bento-card bento-wins">
          <div className="bento-card-header">
            <span className="bento-card-label">Wins</span>
          </div>
          <div className="bento-wins-stats">
            <div className="bento-stat">
              <span className="bento-stat-num"><CountUp value={winsToday} delay={1.3} /></span>
              <span className="bento-stat-label">Today</span>
            </div>
            <div className="bento-stat-divider" />
            <div className="bento-stat">
              <span className="bento-stat-num"><CountUp value={winsThisWeek} delay={1.35} /></span>
              <span className="bento-stat-label">This week</span>
            </div>
          </div>
          <Link href="/dashboard/wins" className="bento-action-btn">Log a Win →</Link>
        </div>

        {/* ── ROW 3: QUOTE ── */}
        <div className="bento-card bento-quote">
          <span className="bento-quote-mark">&ldquo;</span>
          <blockquote className="bento-quote-text">{quote.q}</blockquote>
          <cite className="bento-quote-author">— {quote.a}</cite>
        </div>

        {/* ── ROW 3: QUICK ADD ── */}
        <div className="bento-card bento-quick">
          <div className="bento-card-header">
            <span className="bento-card-label">Quick Add</span>
          </div>
          <nav className="bento-quick-btns" aria-label="Quick navigation">
            <Link href="/dashboard/wins" className="bento-quick-btn">
              <span className="bento-quick-icon"><IconWin /></span>
              Log a Win
            </Link>
            <Link href="/dashboard/one-on-ones" className="bento-quick-btn">
              <span className="bento-quick-icon"><IconChat /></span>
              Add 1-on-1 Note
            </Link>
            <Link href="/dashboard/wishlist" className="bento-quick-btn">
              <span className="bento-quick-icon"><IconHeart /></span>
              Add Wishlist Item
            </Link>
          </nav>
        </div>

      </div>
    </div>
  );
}
