'use client';

import { useState } from 'react';
import { copy } from './lib/copy';
import { formatCurrency, formatElapsed, costPerMinute } from './lib/cost';

export default function Receipt({ title, attendees, result, tone }) {
  const [copied, setCopied] = useState(false);
  const { elapsed, actualCost, delta } = result;
  const cpm = costPerMinute(attendees);
  const costPerAttendee = attendees.length > 0 ? actualCost / attendees.length : 0;
  const saved = delta > 0;
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const comparison = copy('receipt_comparison', tone, { cost: actualCost });
  const footer = copy('receipt_footer', tone);

  function buildSlackText() {
    const lines = [
      '📋 *Meeting Receipt*',
      '──────────────────────',
      title ? `*Meeting:* ${title}` : null,
      `*Date:* ${dateStr}`,
      `*Attendees:* ${attendees.length} (${attendees.map((a) => a.name.split(' ')[0]).join(', ')})`,
      `*Duration:* ${formatElapsed(elapsed)}`,
      '──────────────────────',
      `*Total cost:*     ${formatCurrency(actualCost)}`,
      `*Per minute:*   ${formatCurrency(cpm)}`,
      `*Per attendee:* ${formatCurrency(costPerAttendee)}`,
    ].filter(Boolean);

    if (Math.abs(delta) > 0.01) {
      lines.push(saved
        ? `✅ Saved ${formatCurrency(delta)} by ending early`
        : `🔴 ${formatCurrency(Math.abs(delta))} over budget`);
    }
    if (comparison) lines.push('', comparison);
    if (footer) lines.push(footer);
    return lines.join('\n');
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(buildSlackText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  return (
    <div className="mcc-receipt">
      <div className="mcc-receipt-topbar">
        <div className="mcc-step-label">Meeting Receipt</div>
        <button className="btn-secondary mcc-btn-sm" onClick={handleCopy}>
          {copied ? '✓ Copied!' : 'Copy for Slack'}
        </button>
      </div>

      <div className="mcc-receipt-card">
        <div className="mcc-receipt-card-head">
          <div className="mcc-receipt-title">{title || 'Meeting'}</div>
          <div className="mcc-receipt-date">{dateStr}</div>
        </div>

        <div className="mcc-receipt-divider" />

        <div className="mcc-receipt-rows">
          <div className="mcc-receipt-row">
            <span>Attendees</span>
            <span>{attendees.length}</span>
          </div>
          <div className="mcc-receipt-row">
            <span>Duration</span>
            <span>{formatElapsed(elapsed)}</span>
          </div>
          <div className="mcc-receipt-row">
            <span>Cost / minute</span>
            <span>{formatCurrency(cpm)}</span>
          </div>
          <div className="mcc-receipt-row">
            <span>Cost / attendee</span>
            <span>{formatCurrency(costPerAttendee)}</span>
          </div>
        </div>

        <div className="mcc-receipt-divider" />

        <div className="mcc-receipt-total-row">
          <span>Total cost</span>
          <span className="mcc-receipt-total-val">{formatCurrency(actualCost)}</span>
        </div>

        {Math.abs(delta) > 0.01 && (
          <div className={`mcc-receipt-delta${saved ? ' mcc-receipt-delta--saved' : ' mcc-receipt-delta--over'}`}>
            {saved
              ? `Saved ${formatCurrency(delta)} by ending early ✓`
              : `${formatCurrency(Math.abs(delta))} over budget`}
          </div>
        )}

        {comparison && <div className="mcc-receipt-comparison">{comparison}</div>}
        {footer && <div className="mcc-receipt-footer">{footer}</div>}
      </div>
    </div>
  );
}
