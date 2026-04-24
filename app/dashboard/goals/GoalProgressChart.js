'use client';

import { useEffect, useRef } from 'react';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const AMBER          = '#e8a838';
const TEXT_COLOR     = '#c0b9aa';
const BG_GRID        = 'rgba(255,255,255,0.05)';
const SUBTASK_COLORS = ['#7eb8f7', '#7ecb8a', '#c49df0', '#5dbfbf', '#f0944d', '#f07878', '#a8d870'];

function fmtAxisDate(isoStr) {
  const d = isoStr.split('T')[0];
  const [y, m, dy] = d.split('-');
  return new Date(+y, +m - 1, +dy).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Per date-key, keep the last logged value
function buildValues(logs, dateKeys) {
  const byDate = {};
  for (const log of logs) {
    const dk = log.logged_at.split('T')[0];
    if (!byDate[dk] || log.logged_at > byDate[dk].logged_at) byDate[dk] = log;
  }
  return dateKeys.map((dk) => (byDate[dk] != null ? Number(byDate[dk].value) : null));
}

export default function GoalProgressChart({ logs, goal, subtasks }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  const measurableSubtasks = (subtasks || []).filter(
    (s) => s.measure_type && s.measure_type !== 'Yes/No',
  );

  const goalLogs    = logs.filter((l) => l.subtask_id == null);
  const showGoal    = goalLogs.length > 0 && goal.measure_type && goal.measure_type !== 'Yes/No';
  const stLogsMap   = Object.fromEntries(
    measurableSubtasks.map((s) => [s.id, logs.filter((l) => l.subtask_id === s.id)]),
  );
  const showAnySubtask = measurableSubtasks.some((s) => stLogsMap[s.id]?.length > 0);

  if (!showGoal && !showAnySubtask) return null;

  // All unique date keys across relevant logs, sorted
  const relevantLogs = [
    ...(showGoal ? goalLogs : []),
    ...measurableSubtasks.flatMap((s) => stLogsMap[s.id] || []),
  ];
  const allDateKeys = [...new Set(relevantLogs.map((l) => l.logged_at.split('T')[0]))].sort();
  if (allDateKeys.length === 0) return null;

  const axisLabels = allDateKeys.map(fmtAxisDate);

  // ── Build datasets ────────────────────────────────────────────────────────

  const datasets = [];

  if (showGoal) {
    datasets.push({
      label:            goal.measure_unit
        ? `${goal.title} (${goal.measure_unit})`
        : goal.title,
      data:             buildValues(goalLogs, allDateKeys),
      borderColor:      AMBER,
      backgroundColor:  AMBER + '18',
      borderWidth:      2,
      pointRadius:      4,
      pointHoverRadius: 5,
      pointBackgroundColor: AMBER,
      tension:          0.3,
      spanGaps:         true,
      fill:             false,
    });
  }

  measurableSubtasks.forEach((s, i) => {
    const sLogs = stLogsMap[s.id] || [];
    if (sLogs.length === 0) return;
    const color = SUBTASK_COLORS[i % SUBTASK_COLORS.length];
    datasets.push({
      label:            s.measure_unit ? `${s.title} (${s.measure_unit})` : s.title,
      data:             buildValues(sLogs, allDateKeys),
      borderColor:      color + 'bb',
      backgroundColor:  'transparent',
      borderWidth:      1.5,
      pointRadius:      3,
      pointHoverRadius: 4,
      pointBackgroundColor: color + 'bb',
      tension:          0.3,
      spanGaps:         true,
      fill:             false,
    });
  });

  // Reference lines (target + threshold)
  const tgt = goal.target_value != null ? Number(goal.target_value) : null;
  const thr = goal.completion_threshold != null ? Number(goal.completion_threshold) : null;

  if (tgt != null) {
    datasets.push({
      label:            `Target (${tgt})`,
      data:             allDateKeys.map(() => tgt),
      borderColor:      'rgba(255,255,255,0.22)',
      backgroundColor:  'transparent',
      borderDash:       [6, 4],
      borderWidth:      1,
      pointRadius:      0,
      spanGaps:         true,
      fill:             false,
    });
  }

  if (thr != null && thr !== tgt) {
    datasets.push({
      label:            `Threshold (${thr})`,
      data:             allDateKeys.map(() => thr),
      borderColor:      'rgba(255,255,255,0.13)',
      backgroundColor:  'transparent',
      borderDash:       [3, 4],
      borderWidth:      1,
      pointRadius:      0,
      spanGaps:         true,
      fill:             false,
    });
  }

  // Snapshot for effect dependency
  const chartKey = JSON.stringify(
    datasets.map((d) => ({ label: d.label, data: d.data })).concat([{ label: 'axis', data: axisLabels }]),
  );

  // ── Chart render ──────────────────────────────────────────────────────────

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    if (chartRef.current) chartRef.current.destroy();

    // Filter reference lines from legend
    const nonRef = datasets.filter(
      (d) => !d.label.startsWith('Target') && !d.label.startsWith('Threshold'),
    );
    const showLegend = nonRef.length > 1;

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: { labels: axisLabels, datasets },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        interaction:         { mode: 'index', intersect: false },
        plugins: {
          legend: {
            display: showLegend,
            labels: {
              color:    TEXT_COLOR,
              font:     { family: "'JetBrains Mono', monospace", size: 10 },
              boxWidth: 14,
              padding:  10,
              filter:   (item) =>
                !item.text.startsWith('Target') && !item.text.startsWith('Threshold'),
            },
          },
          tooltip: {
            backgroundColor: '#1a1a1a',
            titleColor:      '#e8e0d4',
            bodyColor:       TEXT_COLOR,
            borderColor:     '#2a2a2a',
            borderWidth:     1,
            callbacks: {
              label: (ctx) => {
                if (ctx.parsed.y == null) return null;
                return ` ${ctx.dataset.label}: ${ctx.parsed.y}`;
              },
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color:         TEXT_COLOR,
              font:          { family: "'JetBrains Mono', monospace", size: 10 },
              maxTicksLimit: 8,
              maxRotation:   0,
            },
            grid:   { color: BG_GRID },
            border: { color: 'transparent' },
          },
          y: {
            beginAtZero: false,
            ticks: {
              color:         TEXT_COLOR,
              font:          { family: "'JetBrains Mono', monospace", size: 10 },
              maxTicksLimit: 5,
            },
            grid:   { color: BG_GRID },
            border: { color: 'transparent' },
          },
        },
      },
    });

    return () => { chartRef.current?.destroy(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartKey]);

  return (
    <div className="goal-progress-history">
      <span className="goal-subtasks-label">Progress History</span>
      <div className="goal-history-chart-wrap">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
