'use client';

import { copy, getCoffees } from './lib/copy';
import { annualizedCost, meetingCost, formatCurrency } from './lib/cost';

const FREQ_DOWNGRADE = { daily: 'weekly', weekly: 'biweekly' };

export default function OptimizationTips({ attendees, duration, meetingType, tone }) {
  if (meetingType === 'one_time' || attendees.length === 0) return null;

  const baseCost = meetingCost(attendees, duration);
  const baseAnnual = annualizedCost(baseCost, meetingType);

  const tips = [];

  // Duration reductions
  for (const min of [5, 10, 15]) {
    if (duration - min < 5) break;
    const savings = baseAnnual - annualizedCost(meetingCost(attendees, duration - min), meetingType);
    tips.push({
      key: `cut-${min}`,
      text: copy('opt_cut_time', tone, { min, savings: formatCurrency(savings), coffees: getCoffees(savings) }),
    });
  }

  // Frequency downgrade
  const downgraded = FREQ_DOWNGRADE[meetingType];
  if (downgraded) {
    const savings = baseAnnual - annualizedCost(baseCost, downgraded);
    tips.push({
      key: 'freq',
      text: copy('opt_frequency', tone, { from: meetingType, to: downgraded, savings: formatCurrency(savings) }),
    });
  }

  // Remove top-3 most expensive attendees
  const sorted = [...attendees].sort((a, b) => b.annual_salary - a.annual_salary);
  for (const attendee of sorted.slice(0, 3)) {
    const remaining = attendees.filter((a) => a.id !== attendee.id);
    if (remaining.length === 0) continue;
    const savings = baseAnnual - annualizedCost(meetingCost(remaining, duration), meetingType);
    tips.push({
      key: `remove-${attendee.id}`,
      text: copy('opt_remove', tone, { name: attendee.name.split(' ')[0], savings: formatCurrency(savings) }),
    });
  }

  return (
    <div className="mcc-tips">
      <div className="mcc-tips-header">
        <span className="mcc-step-label">
          {tone === 'roast' ? 'Stop burning money' : 'Optimization tips'}
        </span>
        <span className="mcc-tips-annual-note">
          Based on {meetingType.replace('_', '-')} recurrence
        </span>
      </div>
      <ul className="mcc-tips-list">
        {tips.map((tip) => (
          <li key={tip.key} className="mcc-tip-item">{tip.text}</li>
        ))}
      </ul>
    </div>
  );
}
