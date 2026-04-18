'use client';

import { useEffect, useRef } from 'react';
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { CATEGORIES, METRIC_TYPES } from './constants';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

const CATEGORY_COLORS = {
  shipped:      '#e8a838',
  learned:      '#7eb8f7',
  led:          '#7ecb8a',
  impact:       '#c49df0',
  collaborated: '#5dbfbf',
  advocated:    '#f0944d',
  solved:       '#f07878',
  created:      '#a8d870',
};

const AMBER = '#e8a838';
const BG_GRID = 'rgba(255,255,255,0.05)';
const TEXT_COLOR = '#c0b9aa';

function baseOptions(maxValue) {
  return {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { right: 8 } },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a1a1a',
        titleColor: '#e8e0d4',
        bodyColor: '#c0b9aa',
        borderColor: '#333',
        borderWidth: 1,
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.x}`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          color: TEXT_COLOR,
          font: { family: "'JetBrains Mono', monospace", size: 11 },
          stepSize: 1,
          precision: 0,
          maxTicksLimit: 6,
        },
        grid: { color: BG_GRID },
        border: { color: 'transparent' },
        max: maxValue ? maxValue + 1 : undefined,
      },
      y: {
        ticks: {
          color: TEXT_COLOR,
          font: { family: "'JetBrains Mono', monospace", size: 11 },
        },
        grid: { display: false },
        border: { color: 'transparent' },
      },
    },
  };
}

function useChart(canvasRef, config) {
  const chartRef = useRef(null);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(ctx, config());
    return () => { chartRef.current?.destroy(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(config())]);
}

// ── Chart 1: Wins by Category ────────────────────────────────
function CategoryChart({ categoryCounts }) {
  const ref = useRef(null);
  const labels = CATEGORIES.map((c) => c.label);
  const values = CATEGORIES.map((c) => categoryCounts[c.value] || 0);
  const colors = CATEGORIES.map((c) => CATEGORY_COLORS[c.value] || AMBER);
  const max = Math.max(...values, 0);

  useChart(ref, () => ({
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors.map((c) => c + '99'),
        borderColor: colors,
        borderWidth: 1,
        borderRadius: 3,
      }],
    },
    options: baseOptions(max),
  }));

  return (
    <div className="chart-card">
      <div className="chart-title">Wins by Category</div>
      <div className="chart-canvas-wrap" style={{ height: `${Math.max(CATEGORIES.length * 32, 180)}px` }}>
        <canvas ref={ref} />
      </div>
    </div>
  );
}

// ── Chart 2: Top Tags ────────────────────────────────────────
function TagsChart({ tagCounts }) {
  const ref = useRef(null);
  const labels = tagCounts.map((t) => t.tag);
  const values = tagCounts.map((t) => t.count);
  const max = Math.max(...values, 0);
  const height = Math.max(labels.length * 32, 80);

  useChart(ref, () => ({
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: AMBER + '66',
        borderColor: AMBER,
        borderWidth: 1,
        borderRadius: 3,
      }],
    },
    options: baseOptions(max),
  }));

  return (
    <div className="chart-card">
      <div className="chart-title">Top Tags</div>
      {labels.length === 0 ? (
        <p className="chart-empty">No tags yet.</p>
      ) : (
        <div className="chart-canvas-wrap" style={{ height: `${height}px` }}>
          <canvas ref={ref} />
        </div>
      )}
    </div>
  );
}

// ── Chart 3: Impact Metrics ──────────────────────────────────
function ImpactChart({ impactTypeCounts }) {
  const ref = useRef(null);
  const usedTypes = METRIC_TYPES.filter((t) => impactTypeCounts[t]);
  // include any custom labels not in METRIC_TYPES
  const customTypes = Object.keys(impactTypeCounts).filter((t) => !METRIC_TYPES.includes(t));
  const allTypes = [...usedTypes, ...customTypes];
  const labels = allTypes;
  const values = allTypes.map((t) => impactTypeCounts[t] || 0);
  const max = Math.max(...values, 0);
  const height = Math.max(labels.length * 32, 80);

  useChart(ref, () => ({
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: AMBER + '55',
        borderColor: AMBER,
        borderWidth: 1,
        borderRadius: 3,
      }],
    },
    options: baseOptions(max),
  }));

  return (
    <div className="chart-card">
      <div className="chart-title">Impact Metrics</div>
      {labels.length === 0 ? (
        <p className="chart-empty">No impact metrics logged yet.</p>
      ) : (
        <div className="chart-canvas-wrap" style={{ height: `${height}px` }}>
          <canvas ref={ref} />
        </div>
      )}
    </div>
  );
}

// ── Main export ──────────────────────────────────────────────
export default function WinsCharts({ categoryCounts, tagCounts, impactTypeCounts }) {
  return (
    <div className="wins-charts-col">
      <CategoryChart categoryCounts={categoryCounts} />
      <TagsChart tagCounts={tagCounts} />
      <ImpactChart impactTypeCounts={impactTypeCounts} />
    </div>
  );
}
