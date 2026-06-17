'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Chart,
  LineController, LineElement, PointElement,
  CategoryScale, LinearScale,
  Tooltip, Legend,
} from 'chart.js';

Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

// ── Theme ─────────────────────────────────────────────────────────────────────
const AMBER      = '#e8a838';
const TEXT_COLOR = '#c0b9aa';
const BG_GRID    = 'rgba(255,255,255,0.05)';
const BORDER     = 'rgba(232, 168, 56, 0.15)';
const DIM        = '#7a7870';
const TEXT       = '#f5f3ef';
const CARD       = 'rgba(19, 22, 29, 0.85)';

// Distinct colors for up to 7 years
const YEAR_PALETTE = ['#7eb8f7', '#7ecb8a', '#e8a838', '#c49df0', '#5dbfbf', '#f0944d', '#f07878'];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ── Pay helpers ───────────────────────────────────────────────────────────────

function calcNet(j) {
  if (j.job_type === 'bust') return Number(j.bust_rate);
  const rate = Number(j.per_page_rate) - (j.proofreading ? Number(j.proofreading_rate) : 0);
  return Number(j.pages) * rate + Number(j.per_diem) * Number(j.per_diem_multiplier);
}

function calcGross(j) {
  if (j.job_type === 'bust') return Number(j.bust_rate);
  return Number(j.pages) * Number(j.per_page_rate) + Number(j.per_diem) * Number(j.per_diem_multiplier);
}

function yearOf(d)  { return d ? parseInt(d.slice(0, 4), 10) : null; }
function monthOf(d) { return d ? parseInt(d.slice(5, 7), 10) - 1 : null; }

// ── Data builders ─────────────────────────────────────────────────────────────

// { year: [m0..m11] } — null means no jobs that month
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

  // Running cumulative average of monthly Net (null months treated as 0)
  const lastM = net.reduce((last, v, i) => (v !== null ? i : last), -1);
  const runAvg = Array(12).fill(null);
  let cumSum = 0;
  for (let m = 0; m <= lastM; m++) {
    cumSum += net[m] ?? 0;
    runAvg[m] = cumSum / (m + 1);
  }

  return { gross, net, proof, runAvg };
}

// ── Shared chart options ──────────────────────────────────────────────────────

function makeOptions(yFmt = v => `$${Math.round(v).toLocaleString()}`) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
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
            ? ` ${ctx.dataset.label}: ${yFmt(ctx.parsed.y)}`
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

function line(label, data, color, opts = {}) {
  return {
    label,
    data,
    borderColor:          color,
    backgroundColor:      color + '18',
    borderWidth:          opts.width  ?? 2,
    borderDash:           opts.dash   ?? [],
    pointRadius:          opts.points ?? 3,
    pointHoverRadius:     5,
    pointBackgroundColor: color,
    tension:              0.3,
    spanGaps:             true,
    fill:                 false,
    ...opts.extra,
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
    ...years.map((y, i) => line(
      String(y),
      monthlyByYear[y] ?? Array(12).fill(null),
      YEAR_PALETTE[i % YEAR_PALETTE.length],
    )),
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

// ── Chart 2: Single-Year Net / Gross / Proof + Running Avg ───────────────────

function SingleYearChart({ jobs, year }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  const { gross, net, proof, runAvg } = buildSingleYear(jobs, year);

  const datasets = [
    line('Gross',           gross,  '#7eb8f7'),
    line('Net',             net,    AMBER),
    line('Proof cost',      proof,  '#e85858'),
    line('Running avg',     runAvg, 'rgba(255,255,255,0.5)', { dash: [5, 4], width: 1.5, points: 0 }),
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

// ── Card wrapper ──────────────────────────────────────────────────────────────

function ChartCard({ title, height = 260, children, right }) {
  return (
    <div style={{
      background: CARD,
      border: `1px solid ${BORDER}`,
      borderRadius: '8px',
      padding: '1.25rem',
      boxShadow: '0 0 12px rgba(232, 168, 56, 0.04)',
      flex: '1 1 340px',
      minWidth: 0,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
      }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          color: DIM,
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

  if (years.length === 0) return null;

  const monthlyByYear = buildMonthlyByYear(jobs);

  const selectStyle = {
    background: 'rgba(8, 10, 14, 0.7)',
    border: `1px solid ${BORDER}`,
    borderRadius: '5px',
    color: TEXT,
    padding: '0.2rem 0.5rem',
    fontSize: '0.78rem',
    fontFamily: 'inherit',
    cursor: 'pointer',
    outline: 'none',
  };

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.7rem',
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
        color: DIM,
        marginBottom: '0.9rem',
      }}>
        // Charts
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>

        <ChartCard title="Multi-Year Monthly Income">
          <MultiYearChart monthlyByYear={monthlyByYear} years={years} />
        </ChartCard>

        <ChartCard
          title="Monthly Gross / Net / Proof"
          right={
            <select value={year2} onChange={e => setYear2(Number(e.target.value))} style={selectStyle}>
              {[...years].reverse().map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          }
        >
          <SingleYearChart jobs={jobs} year={year2} />
        </ChartCard>

      </div>
    </div>
  );
}
