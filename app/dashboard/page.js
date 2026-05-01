import Link from 'next/link';
import { getAllWins } from '../lib/wins';
import { getAllGoals, CATEGORY_COLORS } from '../lib/goals';
import { fetchWeather } from '../lib/weather';
import { fetchMets } from '../lib/mets';
import { fetchCalendarEvents } from '../lib/calendar';
import { getAllOOOs } from '../lib/oneOnOnes';
import { createServerClient } from '../lib/supabase';
import BentoNews from './BentoNews';
import CountUp from './CountUp';
import CalTimeline from './CalTimeline';
import BentoCard from './BentoCard';
import DailyFocus from './DailyFocus';

export const metadata = { title: 'Overview — Dashboard' };
export const dynamic  = 'force-dynamic';

// ── Date helpers ─────────────────────────────────────────────
function todayET() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
}
function yesterdayET() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' })
    .format(new Date(Date.now() - 86_400_000));
}
function weekLaterET() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' })
    .format(new Date(Date.now() + 7 * 86_400_000));
}
function nyHourServer() {
  return Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York', hour: 'numeric', hour12: false,
    }).format(new Date())
  );
}
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

function buildSubtaskRows(goals, today, weekLater) {
  const overdue = [];
  const dueSoon = [];
  goals
    .filter((g) => g.status !== 'cancelled')
    .forEach((g) => {
      (g.subtasks || []).forEach((s) => {
        if (!s.due_date || s.completed) return;
        const row = {
          id:        s.id,
          title:     s.title,
          goalTitle: g.title,
          goalColor: CATEGORY_COLORS[g.category]?.bg ?? '#e8a838',
          dueDate:   s.due_date,
          progress:  subtaskProgressLabel(s),
        };
        if (s.due_date < today) overdue.push(row);
        else if (s.due_date <= weekLater) dueSoon.push(row);
      });
    });
  overdue.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  dueSoon.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  return { overdue, dueSoon };
}

// ── Win streak from wins table ───────────────────────────────
function computeWinStreak(wins) {
  const today = todayET();
  const yesterday = yesterdayET();
  const winDates = new Set(wins.map((w) => w.date));

  // If no wins today, start counting from yesterday
  const startDate = winDates.has(today) ? today : yesterday;
  if (!winDates.has(startDate)) return 0;

  let streak = 0;
  const cur = new Date(startDate + 'T12:00:00');
  const fmt = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(d);
  while (winDates.has(fmt(cur))) {
    streak++;
    cur.setDate(cur.getDate() - 1);
  }
  return streak;
}

// ── Briefing helpers ─────────────────────────────────────────
function getBriefingGreeting(hour) {
  if (hour >= 5  && hour < 12) return 'Good morning, Ted.';
  if (hour >= 12 && hour < 17) return 'Good afternoon, Ted.';
  if (hour >= 17 && hour < 21) return 'Good evening, Ted.';
  return 'Late night, Ted.';
}

function buildBriefingBody({
  meetingsToday, nextMeetingTitle, minsUntilNext,
  dueThisWeek, overdueCount,
  winsYesterday, winStreak,
  mets, weather,
}) {
  const sentences = [];

  // Meetings
  if (meetingsToday === 0) {
    sentences.push('No meetings on the calendar today');
  } else {
    let s = `You have ${meetingsToday} meeting${meetingsToday !== 1 ? 's' : ''} today`;
    if (nextMeetingTitle && minsUntilNext != null) {
      if (minsUntilNext <= 0) {
        s += ` — ${nextMeetingTitle} is happening now`;
      } else if (minsUntilNext < 60) {
        s += ` — ${nextMeetingTitle} in ${minsUntilNext} minute${minsUntilNext !== 1 ? 's' : ''}`;
      } else {
        const hrs  = Math.floor(minsUntilNext / 60);
        const mins = minsUntilNext % 60;
        s += ` — ${nextMeetingTitle} in ${hrs}h${mins > 0 ? ` ${mins}m` : ''}`;
      }
    }
    sentences.push(s);
  }

  // Tasks
  const taskParts = [];
  if (dueThisWeek > 0)  taskParts.push(`${dueThisWeek} subtask${dueThisWeek !== 1 ? 's' : ''} due this week`);
  if (overdueCount > 0) taskParts.push(`${overdueCount} overdue`);
  if (taskParts.length) sentences.push(taskParts.join(', '));

  // Wins
  if (winsYesterday > 0 && winStreak > 1) {
    sentences.push(`You logged ${winsYesterday} win${winsYesterday !== 1 ? 's' : ''} yesterday, keeping a ${winStreak}-day streak`);
  } else if (winsYesterday > 0) {
    sentences.push(`You logged ${winsYesterday} win${winsYesterday !== 1 ? 's' : ''} yesterday`);
  } else if (winStreak > 0) {
    sentences.push(`${winStreak}-day win streak active`);
  }

  // Mets
  if (mets?.recentGames?.length > 0) {
    const last = mets.recentGames[0];
    const verb = last.result === 'W' ? 'won' : 'lost';
    sentences.push(`The Mets ${verb} ${last.metsScore}–${last.oppScore} last night`);
  }

  // Weather
  if (!weather?.error && weather?.temp != null) {
    const desc = (weather.description || '').toLowerCase();
    sentences.push(`It's ${weather.temp}° and ${desc}`);
  }

  return sentences.join('. ') + '.';
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

// ── Daily focus loader ───────────────────────────────────────
async function getTodayFocus() {
  try {
    const supabase = createServerClient();
    const today = todayET();
    const { data } = await supabase
      .from('daily_focus')
      .select('priority_1, priority_2, priority_3')
      .eq('date', today)
      .maybeSingle();
    return data || null;
  } catch {
    return null;
  }
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

// ── Page ─────────────────────────────────────────────────────
export default async function DashboardOverview() {
  const [wins, goals, quote, weather, mets, calendar, ooos, dailyFocusData] = await Promise.all([
    getAllWins(),
    getAllGoals(),
    getQuote(),
    fetchWeather(),
    fetchMets(),
    fetchCalendarEvents().catch(() => ({ connected: false })),
    getAllOOOs().catch(() => []),
    getTodayFocus(),
  ]);

  const today     = todayET();
  const yesterday = yesterdayET();
  const weekLater = weekLaterET();
  const weekStart = weekStartStr();

  const winsToday    = wins.filter((w) => w.date === todayStr()).length;
  const winsThisWeek = wins.filter((w) => w.date >= weekStart).length;
  const winsYesterday = wins.filter((w) => w.date === yesterday).length;
  const winStreak    = computeWinStreak(wins);

  // ── Subtask bucketing ────────────────────────────────────────
  const { overdue: overdueSubtasks, dueSoon: dueSoonSubtasks } =
    buildSubtaskRows(goals, today, weekLater);

  // ── Next meeting ─────────────────────────────────────────────
  let meetingsToday    = 0;
  let nextMeetingTitle = null;
  let minsUntilNext    = null;

  if (calendar.connected && !calendar.error && Array.isArray(calendar.today)) {
    const now  = new Date();
    const timed = calendar.today.filter((e) => !e.isAllDay && e.startIso && e.endIso);
    meetingsToday = timed.length;

    // First event that hasn't ended yet
    const next = timed
      .filter((e) => new Date(e.endIso) > now)
      .sort((a, b) => a.startIso.localeCompare(b.startIso))[0];

    if (next) {
      nextMeetingTitle = next.title;
      minsUntilNext    = Math.round((new Date(next.startIso) - now) / 60_000);
    }
  }

  // ── 1-on-1 follow-ups due in the next 7 days ────────────────
  const upcomingFollowUps = ooos
    .filter((o) => o.follow_up_date && o.follow_up_date >= today && o.follow_up_date <= weekLater)
    .sort((a, b) => a.follow_up_date.localeCompare(b.follow_up_date))
    .slice(0, 8);

  // ── Briefing ─────────────────────────────────────────────────
  const hour           = nyHourServer();
  const briefingGreeting = getBriefingGreeting(hour);
  const briefingBody   = buildBriefingBody({
    meetingsToday, nextMeetingTitle, minsUntilNext,
    dueThisWeek: dueSoonSubtasks.length,
    overdueCount: overdueSubtasks.length,
    winsYesterday, winStreak,
    mets, weather,
  });

  return (
    <div className="db-content overview-page">

      {/* ── BRIEFING HEADER ── */}
      <div className="overview-header">
        <p className="overview-date">{formatDate()}</p>
        <h1 className="db-page-title">{briefingGreeting}</h1>
        <p style={{
          fontSize: '0.93rem',
          color: 'rgba(245,243,239,0.62)',
          lineHeight: 1.75,
          maxWidth: '78ch',
          margin: '0.3rem 0 0',
          fontFamily: 'inherit',
        }}>
          {briefingBody}
        </p>
      </div>

      <div className="overview-layout">

        {/* ── MAIN CONTENT — left column ── */}
        <div className="overview-main">

          {/* ── DAILY FOCUS — full-width strip before grid ── */}
          <div style={{ marginBottom: '1.25rem' }}>
            <BentoCard>
              <DailyFocus initialData={dailyFocusData} />
            </BentoCard>
          </div>

          <div className="overview-main-grid">

            {/* News */}
            <BentoNews />

            {/* Weather */}
            <BentoCard className="bento-weather">
              <div className="bento-card-header">
                <span className="bento-card-label">Weather · {weather.city ?? 'Farmingdale'}</span>
              </div>
              {weather.error ? (
                <p className="bento-empty bento-error">
                  {weather.error.includes('not set') ? 'Add NEXT_PUBLIC_OPENWEATHER_API_KEY to .env.local' : weather.error}
                </p>
              ) : (
                <>
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
            </BentoCard>

            {/* ── URGENT / OVERDUE PANEL ── */}
            <BentoCard className="bento-goals">
              <div className="bento-card-header">
                <span className="bento-card-label">Tasks &amp; Follow-ups</span>
                <Link href="/dashboard/goals" className="bento-card-link">All goals →</Link>
              </div>

              {overdueSubtasks.length === 0 && dueSoonSubtasks.length === 0 && upcomingFollowUps.length === 0 ? (
                <p className="bento-empty">No overdue or upcoming tasks.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'auto', flex: 1 }}>

                  {/* OVERDUE */}
                  {overdueSubtasks.length > 0 && (
                    <div>
                      <div style={{
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: '#ef4444',
                        fontFamily: "'JetBrains Mono', monospace",
                        marginBottom: '0.45rem',
                      }}>
                        Overdue
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        {overdueSubtasks.map((s) => (
                          <div key={s.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.5rem',
                            padding: '0.35rem 0.6rem',
                            borderLeft: '2px solid rgba(239,68,68,0.55)',
                            background: 'rgba(239,68,68,0.04)',
                            borderRadius: '0 4px 4px 0',
                          }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0 }}>
                              <span style={{ fontSize: '0.82rem', color: '#f5f3ef', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {s.title}
                              </span>
                              <span style={{ fontSize: '0.68rem', color: s.goalColor, opacity: 0.85 }}>{s.goalTitle}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexShrink: 0 }}>
                              {s.progress && (
                                <span style={{ fontSize: '0.7rem', color: '#7a7870' }}>{s.progress}</span>
                              )}
                              <span style={{ fontSize: '0.72rem', color: '#ef4444', fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap' }}>
                                {formatDueDate(s.dueDate)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* DUE THIS WEEK */}
                  {dueSoonSubtasks.length > 0 && (
                    <div>
                      <div style={{
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: '#f59e0b',
                        fontFamily: "'JetBrains Mono', monospace",
                        marginBottom: '0.45rem',
                      }}>
                        Due This Week
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        {dueSoonSubtasks.map((s) => (
                          <div key={s.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.5rem',
                            padding: '0.35rem 0.6rem',
                            borderLeft: '2px solid rgba(245,158,11,0.45)',
                            background: 'rgba(245,158,11,0.03)',
                            borderRadius: '0 4px 4px 0',
                          }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0 }}>
                              <span style={{ fontSize: '0.82rem', color: '#f5f3ef', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {s.title}
                              </span>
                              <span style={{ fontSize: '0.68rem', color: s.goalColor, opacity: 0.85 }}>{s.goalTitle}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexShrink: 0 }}>
                              {s.progress && (
                                <span style={{ fontSize: '0.7rem', color: '#7a7870' }}>{s.progress}</span>
                              )}
                              <span style={{ fontSize: '0.72rem', color: '#f59e0b', fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap' }}>
                                {formatDueDate(s.dueDate)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 1-on-1 Follow-ups */}
                  {upcomingFollowUps.length > 0 && (
                    <div>
                      <div style={{
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: '#7eb8f7',
                        fontFamily: "'JetBrains Mono', monospace",
                        marginBottom: '0.45rem',
                      }}>
                        1-on-1 Follow-ups
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        {upcomingFollowUps.map((o) => (
                          <div key={o.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.5rem',
                            padding: '0.35rem 0.6rem',
                            borderLeft: '2px solid rgba(126,184,247,0.4)',
                            background: 'rgba(126,184,247,0.03)',
                            borderRadius: '0 4px 4px 0',
                          }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0 }}>
                              <span style={{ fontSize: '0.82rem', color: '#f5f3ef' }}>{o.person_name}</span>
                              {o.action_items && (
                                <span style={{
                                  fontSize: '0.68rem',
                                  color: '#7a7870',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  maxWidth: '22ch',
                                }}>
                                  {o.action_items}
                                </span>
                              )}
                            </div>
                            <span style={{
                              fontSize: '0.72rem',
                              color: '#7eb8f7',
                              fontFamily: "'JetBrains Mono', monospace",
                              whiteSpace: 'nowrap',
                              flexShrink: 0,
                            }}>
                              {formatDueDate(o.follow_up_date)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </BentoCard>

            {/* ── METS ── */}
            <BentoCard className="bento-mets">
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
                  {mets.recentGames?.map((g, i) => (
                    <div key={`r${i}`} className="bento-mets-row">
                      <span className="bento-mets-row-label">{g.weekday}</span>
                      <span className={`bento-result-badge bento-result-${g.result.toLowerCase()}`}>
                        {g.result}
                      </span>
                      <span className="bento-mets-score">
                        {g.metsScore}–{g.oppScore}
                      </span>
                      <span className="bento-mets-opp">
                        {g.homeAway} {g.opponent}
                      </span>
                    </div>
                  ))}
                  {mets.upcomingGames?.map((game, i) => (
                    <div key={`u${i}`} className="bento-mets-row">
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
                  {!mets.recentGames?.length && !mets.upcomingGames?.length && (
                    <p className="bento-empty">No recent games found.</p>
                  )}
                </div>
              )}
            </BentoCard>

            {/* ── WINS ── */}
            <BentoCard className="bento-wins">
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
            </BentoCard>

            {/* ── QUOTE ── */}
            <BentoCard className="bento-quote" style={{ justifyContent: 'center', position: 'relative', gap: '0.5rem' }}>
              <span className="bento-quote-mark">&ldquo;</span>
              <blockquote className="bento-quote-text">{quote.q}</blockquote>
              <cite className="bento-quote-author">— {quote.a}</cite>
            </BentoCard>

            {/* ── QUICK ADD ── */}
            <BentoCard className="bento-quick">
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
            </BentoCard>

          </div>{/* /overview-main-grid */}
        </div>{/* /overview-main */}

        {/* ── CALENDAR SIDEBAR — right column ── */}
        <aside className="overview-cal-sidebar">
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
                  <CalTimeline events={calendar.today} isToday />
                </div>
                <div className="cal-section">
                  <h3 className="cal-section-label">Tomorrow</h3>
                  <CalTimeline events={calendar.tomorrow} />
                </div>
              </div>
            )}
          </div>
        </aside>

      </div>{/* /overview-layout */}
    </div>
  );
}
