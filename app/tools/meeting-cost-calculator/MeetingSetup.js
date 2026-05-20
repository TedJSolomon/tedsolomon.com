'use client';

import AttendeeSelector from './AttendeeSelector';
import { meetingCost, annualizedCost, formatCurrency, costPerMinute } from './lib/cost';

const MEETING_TYPES = [
  { value: 'one_time',  label: 'One-time' },
  { value: 'weekly',    label: 'Weekly' },
  { value: 'biweekly',  label: 'Biweekly' },
  { value: 'monthly',   label: 'Monthly' },
  { value: 'daily',     label: 'Daily' },
];

export default function MeetingSetup({ attendees, setAttendees, duration, setDuration, meetingType, setMeetingType, onStart }) {
  const cpm = costPerMinute(attendees);
  const projected = meetingCost(attendees, duration);
  const annual = annualizedCost(projected, meetingType);
  const canStart = attendees.length > 0 && duration > 0;

  return (
    <div className="mcc-setup">
      <div className="mcc-section-header">
        <div className="mcc-step-label">Step 1</div>
        <h2 className="mcc-section-title">Who&apos;s in the meeting?</h2>
      </div>

      <AttendeeSelector selected={attendees} onChange={setAttendees} />

      <div className="mcc-section-header mcc-section-header--spaced">
        <div className="mcc-step-label">Step 2</div>
        <h2 className="mcc-section-title">How long?</h2>
      </div>

      <div className="mcc-duration-row">
        <div className="mcc-field">
          <label className="mcc-label">Duration (minutes)</label>
          <input
            className="mcc-input mcc-input--num"
            type="number"
            min="1"
            max="480"
            value={duration}
            onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
          />
        </div>
        <div className="mcc-field">
          <label className="mcc-label">Frequency</label>
          <select
            className="mcc-select"
            value={meetingType}
            onChange={(e) => setMeetingType(e.target.value)}
          >
            {MEETING_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {attendees.length > 0 && (
        <div className="mcc-projection">
          <div className="mcc-proj-stat">
            <div className="mcc-proj-value">{formatCurrency(cpm)}</div>
            <div className="mcc-proj-label">per minute</div>
          </div>
          <div className="mcc-proj-stat">
            <div className="mcc-proj-value">{formatCurrency(projected)}</div>
            <div className="mcc-proj-label">this meeting</div>
          </div>
          {meetingType !== 'one_time' && (
            <div className="mcc-proj-stat mcc-proj-stat--accent">
              <div className="mcc-proj-value">{formatCurrency(annual)}</div>
              <div className="mcc-proj-label">annualized</div>
            </div>
          )}
        </div>
      )}

      <button
        className="btn-primary mcc-start-btn"
        disabled={!canStart}
        onClick={onStart}
      >
        Start Meeting →
      </button>
      {!canStart && (
        <p className="mcc-hint">Add at least one attendee and set a duration to start.</p>
      )}
    </div>
  );
}
