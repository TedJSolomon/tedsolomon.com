'use client';

import { useState, useTransition } from 'react';
import { deleteWin } from './actions';
import WinEditModal from './WinEditModal';
import { CATEGORIES } from './constants';

const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(({ value, label }) => [value, label]));
const VISIBILITY_LABELS = { resume: 'Resume', raise: 'Raise', both: 'Both' };

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function parseImpact(impact) {
  if (!impact) return { type: null, value: null };
  const colonIdx = impact.indexOf(': ');
  if (colonIdx === -1) return { type: 'Impact', value: impact };
  return { type: impact.slice(0, colonIdx), value: impact.slice(colonIdx + 2) };
}

export default function WinCard({ win, existingTags }) {
  const [editing, setEditing] = useState(false);
  const [deletePending, startDelete] = useTransition();

  function handleDelete() {
    if (!confirm('Delete this win? This cannot be undone.')) return;
    startDelete(() => deleteWin(win.filename));
  }

  const { type: impactType, value: impactValue } = parseImpact(win.impact);

  return (
    <>
      <div className={`win-card win-card--${win.category}`}>

        {/* Top row: date + badges + actions */}
        <div className="win-card-top">
          <div className="win-card-meta">
            <span className="win-date">{formatDate(win.date)}</span>
            <span className={`win-badge win-badge--${win.category}`}>
              {CATEGORY_MAP[win.category] || win.category}
            </span>
            <span className="win-badge win-badge--vis">
              {VISIBILITY_LABELS[win.visibility] || win.visibility}
            </span>
          </div>
          <div className="win-card-actions">
            <button
              type="button"
              className="win-edit-btn"
              onClick={() => setEditing(true)}
            >
              Edit
            </button>
            <button
              type="button"
              className="win-delete-btn"
              onClick={handleDelete}
              disabled={deletePending}
            >
              {deletePending ? '…' : 'Delete'}
            </button>
          </div>
        </div>

        {/* Impact */}
        {impactType && impactValue && (
          <div className="win-impact-block">
            <span className="win-impact-type">{impactType}</span>
            <span className="win-impact-value">{impactValue}</span>
          </div>
        )}

        {/* Description */}
        <p className="win-description">{win.description}</p>

        {/* Tags */}
        {win.tags.length > 0 && (
          <div className="win-tags">
            {win.tags.map((t) => (
              <span key={t} className="tag-chip tag-chip--muted">{t}</span>
            ))}
          </div>
        )}

      </div>

      {editing && (
        <WinEditModal
          win={win}
          existingTags={existingTags}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  );
}
