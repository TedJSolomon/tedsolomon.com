'use client';

import { useState } from 'react';

// ── Theme ─────────────────────────────────────────────────────────────────────
const AMBER  = '#e8a838';
const BORDER = 'rgba(232, 168, 56, 0.15)';
const TEXT   = '#f5f3ef';
const DIM    = '#7a7870';
const CARD   = 'rgba(19, 22, 29, 0.85)';

// ── Helpers ───────────────────────────────────────────────────────────────────

function calcPay({ job_type, pages, per_page_rate, proofreading, proofreading_rate, rush, rush_rate, per_diem, per_diem_multiplier, bust_rate }) {
  if (job_type === 'bust') return Number(bust_rate);
  const rate = Number(per_page_rate) - (proofreading ? Number(proofreading_rate) : 0) + (rush ? Number(rush_rate) : 0);
  return Number(pages) * rate + Number(per_diem) * Number(per_diem_multiplier);
}

function yearOf(dateStr) {
  return dateStr ? parseInt(dateStr.slice(0, 4), 10) : null;
}

function isLeap(y) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

function computeKPIs(jobs, year) {
  const today       = new Date();
  const currentYear = today.getFullYear();
  const isCurrent   = year === currentYear;

  const yearJobs   = jobs.filter(j => yearOf(j.date) === year);
  if (yearJobs.length === 0) return null;

  const normalJobs = yearJobs.filter(j => j.job_type === 'normal');
  const bustCount  = yearJobs.filter(j => j.job_type === 'bust').length;
  const totalPay   = yearJobs.reduce((s, j) => s + calcPay(j), 0);

  const avgPages = normalJobs.length > 0
    ? normalJobs.reduce((s, j) => s + Number(j.pages), 0) / normalJobs.length
    : 0;

  const daysInYear = isLeap(year) ? 366 : 365;

  let daysElapsed, weeksElapsed, monthsElapsed;
  if (isCurrent) {
    const startOfYear = new Date(year, 0, 1);
    daysElapsed   = Math.max(1, Math.floor((today - startOfYear) / 86_400_000) + 1);
    weeksElapsed  = daysElapsed / 7;
    monthsElapsed = daysElapsed * 12 / daysInYear;
  } else {
    daysElapsed   = daysInYear;
    weeksElapsed  = 52;
    monthsElapsed = 12;
  }

  return {
    avgPages,
    perWeek:    totalPay / weeksElapsed,
    perMonth:   totalPay / monthsElapsed,
    bustRate:   (bustCount / yearJobs.length) * 100,
    projected:  isCurrent ? (totalPay / daysElapsed) * daysInYear : totalPay,
    isCurrent,
  };
}

// ── KPI card ──────────────────────────────────────────────────────────────────

function KPICard({ value, label }) {
  return (
    <div style={{
      flex: '1 1 140px',
      background: CARD,
      border: `1px solid ${BORDER}`,
      borderRadius: '8px',
      padding: '1.1rem 1.25rem',
      boxShadow: '0 0 12px rgba(232, 168, 56, 0.04)',
      minWidth: 0,
    }}>
      <div style={{
        fontSize: '1.7rem',
        fontWeight: 700,
        color: AMBER,
        letterSpacing: '-0.02em',
        lineHeight: 1.1,
        marginBottom: '0.45rem',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.63rem',
        textTransform: 'uppercase',
        letterSpacing: '0.14em',
        color: DIM,
      }}>
        {label}
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function TranscriptionKPIs({ jobs }) {
  const years = [...new Set(jobs.map(j => yearOf(j.date)).filter(Boolean))]
    .sort((a, b) => b - a);

  const currentYear   = new Date().getFullYear();
  const defaultYear   = years.includes(currentYear) ? currentYear : (years[0] ?? currentYear);
  const [year, setYear] = useState(defaultYear);

  if (years.length === 0) return null;

  const kpis = computeKPIs(jobs, year);

  return (
    <div style={{ marginBottom: '2.5rem' }}>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '0.9rem' }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          color: DIM,
        }}>
          // Overview
        </div>

        <select
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          style={{
            background: 'rgba(8, 10, 14, 0.7)',
            border: `1px solid ${BORDER}`,
            borderRadius: '6px',
            color: TEXT,
            padding: '0.28rem 0.6rem',
            fontSize: '0.82rem',
            fontFamily: 'inherit',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Cards */}
      {kpis ? (
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <KPICard
            value={kpis.avgPages > 0 ? kpis.avgPages.toFixed(1) : '—'}
            label="Avg Pages / Job"
          />
          <KPICard
            value={`$${Math.round(kpis.perWeek).toLocaleString()}`}
            label="$ / Week"
          />
          <KPICard
            value={`$${Math.round(kpis.perMonth).toLocaleString()}`}
            label="$ / Month"
          />
          <KPICard
            value={`${kpis.bustRate.toFixed(1)}%`}
            label="Bust Rate"
          />
          <KPICard
            value={`$${Math.round(kpis.projected).toLocaleString()}`}
            label={kpis.isCurrent ? 'Projected Yearly' : 'Total (Year)'}
          />
        </div>
      ) : (
        <div style={{ fontSize: '0.88rem', color: DIM }}>No data for {year}.</div>
      )}

    </div>
  );
}
