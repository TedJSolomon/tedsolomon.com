'use client';

import { useState, useEffect, useRef } from 'react';
import { costPerMinute, meetingCost, formatCurrency, formatElapsed } from './lib/cost';
import { copy } from './lib/copy';

export default function LiveTicker({ attendees, scheduledMinutes, meetingType, tone, onEnd }) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);
  const intervalRef = useRef(null);

  const cpm = costPerMinute(attendees);
  const elapsedMinutes = elapsed / 60;
  const currentCost = cpm * elapsedMinutes;
  const scheduledCost = meetingCost(attendees, scheduledMinutes);
  const overBudget = currentCost > scheduledCost;

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  function handleEnd() {
    clearInterval(intervalRef.current);
    setRunning(false);
    const actualCost = cpm * (elapsed / 60);
    onEnd({ elapsed, actualCost, scheduledCost, delta: scheduledCost - actualCost, meetingType });
  }

  const subText = overBudget
    ? copy('ticker_over',     tone, { over:      formatCurrency(currentCost - scheduledCost) })
    : copy('ticker_remaining', tone, { remaining: formatCurrency(scheduledCost - currentCost) });

  return (
    <div className="mcc-ticker">
      <div className="mcc-ticker-header">
        <div className="mcc-ticker-meta">
          <span className="mcc-badge">{attendees.length} attendees</span>
          <span className="mcc-badge">{formatCurrency(cpm)}/min</span>
          <span className="mcc-badge">Scheduled: {scheduledMinutes} min</span>
        </div>
        {overBudget && <div className="mcc-over-budget-flag">Over budget</div>}
      </div>

      <div className="mcc-ticker-elapsed">{formatElapsed(elapsed)}</div>

      <div className={`mcc-ticker-cost${overBudget ? ' mcc-ticker-cost--over' : ''}`}>
        {formatCurrency(currentCost)}
      </div>

      <div className="mcc-ticker-sub">{subText}</div>

      <div className="mcc-ticker-controls">
        <button className="btn-secondary" onClick={() => setRunning((r) => !r)}>
          {running ? 'Pause' : 'Resume'}
        </button>
        <button className="btn-primary" onClick={handleEnd}>
          End Meeting
        </button>
      </div>
    </div>
  );
}
