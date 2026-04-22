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

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

const AMBER      = '#e8a838';
const BG_GRID    = 'rgba(255,255,255,0.05)';
const TEXT_COLOR = '#c0b9aa';

function goalPct(goal) {
  const total = (goal.subtasks || []).length;
  if (!total) return 0;
  const done = goal.subtasks.filter((s) => s.completed).length;
  return Math.round((done / total) * 100);
}

export default function GoalsProgressChart({ goals }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  const labels = goals.map((g) => g.title);
  const values = goals.map(goalPct);
  const height = Math.max(goals.length * 36, 100);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(ctx, {
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
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { right: 8 } },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1a1a1a',
            titleColor: '#e8e0d4',
            bodyColor: TEXT_COLOR,
            borderColor: '#333',
            borderWidth: 1,
            callbacks: {
              label: (ctx) => ` ${ctx.parsed.x}% complete`,
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            min: 0,
            max: 100,
            ticks: {
              color: TEXT_COLOR,
              font: { family: "'JetBrains Mono', monospace", size: 11 },
              callback: (v) => `${v}%`,
              maxTicksLimit: 6,
            },
            grid:   { color: BG_GRID },
            border: { color: 'transparent' },
          },
          y: {
            ticks: {
              color: TEXT_COLOR,
              font: { family: "'JetBrains Mono', monospace", size: 11 },
            },
            grid:   { display: false },
            border: { color: 'transparent' },
          },
        },
      },
    });

    return () => { chartRef.current?.destroy(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify({ labels, values })]);

  if (goals.length === 0) return null;

  return (
    <div className="chart-card goals-progress-chart">
      <div className="chart-title">Goals Progress</div>
      <div className="chart-canvas-wrap" style={{ height: `${height}px` }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
