import Link from 'next/link';
import { getAllWins } from '../lib/wins';
import { getAllGoals, CATEGORY_COLORS } from '../lib/goals';
import { fetchWeather } from '../lib/weather';
import { fetchMets } from '../lib/mets';
import { fetchCalendarEvents } from '../lib/calendar';

export const metadata = { title: 'Overview — Dashboard' };
export const dynamic  = 'force-dynamic';

// ── Date helpers ────────────────────────────────────────────
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

// ── Goal progress ───────────────────────────────────────────
function goalPct(goal) {
  const subs = goal.subtasks || [];
  if (!subs.length) return 0;
  return Math.round(subs.filter((s) => s.completed).length / subs.length * 100);
}

// ── Quote ───────────────────────────────────────────────────
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

// ── Icons ───────────────────────────────────────────────────
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

// Google Calendar event color IDs → accent colors (subset of Google's palette)
const GCal_COLORS = {
  '1': '#a4bdfc', '2': '#7ae7bf', '3': '#dbadff', '4': '#ff887c',
  '5': '#fbd75b', '6': '#ffb878', '7': '#46d6db', '8': '#e1e1e1',
  '9': '#5484ed', '10': '#51b749', '11': '#dc2127',
};

function CalEventList({ events, emptyText }) {
  if (!events.length) {
    return <p className="cal-empty">{emptyText}</p>;
  }
  return (
    <ul className="cal-event-list">
      {events.map((ev) => {
        const accentColor = ev.color ? GCal_COLORS[ev.color] ?? '#e8a838' : '#e8a838';
        return (
          <li key={ev.id} className="cal-event" style={{ '--cal-accent': accentColor }}>
            <span className="cal-event-time">
              {ev.isAllDay ? 'All day' : `${ev.startTime}${ev.endTime ? ` – ${ev.endTime}` : ''}`}
            </span>
            <span className="cal-event-title">{ev.title}</span>
            {ev.location && (
              <span className="cal-event-loc">{ev.location}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// ── Page ────────────────────────────────────────────────────
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

  const activeGoals = goals
    .filter((g) => g.status === 'active')
    .slice(0, 3)
    .map((g) => ({ ...g, pct: goalPct(g) }));

  return (
    <div className="db-content overview-page">

      <div className="overview-header">
        <p className="overview-date">{formatDate()}</p>
        <h1 className="db-page-title">Welcome back, Ted.</h1>
      </div>

      <div className="bento-grid">

        {/* ── GOAL PROGRESS — large 2×2 ── */}
        <div className="bento-card bento-goals">
          <div className="bento-card-header">
            <span className="bento-card-label">Goal Progress</span>
            <Link href="/dashboard/goals" className="bento-card-link">View all →</Link>
          </div>
          {activeGoals.length === 0 ? (
            <p className="bento-empty">No active goals yet.</p>
          ) : (
            <div className="bento-goals-list">
              {activeGoals.map((goal) => {
                const color = CATEGORY_COLORS[goal.category] || CATEGORY_COLORS.Other;
                const subs  = goal.subtasks || [];
                const done  = subs.filter((s) => s.completed).length;
                return (
                  <div key={goal.id} className="bento-goal-item">
                    <div className="bento-goal-meta">
                      <span className="bento-goal-title">{goal.title}</span>
                      <span className="bento-goal-pct">{goal.pct}%</span>
                    </div>
                    <div className="bento-goal-track">
                      <div className="bento-goal-fill"
                        style={{ width: `${goal.pct > 0 ? Math.max(goal.pct, 3) : 0}%`, background: color.bg }} />
                    </div>
                    <div className="bento-goal-sub">
                      <span className="bento-goal-cat" style={{ color: color.bg }}>{goal.category}</span>
                      <span className="bento-goal-subs">{done}/{subs.length} subtasks</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <Link href="/dashboard/goals" className="bento-action-btn bento-goals-cta">
            Manage Goals →
          </Link>
        </div>

        {/* ── TODAY'S WINS — medium 2×1 ── */}
        <div className="bento-card bento-wins">
          <div className="bento-card-header">
            <span className="bento-card-label">Wins</span>
            <Link href="/dashboard/wins" className="bento-card-link">View all →</Link>
          </div>
          <div className="bento-wins-stats">
            <div className="bento-stat">
              <span className="bento-stat-num">{winsToday}</span>
              <span className="bento-stat-label">Today</span>
            </div>
            <div className="bento-stat-divider" />
            <div className="bento-stat">
              <span className="bento-stat-num">{winsThisWeek}</span>
              <span className="bento-stat-label">This week</span>
            </div>
          </div>
          <Link href="/dashboard/wins" className="bento-action-btn">Log a Win →</Link>
        </div>

        {/* ── QUICK ADD — small 1×1 ── */}
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

        {/* ── QUOTE OF THE DAY — small 1×1 ── */}
        <div className="bento-card bento-quote">
          <span className="bento-quote-mark">&ldquo;</span>
          <blockquote className="bento-quote-text">{quote.q}</blockquote>
          <cite className="bento-quote-author">— {quote.a}</cite>
        </div>

        {/* ── WEATHER — medium 2×1 ── */}
        <div className="bento-card bento-weather">
          <div className="bento-card-header">
            <span className="bento-card-label">Weather · {weather.city ?? 'Farmingdale, NY'}</span>
          </div>
          {weather.error ? (
            <p className="bento-empty bento-error">
              {weather.error.includes('not set')
                ? 'Add NEXT_PUBLIC_OPENWEATHER_API_KEY to .env.local'
                : weather.error}
            </p>
          ) : (
            <div className="bento-weather-body">
              <div className="bento-weather-main">
                <div className="bento-weather-left">
                  <span className="bento-weather-temp">{weather.temp}°</span>
                  <span className="bento-weather-desc">
                    {weather.description.charAt(0).toUpperCase() + weather.description.slice(1)}
                  </span>
                  <span className="bento-weather-hl">
                    H: {weather.high}° &nbsp; L: {weather.low}°
                  </span>
                </div>
                <span className="bento-weather-emoji" aria-label={weather.condition}>
                  {weather.emoji}
                </span>
              </div>
              <div className="bento-weather-meta">
                <span>Feels like {weather.feelsLike}°</span>
                <span>Humidity {weather.humidity}%</span>
                <span>Wind {weather.windSpeed} mph</span>
              </div>
            </div>
          )}
        </div>

        {/* ── NY METS — medium 2×1 ── */}
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

              {mets.nextGame && (
                <div className="bento-mets-row">
                  <span className="bento-mets-row-label">Next</span>
                  {mets.nextGame.isLive ? (
                    <>
                      <span className="bento-live-badge">LIVE</span>
                      <span className="bento-mets-score">
                        {mets.nextGame.liveScore?.mets}–{mets.nextGame.liveScore?.opp}
                      </span>
                      <span className="bento-mets-opp">
                        {mets.nextGame.homeAway} {mets.nextGame.opponent}
                      </span>
                    </>
                  ) : (
                    <span className="bento-mets-next-info">
                      {mets.nextGame.homeAway} {mets.nextGame.opponent}
                      {mets.nextGame.time && (
                        <span className="bento-mets-time"> · {mets.nextGame.time}</span>
                      )}
                    </span>
                  )}
                </div>
              )}

              {!mets.lastGame && !mets.nextGame && (
                <p className="bento-empty">No recent games found.</p>
              )}

            </div>
          )}
        </div>

        {/* ── GOOGLE CALENDAR ── */}
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

      </div>
    </div>
  );
}
