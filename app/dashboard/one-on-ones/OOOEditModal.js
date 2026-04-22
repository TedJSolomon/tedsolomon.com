'use client';

import { useActionState, useEffect } from 'react';
import { updateOOO } from './actions';

export default function OOOEditModal({ ooo, onClose }) {
  const boundAction = updateOOO.bind(null, ooo.id);
  const [state, formAction, pending] = useActionState(boundAction, {});

  useEffect(() => {
    if (state?.success) onClose();
  }, [state, onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-label="Edit 1-on-1">

        <div className="modal-header">
          <span className="modal-title">Edit 1-on-1 — {ooo.person_name}</span>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <form action={formAction} className="wins-form">

          {/* Row 1: person name + role */}
          <div className="ooo-top-row">
            <div className="wins-field ooo-field-name">
              <label className="wins-label" htmlFor="edit-ooo-name">Person Name</label>
              <input
                id="edit-ooo-name"
                name="person_name"
                type="text"
                className="wins-input"
                defaultValue={ooo.person_name}
                required
              />
            </div>
            <div className="wins-field ooo-field-role">
              <label className="wins-label" htmlFor="edit-ooo-role">
                Role <span className="wins-label-optional">(optional)</span>
              </label>
              <input
                id="edit-ooo-role"
                name="person_role"
                type="text"
                className="wins-input"
                defaultValue={ooo.person_role}
              />
            </div>
          </div>

          {/* Row 2: date + follow-up */}
          <div className="ooo-dates-row">
            <div className="wins-field">
              <label className="wins-label" htmlFor="edit-ooo-date">Date</label>
              <input
                id="edit-ooo-date"
                name="date"
                type="date"
                className="wins-input"
                defaultValue={ooo.date}
                required
              />
            </div>
            <div className="wins-field">
              <label className="wins-label" htmlFor="edit-ooo-followup">
                Follow-up Date <span className="wins-label-optional">(optional)</span>
              </label>
              <input
                id="edit-ooo-followup"
                name="follow_up_date"
                type="date"
                className="wins-input"
                defaultValue={ooo.follow_up_date}
              />
            </div>
          </div>

          {/* Textareas */}
          <div className="ooo-textareas-grid">
            <div className="wins-field">
              <label className="wins-label" htmlFor="edit-ooo-talking">Talking Points</label>
              <textarea
                id="edit-ooo-talking"
                name="talking_points"
                className="wins-textarea"
                rows={3}
                defaultValue={ooo.talking_points}
              />
            </div>
            <div className="wins-field">
              <label className="wins-label" htmlFor="edit-ooo-feedback">Their Feedback</label>
              <textarea
                id="edit-ooo-feedback"
                name="their_feedback"
                className="wins-textarea"
                rows={3}
                defaultValue={ooo.their_feedback}
              />
            </div>
            <div className="wins-field">
              <label className="wins-label" htmlFor="edit-ooo-notes">My Notes</label>
              <textarea
                id="edit-ooo-notes"
                name="my_notes"
                className="wins-textarea"
                rows={3}
                defaultValue={ooo.my_notes}
              />
            </div>
            <div className="wins-field">
              <label className="wins-label" htmlFor="edit-ooo-actions">Action Items</label>
              <textarea
                id="edit-ooo-actions"
                name="action_items"
                className="wins-textarea"
                rows={3}
                defaultValue={ooo.action_items}
              />
            </div>
          </div>

          {state?.error && <p className="wins-form-error" role="alert">{state.error}</p>}

          <div className="modal-actions">
            <button type="submit" className="btn-primary wins-submit" disabled={pending}>
              {pending ? 'Saving…' : 'Save Changes →'}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          </div>

        </form>
      </div>
    </div>
  );
}
