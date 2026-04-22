'use client';

import { useActionState, useEffect, useState } from 'react';
import { addOOO } from './actions';

export default function OOOForm({ today }) {
  const [state, formAction, pending] = useActionState(addOOO, {});
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (state?.success) setFormKey((k) => k + 1);
  }, [state]);

  return (
    <div className="wins-form-card ooo-form-card">
      <div className="wins-form-heading">Log a 1-on-1</div>
      <form key={formKey} action={formAction} className="wins-form">

        {/* Row 1: person name + role */}
        <div className="ooo-top-row">
          <div className="wins-field ooo-field-name">
            <label className="wins-label" htmlFor="ooo-person-name">Person Name</label>
            <input
              id="ooo-person-name"
              name="person_name"
              type="text"
              className="wins-input"
              placeholder="e.g. Sarah Chen"
              required
            />
          </div>
          <div className="wins-field ooo-field-role">
            <label className="wins-label" htmlFor="ooo-person-role">
              Role <span className="wins-label-optional">(optional)</span>
            </label>
            <input
              id="ooo-person-role"
              name="person_role"
              type="text"
              className="wins-input"
              placeholder="e.g. CPO, Team Lead"
            />
          </div>
        </div>

        {/* Row 2: date + follow-up date */}
        <div className="ooo-dates-row">
          <div className="wins-field">
            <label className="wins-label" htmlFor="ooo-date">Date</label>
            <input
              id="ooo-date"
              name="date"
              type="date"
              className="wins-input"
              defaultValue={today}
              required
            />
          </div>
          <div className="wins-field">
            <label className="wins-label" htmlFor="ooo-followup">
              Follow-up Date <span className="wins-label-optional">(optional)</span>
            </label>
            <input
              id="ooo-followup"
              name="follow_up_date"
              type="date"
              className="wins-input"
            />
          </div>
        </div>

        {/* Textareas 2×2 */}
        <div className="ooo-textareas-grid">
          <div className="wins-field">
            <label className="wins-label" htmlFor="ooo-talking">Talking Points</label>
            <textarea
              id="ooo-talking"
              name="talking_points"
              className="wins-textarea"
              rows={3}
              placeholder="What did you plan to discuss?"
            />
          </div>
          <div className="wins-field">
            <label className="wins-label" htmlFor="ooo-feedback">Their Feedback</label>
            <textarea
              id="ooo-feedback"
              name="their_feedback"
              className="wins-textarea"
              rows={3}
              placeholder="What did they tell you?"
            />
          </div>
          <div className="wins-field">
            <label className="wins-label" htmlFor="ooo-notes">My Notes</label>
            <textarea
              id="ooo-notes"
              name="my_notes"
              className="wins-textarea"
              rows={3}
              placeholder="Your takeaways…"
            />
          </div>
          <div className="wins-field">
            <label className="wins-label" htmlFor="ooo-actions">Action Items</label>
            <textarea
              id="ooo-actions"
              name="action_items"
              className="wins-textarea"
              rows={3}
              placeholder="What did you commit to doing?"
            />
          </div>
        </div>

        {state?.error   && <p className="wins-form-error"   role="alert">{state.error}</p>}
        {state?.success && <p className="wins-form-success" role="status">Meeting logged.</p>}

        <button type="submit" className="btn-primary wins-submit" disabled={pending}>
          {pending ? 'Saving…' : 'Log Meeting →'}
        </button>
      </form>
    </div>
  );
}
