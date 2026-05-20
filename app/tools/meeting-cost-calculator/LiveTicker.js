'use client';

import { useState, useEffect, useRef } from 'react';
import { costPerMinute, meetingCost, annualizedCost, formatCurrency, formatElapsed } from './lib/cost';

export default function LiveTicker({ attendees, scheduledMinutes, meetingType, onEnd }) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);
  const intervalRef = useRef(null);

  const cpm = costPerMinute(attendees);
  const elapsedMinutes = elapsed / 60;
  const currentCost = cpm * elapsedMinutes;
  const scheduledCost = meetingCost(attendees, scheduledMinutes);

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
    const actualMinutes = elapsed / 60;
    const actualCost = cpm * actualMinutes;
    const delta = scheduledCost - actualCost;
    onEnd({ elapsed, actualCost, scheduledCost, delta, meetingType });
  }

  const overBudget = currentCost > scheduledCost;

  return (
    <div className="mcc-ticker">
      <div className="mcc-ticker-header">
        <div className="mcc-ticker-meta">
          <span className="mcc-badge">{attendees.length} attendees</span>
          <span className="mcc-badge">{formatCurrency(cpm)}/min</span>
          <span className="mcc-badge">Scheduled: {scheduledMinutes} min</span>
        </div>
        {overBudget && (
          <div className="mcc-over-budget-flag">Over budget</div>
        )}
      </div>

      <div className="mcc-ticker-elapsed">{formatElapsed(elapsed)}</div>

      <div className={`mcc-ticker-cost${overBudget ? ' mcc-ticker-cost--over' : ''}`}>
        {formatCurrency(currentCost)}
      </div>

      <div className="mcc-ticker-sub">
        {overBudget
          ? `${formatCurrency(currentCost - scheduledCost)} over the scheduled budget`
          : `${formatCurrency(scheduledCost - currentCost)} remaining in scheduled budget`}
      </div>

      <div className="mcc-ticker-controls">
        <button
          className="btn-secondary"
          onClick={() => setRunning((r) => !r)}
        >
          {running ? 'Pause' : 'Resume'}
        </button>
        <button className="btn-primary" onClick={handleEnd}>
          End Meeting
        </button>
      </div>
    </div>
  );
}
