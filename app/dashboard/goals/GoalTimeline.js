'use client';

import { CATEGORY_COLORS } from '../../lib/goals';

const GREEN = '#5ed47a';
const AMBER = '#e8a838';
const RED   = '#f07878';
const BLUE  = '#7eb8f7';
const MUTED = 'rgba(255,255,255,0.15)';

function calcProgress(goal) {
  if (goal.measure_type && goal.measure_type !== 'Yes/No') {
    const cur = Number(goal.current_value ?? 0);
    const tgt = Number(goal.target_value  ?? 0);
    return tgt > 0 ? Math.min(100, (cur / tgt) * 100) : 0;
  }
  if (goal.measure_type === 'Yes/No') {
    return (goal.current_value ?? 0) >= 1 ? 100 : 0;
  }
  const subs = goal.subtasks || [];
  return subs.length ? (subs.filter((s) => s.completed).length / subs.length) * 100 : 0;
}

function calcColor(goal, today) {
  if (goal.status === 'completed') return BLUE;
  if (goal.status === 'cancelled') return MUTED;
  if (goal.status === 'paused')    return AMBER;
  if (!goal.target_date)           return AMBER;

  const progress  = calcProgress(goal);
  const start     = new Date(goal.created_at);
  const end       = new Date(goal.target_date + 'T00:00:00');

  if (today >= end) return progress >= 100 ? BLUE : RED;

  const timeElapsed = Math.min(100, ((today - start) / (end - start)) * 100);
  const gap = timeElapsed - progress;

  if (gap <= 0)  return GREEN;
  if (gap <= 20) return AMBER;
  return RED;
}

function progressLabel(goal) {
  const p = Math.round(calcProgress(goal));
  if (!goal.measure_type || goal.measure_type === 'Yes/No') return `${p}%`;
  const cur  = Number(goal.current_value ?? 0);
  const unit = goal.measure_unit || '';
  switch (goal.measure_type) {
    case 'Percentage':    return `${cur}%`;
    case 'Currency ($)':  return `$${cur.toLocaleString()}`;
    case 'Hours':         return `${cur}h`;
    case 'Weight (lbs)':  return `${cur} lbs`;
    default:              return unit ? `${cur} ${unit}` : `${p}%`;
  }
}

export default function GoalTimeline({ goals }) {
  if (!goals.length) {
    return <div className="wins-empty"><p>No goals to show.</p></div>;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Compute overall date range
  let minDate = new Date(goals[0].created_at);
  let maxDate = new Date(today);

  for (const g of goals) {
    const s = new Date(g.created_at);
    if (s < minDate) minDate = s;
    if (g.target_date) {
      const e = new Date(g.target_date + 'T00:00:00');
      if (e > maxDate) maxDate = e;
    }
  }

  // Enforce minimum 2-month span
  const TWO_MONTHS_MS = 1000 * 60 * 60 * 24 * 60;
  if (maxDate - minDate < TWO_MONTHS_MS) {
    maxDate = new Date(minDate.getTime() + TWO_MONTHS_MS);
  }

  // Add 2% visual padding on each end
  const rangeMs   = maxDate - minDate;
  const padMs     = rangeMs * 0.02;
  const viewMin   = new Date(minDate.getTime() - padMs);
  const viewMax   = new Date(maxDate.getTime() + padMs);
  const viewRange = viewMax - viewMin;

  function toPct(d) {
    const date = typeof d === 'string'
      ? new Date(d.includes('T') ? d : d + 'T00:00:00')
      : new Date(d);
    return Math.max(0, Math.min(100, ((date - viewMin) / viewRange) * 100));
  }

  const todayPct = toPct(today);

  // Monthly axis ticks
  const ticks = [];
  const cursor = new Date(viewMin);
  cursor.setDate(1);
  cursor.setMonth(cursor.getMonth() + 1);
  while (cursor < viewMax) {
    const pct = toPct(cursor);
    if (pct >= 0 && pct <= 100) {
      ticks.push({
        pct,
        label: cursor.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      });
    }
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return (
    <div className="goal-timeline">
      <div className="goal-tl-inner">

        {/* X-axis header */}
        <div className="goal-tl-axis-row">
          <div className="goal-tl-label-col" aria-hidden="true" />
          <div className="goal-tl-axis-col">
            {ticks.map((t, i) => (
              <span key={i} className="goal-tl-tick" style={{ left: `${t.pct}%` }}>
                {t.label}
              </span>
            ))}
            <span className="goal-tl-today-label" style={{ left: `${todayPct}%` }}>
              Today
            </span>
          </div>
        </div>

        {/* Goal rows */}
        {goals.map((goal) => {
          const startPct = toPct(goal.created_at);
          const endPct   = goal.target_date ? toPct(goal.target_date) : 98;
          const barW     = Math.max(2, endPct - startPct);
          const progress = calcProgress(goal);
          const color    = calcColor(goal, today);
          const label    = progressLabel(goal);
          const catColor = CATEGORY_COLORS[goal.category]?.bg ?? AMBER;

          return (
            <div key={goal.id} className="goal-tl-row">
              <div className="goal-tl-label-col">
                <span className="goal-tl-title" title={goal.title}>{goal.title}</span>
                <span className="goal-tl-cat-row">
                  <span className="goal-tl-cat-dot" style={{ background: catColor }} />
                  <span className="goal-tl-cat-name">{goal.category}</span>
                </span>
              </div>

              <div className="goal-tl-track-col">
                {/* Today marker line */}
                <div className="goal-tl-today-line" style={{ left: `${todayPct}%` }} />

                {/* The goal bar */}
                <div
                  className="goal-tl-bar-wrap"
                  style={{ left: `${startPct}%`, width: `${barW}%` }}
                >
                  <div className="goal-tl-bar-bg" />
                  <div
                    className="goal-tl-bar-fill"
                    style={{
                      width: `${progress > 0 ? Math.max(progress, 2) : 0}%`,
                      background: color,
                    }}
                  />
                  <span className="goal-tl-bar-label">{label}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Legend */}
        <div className="goal-tl-legend">
          {[
            { color: GREEN, label: 'On pace'       },
            { color: AMBER, label: 'Behind / no deadline' },
            { color: RED,   label: 'Significantly behind' },
            { color: BLUE,  label: 'Completed'     },
          ].map(({ color, label }) => (
            <span key={label} className="goal-tl-legend-item">
              <span className="goal-tl-legend-swatch" style={{ background: color }} />
              {label}
            </span>
          ))}
        </div>

      </div>
    </div>
  );
}
