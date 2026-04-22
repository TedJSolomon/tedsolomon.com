'use client';

import { useState, useTransition } from 'react';
import { deleteOOO } from './actions';
import OOOEditModal from './OOOEditModal';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  return dateStr < new Date().toLocaleDateString('en-CA');
}

function previewText(ooo) {
  return ooo.action_items || ooo.my_notes || ooo.talking_points || '';
}

function OOOField({ label, value }) {
  if (!value) return null;
  return (
    <div className="ooo-field-group">
      <span className="ooo-field-label">{label}</span>
      <p className="ooo-field-value">{value}</p>
    </div>
  );
}

export default function OOOCard({ ooo }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deletePending, startDelete] = useTransition();

  function handleDelete(e) {
    e.stopPropagation();
    if (!confirm(`Delete this 1-on-1 with ${ooo.person_name}? This cannot be undone.`)) return;
    startDelete(() => deleteOOO(ooo.id));
  }

  function handleEdit(e) {
    e.stopPropagation();
    setEditing(true);
  }

  const preview = previewText(ooo);
  const overdue = isOverdue(ooo.follow_up_date);

  return (
    <>
      <div
        className={`ooo-card${expanded ? ' expanded' : ''}`}
        onClick={() => setExpanded((v) => !v)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded((v) => !v); } }}
        aria-expanded={expanded}
      >
        {/* Card header — always visible */}
        <div className="ooo-card-header">
          <div className="ooo-card-header-left">
            <span className="ooo-card-date">{formatDate(ooo.date)}</span>

            <div className="ooo-card-badges">
              {ooo.person_role && (
                <span className="ooo-role-badge">{ooo.person_role}</span>
              )}
              {ooo.follow_up_date && (
                <span className={`ooo-followup-badge${overdue ? ' overdue' : ''}`}>
                  Follow-up {formatDate(ooo.follow_up_date)}
                </span>
              )}
            </div>

            {!expanded && preview && (
              <p className="ooo-card-preview">{preview}</p>
            )}
          </div>

          <div className="ooo-card-right" onClick={(e) => e.stopPropagation()}>
            <div className="win-card-actions">
              <button type="button" className="win-edit-btn" onClick={handleEdit}>
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
            <span className="ooo-card-toggle" aria-hidden="true">
              {expanded ? '▲' : '▼'}
            </span>
          </div>
        </div>

        {/* Expanded body */}
        {expanded && (
          <div className="ooo-card-body" onClick={(e) => e.stopPropagation()}>
            <OOOField label="Talking Points"  value={ooo.talking_points} />
            <OOOField label="Their Feedback"  value={ooo.their_feedback} />
            <OOOField label="My Notes"        value={ooo.my_notes} />
            <OOOField label="Action Items"    value={ooo.action_items} />
          </div>
        )}
      </div>

      {editing && (
        <OOOEditModal ooo={ooo} onClose={() => setEditing(false)} />
      )}
    </>
  );
}
