'use client';

import { annualizedCost, costPerMinute, formatCurrency, formatElapsed } from './lib/cost';
import { copy } from './lib/copy';
import OptimizationTips from './OptimizationTips';
import Receipt from './Receipt';

export default function MeetingRecap({ attendees, result, meetingType, duration, title, tone, onReset }) {
  const { elapsed, actualCost, scheduledCost, delta } = result;
  const cpm = costPerMinute(attendees);
  const annual = annualizedCost(actualCost, meetingType);
  const costPerAttendee = attendees.length > 0 ? actualCost / attendees.length : 0;
  const saved = delta > 0;

  return (
    <div className="mcc-recap">
      <div className="mcc-recap-header">
        <div className="mcc-step-label">Meeting Complete</div>
        <h2 className="mcc-section-title">{copy('recap_title', tone)}</h2>
      </div>

      <div className="mcc-recap-hero">
        <div className="mcc-recap-total">{formatCurrency(actualCost)}</div>
        <div className="mcc-recap-total-label">total meeting cost</div>
      </div>

      <div className="mcc-recap-stats">
        <div className="mcc-recap-stat">
          <div className="mcc-recap-stat-val">{formatElapsed(elapsed)}</div>
          <div className="mcc-recap-stat-label">duration</div>
        </div>
        <div className="mcc-recap-stat">
          <div className="mcc-recap-stat-val">{formatCurrency(cpm)}</div>
          <div className="mcc-recap-stat-label">per minute</div>
        </div>
        <div className="mcc-recap-stat">
          <div className="mcc-recap-stat-val">{formatCurrency(costPerAttendee)}</div>
          <div className="mcc-recap-stat-label">per attendee</div>
        </div>
      </div>

      {Math.abs(delta) > 0.01 && (
        <div className={`mcc-recap-delta${saved ? ' mcc-recap-delta--saved' : ' mcc-recap-delta--over'}`}>
          {saved
            ? copy('recap_delta_saved', tone, { delta: formatCurrency(delta) })
            : copy('recap_delta_over',  tone, { delta: formatCurrency(Math.abs(delta)) })}
        </div>
      )}

      {meetingType !== 'one_time' && (
        <div className="mcc-recap-annual">
          <span className="mcc-label">Annualized cost ({meetingType.replace('_', '-')})</span>
          <span className="mcc-recap-annual-val">{formatCurrency(annual)}/year</span>
        </div>
      )}

      <OptimizationTips
        attendees={attendees}
        duration={duration}
        meetingType={meetingType}
        tone={tone}
      />

      <div className="mcc-recap-breakdown">
        <div className="mcc-label mcc-label--heading">Attendee breakdown</div>
        {attendees.map((a) => {
          const indivCost = (a.annual_salary / 2080 / 60) * (elapsed / 60);
          return (
            <div key={a.id} className="mcc-breakdown-row">
              <div className="mcc-breakdown-name">
                <span>{a.name}</span>
                <span className="mcc-breakdown-title">{a.title}</span>
              </div>
              <div className="mcc-breakdown-cost">{formatCurrency(indivCost)}</div>
            </div>
          );
        })}
      </div>

      <Receipt
        title={title}
        attendees={attendees}
        result={result}
        tone={tone}
      />

      <button className="btn-secondary mcc-reset-btn" onClick={onReset}>
        ← Start a new meeting
      </button>
    </div>
  );
}
