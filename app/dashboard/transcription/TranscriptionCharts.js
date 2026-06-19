'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Chart,
  LineController, LineElement, PointElement,
  BarController, BarElement,
  CategoryScale, LinearScale,
  Tooltip, Legend,
} from 'chart.js';

Chart.register(
  LineController, LineElement, PointElement,
  BarController, BarElement,
  CategoryScale, LinearScale,
  Tooltip, Legend,
);

// ── Theme ─────────────────────────────────────────────────────────────────────
const AMBER      = '#e8a838';
const BLUE       = '#7eb8f7';
const RED        = '#e85858';
const TEXT_COLOR = '#c0b9aa';
const BG_GRID    = 'rgba(255,255,255,0.05)';
const BORDER     = 'rgba(232, 168, 56, 0.15)';
const DIM        = '#7a7870';
const TEXT       = '#f5f3ef';
const CARD       = 'rgba(19, 22, 29, 0.85)';

const YEAR_PALETTE    = ['#7eb8f7', '#7ecb8a', '#e8a838', '#c49df0', '#5dbfbf', '#f0944d', '#f07878'];
const MONTHS          = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const WEEKDAY_LABELS  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const WEEKDAY_JS_IDX  = [1,2,3,4,5,6,0]; // JS getDay() → Mon=1..Sat=6,Sun=0

// ── Pay helpers ───────────────────────────────────────────────────────────────

function calcNet(j) {
  if (j.job_type === 'bust') return Number(j.bust_rate);
  const rate = Number(j.per_page_rate) - (j.proofreading ? Number(j.proofreading_rate) : 0) + (j.rush ? Number(j.rush_rate) : 0);
  return Number(j.pages) * rate + Number(j.per_diem) * Number(j.per_diem_multiplier);
}

function calcGross(j) {
  if (j.job_type === 'bust') return Number(j.bust_rate);
  const rate = Number(j.per_page_rate) + (j.rush ? Number(j.rush_rate) : 0);
  return Number(j.pages) * rate + Number(j.per_diem) * Number(j.per_diem_multiplier);
}

function yearOf(d)  { return d ? parseInt(d.slice(0, 4), 10) : null; }
function monthOf(d) { return d ? parseInt(d.slice(5, 7), 10) - 1 : null; }

function dayIdxOf(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  const idx = WEEKDAY_JS_IDX.indexOf(new Date(y, m - 1, d).getDay());
  return idx === -1 ? null : idx;
}

// ── Statistical helpers ───────────────────────────────────────────────────────

function leastSquares(pts) {
  const n = pts.length;
  if (n === 0) return { a: 0, b: 0 };
  if (n === 1) return { a: pts[0][1], b: 0 };
  const sumX  = pts.reduce((s, [x])    => s + x,     0);
  const sumY  = pts.reduce((s, [, y])  => s + y,     0);
  const sumXY = pts.reduce((s, [x, y]) => s + x * y, 0);
  const sumX2 = pts.reduce((s, [x])    => s + x * x, 0);
  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return { a: sumY / n, b: 0 };
  const b = (n * sumXY - sumX * sumY) / denom;
  return { a: (sumY - b * sumX) / n, b };
}

// ── Data builders ─────────────────────────────────────────────────────────────

function buildMonthlyByYear(jobs) {
  const out = {};
  for (const j of jobs) {
    const y = yearOf(j.date), m = monthOf(j.date);
    if (y == null || m == null) continue;
    if (!out[y]) out[y] = Array(12).fill(null);
    if (out[y][m] === null) out[y][m] = 0;
    out[y][m] += calcNet(j);
  }
  return out;
}

function buildSingleYear(jobs, year) {
  const gross = Array(12).fill(null);
  const net   = Array(12).fill(null);
  const proof = Array(12).fill(null);

  for (const j of jobs.filter(j => yearOf(j.date) === year)) {
    const m = monthOf(j.date);
    if (m == null) continue;
    const g = calcGross(j), n = calcNet(j);
    if (gross[m] === null) { gross[m] = 0; net[m] = 0; proof[m] = 0; }
    gross[m] += g;
    net[m]   += n;
    proof[m] += g - n;
  }

  const lastM  = net.reduce((last, v, i) => (v !== null ? i : last), -1);
  const runAvg = Array(12).fill(null);
  let cumSum = 0;
  for (let m = 0; m <= lastM; m++) {
    cumSum += net[m] ?? 0;
    runAvg[m] = cumSum / (m + 1);
  }

  return { gross, net, proof, runAvg };
}

function buildRunningTotal(jobs, year) {
  const isCurrent = year === new Date().getFullYear();
  const mNet   = Array(12).fill(0);
  const mGross = Array(12).fill(0);
  const mProof = Array(12).fill(0);
  let lastM = -1;

  for (const j of jobs) {
    if (yearOf(j.date) !== year) continue;
    const m = monthOf(j.date);
    if (m == null) continue;
    const g = calcGross(j), n = calcNet(j);
    mNet[m]   += n;
    mGross[m] += g;
    mProof[m] += g - n;
    if (m > lastM) lastM = m;
  }

  if (lastM === -1) return null;

  // Cumulative sums; null after lastM (no data yet)
  const cumNet   = Array(12).fill(null);
  const cumGross = Array(12).fill(null);
  const cumProof = Array(12).fill(null);
  let sN = 0, sG = 0, sP = 0;
  for (let m = 0; m <= lastM; m++) {
    sN += mNet[m]; sG += mGross[m]; sP += mProof[m];
    cumNet[m] = sN; cumGross[m] = sG; cumProof[m] = sP;
  }

  // Projection: forward extrapolation for current year, overlay for past years
  const projection = Array(12).fill(null);
  if (isCurrent && lastM < 11) {
    const pace = cumNet[lastM] / (lastM + 1);
    for (let m = lastM; m <= 11; m++) {
      projection[m] = +(cumNet[lastM] + pace * (m - lastM)).toFixed(2);
    }
  } else {
    for (let m = 0; m <= lastM; m++) projection[m] = cumNet[m];
  }

  // Linear trendlines fit to actual data, extended across all 12 months
  const { a: aN, b: bN } = leastSquares(Array.from({ length: lastM + 1 }, (_, m) => [m, cumNet[m]]));
  const { a: aG, b: bG } = leastSquares(Array.from({ length: lastM + 1 }, (_, m) => [m, cumGross[m]]));
  const trendNet   = MONTHS.map((_, m) => +(aN + bN * m).toFixed(2));
  const trendGross = MONTHS.map((_, m) => +(aG + bG * m).toFixed(2));

  return { cumNet, cumGross, cumProof, projection, trendNet, trendGross };
}

function buildWeekdayStats(jobs, year) {
  const total = Array(7).fill(0);
  const went  = Array(7).fill(0);
  const bust  = Array(7).fill(0);
  let hasData = false;

  for (const j of jobs) {
    if (yearOf(j.date) !== year) continue;
    const idx = dayIdxOf(j.date);
    if (idx == null) continue;
    const n = calcNet(j);
    total[idx] += n;
    if (j.job_type === 'bust') bust[idx] += n;
    else went[idx] += n;
    hasData = true;
  }

  return hasData ? { total, went, bust } : null;
}

// ── Shared chart options ──────────────────────────────────────────────────────

function makeOptions() {
  return {
    responsive:          true,
    maintainAspectRatio: false,
    interaction:         { mode: 'index', intersect: false },
    plugins: {
      legend: {
        display: true,
        labels: {
          color:    TEXT_COLOR,
          font:     { family: "'JetBrains Mono', monospace", size: 10 },
          boxWidth: 12,
          padding:  12,
        },
      },
      tooltip: {
        backgroundColor: '#141418',
        titleColor:      '#e8e0d4',
        bodyColor:       TEXT_COLOR,
        borderColor:     '#2a2a2a',
        borderWidth:     1,
        callbacks: {
          label: ctx => ctx.parsed.y != null
            ? ` ${ctx.dataset.label}: $${Math.round(ctx.parsed.y).toLocaleString()}`
            : null,
        },
      },
    },
    scales: {
      x: {
        ticks:  { color: TEXT_COLOR, font: { family: "'JetBrains Mono', monospace", size: 10 } },
        grid:   { color: BG_GRID },
        border: { color: 'transparent' },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color:         TEXT_COLOR,
          font:          { family: "'JetBrains Mono', monospace", size: 10 },
          callback:      v => `$${Math.round(v).toLocaleString()}`,
          maxTicksLimit: 6,
        },
        grid:   { color: BG_GRID },
        border: { color: 'transparent' },
      },
    },
  };
}

// line() opts.extra spreads last so it can override any default
function line(label, data, color, opts = {}) {
  const { dash = [], width = 2, points = 3, extra = {} } = opts;
  return {
    label,
    data,
    borderColor:          color,
    backgroundColor:      color + '18',
    borderWidth:          width,
    borderDash:           dash,
    pointRadius:          points,
    pointHoverRadius:     5,
    pointBackgroundColor: color,
    tension:              0.3,
    spanGaps:             true,
    fill:                 false,
    ...extra,
  };
}

// ── Chart 1: Multi-Year Monthly Income ───────────────────────────────────────

function MultiYearChart({ monthlyByYear, years }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  const avgData = MONTHS.map((_, m) => {
    const vals = years.map(y => monthlyByYear[y]?.[m]).filter(v => v !== null && v !== undefined);
    return vals.length > 0 ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
  });

  const datasets = [
    ...years.map((y, i) => line(String(y), monthlyByYear[y] ?? Array(12).fill(null), YEAR_PALETTE[i % YEAR_PALETTE.length])),
    line('Average', avgData, 'rgba(255,255,255,0.55)', { dash: [5, 4], width: 1.5, points: 0 }),
  ];

  const key = JSON.stringify(datasets.map(d => ({ l: d.label, d: d.data })));

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    chartRef.current?.destroy();
    chartRef.current = new Chart(ctx, { type: 'line', data: { labels: MONTHS, datasets }, options: makeOptions() });
    return () => { chartRef.current?.destroy(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return <canvas ref={canvasRef} />;
}

// ── Chart 2: Monthly Net / Gross / Proof + Running Avg ───────────────────────

function SingleYearChart({ jobs, year }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  const { gross, net, proof, runAvg } = buildSingleYear(jobs, year);

  const datasets = [
    line('Gross',       gross,  BLUE),
    line('Net',         net,    AMBER),
    line('Proof cost',  proof,  RED),
    line('Running avg', runAvg, 'rgba(255,255,255,0.5)', { dash: [5, 4], width: 1.5, points: 0 }),
  ];

  const key = JSON.stringify(datasets.map(d => ({ l: d.label, d: d.data })));

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    chartRef.current?.destroy();
    chartRef.current = new Chart(ctx, { type: 'line', data: { labels: MONTHS, datasets }, options: makeOptions() });
    return () => { chartRef.current?.destroy(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return <canvas ref={canvasRef} />;
}

// ── Chart 3: Running Total (cumulative) ──────────────────────────────────────

function RunningTotalChart({ jobs, year }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  const data = buildRunningTotal(jobs, year);

  const datasets = data ? [
    line('Net',            data.cumNet,    AMBER),
    line('Gross',          data.cumGross,  BLUE),
    line('Proof',          data.cumProof,  RED),
    line('Projection',     data.projection, 'rgba(255,255,255,0.45)', { dash: [4, 3], width: 1.5, points: 0, extra: { backgroundColor: 'transparent' } }),
    line('Linear (Net)',   data.trendNet,   AMBER,  { dash: [7, 3], width: 1,   points: 0, extra: { backgroundColor: 'transparent', tension: 0 } }),
    line('Linear (Gross)', data.trendGross, BLUE,   { dash: [7, 3], width: 1,   points: 0, extra: { backgroundColor: 'transparent', tension: 0 } }),
  ] : [];

  const key = JSON.stringify([year, datasets.map(d => ({ l: d.label, d: d.data }))]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    chartRef.current?.destroy();
    if (datasets.length === 0) return;
    chartRef.current = new Chart(ctx, { type: 'line', data: { labels: MONTHS, datasets }, options: makeOptions() });
    return () => { chartRef.current?.destroy(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (!data) return (
    <div style={{ color: DIM, fontSize: '0.8rem', textAlign: 'center', paddingTop: '3rem' }}>
      No data for {year}
    </div>
  );

  return <canvas ref={canvasRef} />;
}

// ── Chart 4: By Day of Week (grouped bar) ────────────────────────────────────

function WeekdayChart({ jobs, year }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  const data = buildWeekdayStats(jobs, year);

  const datasets = data ? [
    {
      label: 'Total',
      data: data.total,
      backgroundColor: AMBER + '55',
      borderColor:     AMBER,
      borderWidth:     1,
      borderRadius:    3,
    },
    {
      label: 'Went',
      data: data.went,
      backgroundColor: BLUE + '55',
      borderColor:     BLUE,
      borderWidth:     1,
      borderRadius:    3,
    },
    {
      label: 'Bust',
      data: data.bust,
      backgroundColor: RED + '55',
      borderColor:     RED,
      borderWidth:     1,
      borderRadius:    3,
    },
  ] : [];

  const key = JSON.stringify([year, data]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    chartRef.current?.destroy();
    if (datasets.length === 0) return;
    chartRef.current = new Chart(ctx, { type: 'bar', data: { labels: WEEKDAY_LABELS, datasets }, options: makeOptions() });
    return () => { chartRef.current?.destroy(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (!data) return (
    <div style={{ color: DIM, fontSize: '0.8rem', textAlign: 'center', paddingTop: '3rem' }}>
      No data for {year}
    </div>
  );

  return <canvas ref={canvasRef} />;
}

// ── Card wrapper ──────────────────────────────────────────────────────────────

function ChartCard({ title, height = 260, children, right }) {
  return (
    <div style={{
      background:   CARD,
      border:       `1px solid ${BORDER}`,
      borderRadius: '8px',
      padding:      '1.25rem',
      boxShadow:    '0 0 12px rgba(232, 168, 56, 0.04)',
      flex:         '1 1 340px',
      minWidth:     0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{
          fontFamily:    "'JetBrains Mono', monospace",
          fontSize:      '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          color:         DIM,
        }}>
          {title}
        </div>
        {right}
      </div>
      <div style={{ height, position: 'relative' }}>
        {children}
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function TranscriptionCharts({ jobs }) {
  const years = [...new Set(jobs.map(j => yearOf(j.date)).filter(Boolean))].sort((a, b) => a - b);

  const currentYear = new Date().getFullYear();
  const defaultYear = years.includes(currentYear) ? currentYear : (years[years.length - 1] ?? currentYear);

  const [year2, setYear2] = useState(defaultYear);
  const [year3, setYear3] = useState(defaultYear);
  const [year4, setYear4] = useState(defaultYear);

  if (years.length === 0) return null;

  const monthlyByYear = buildMonthlyByYear(jobs);

  const selectStyle = {
    background:  'rgba(8, 10, 14, 0.7)',
    border:      `1px solid ${BORDER}`,
    borderRadius: '5px',
    color:       TEXT,
    padding:     '0.2rem 0.5rem',
    fontSize:    '0.78rem',
    fontFamily:  'inherit',
    cursor:      'pointer',
    outline:     'none',
  };

  const yearSelect = (val, set) => (
    <select value={val} onChange={e => set(Number(e.target.value))} style={selectStyle}>
      {[...years].reverse().map(y => <option key={y} value={y}>{y}</option>)}
    </select>
  );

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <div style={{
        fontFamily:    "'JetBrains Mono', monospace",
        fontSize:      '0.7rem',
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
        color:         DIM,
        marginBottom:  '0.9rem',
      }}>
        // Charts
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>

        <ChartCard title="Multi-Year Monthly Income">
          <MultiYearChart monthlyByYear={monthlyByYear} years={years} />
        </ChartCard>

        <ChartCard title="Monthly Gross / Net / Proof" right={yearSelect(year2, setYear2)}>
          <SingleYearChart jobs={jobs} year={year2} />
        </ChartCard>

        <ChartCard title="Running Total" height={340} right={yearSelect(year3, setYear3)}>
          <RunningTotalChart jobs={jobs} year={year3} />
        </ChartCard>

        <ChartCard title="By Day of Week" height={340} right={yearSelect(year4, setYear4)}>
          <WeekdayChart jobs={jobs} year={year4} />
        </ChartCard>

      </div>
    </div>
  );
}
