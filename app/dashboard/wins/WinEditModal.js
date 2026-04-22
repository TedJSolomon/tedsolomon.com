'use client';

import { useActionState, useEffect, useState } from 'react';
import { updateWin } from './actions';
import TagPicker from './TagPicker';
import { CATEGORIES, VISIBILITIES, METRIC_TYPES } from './constants';

function parseImpactForEdit(impact) {
  if (!impact) return { type: '', value: '' };
  const colonIdx = impact.indexOf(': ');
  if (colonIdx !== -1) {
    const type = impact.slice(0, colonIdx);
    const value = impact.slice(colonIdx + 2);
    if (METRIC_TYPES.includes(type)) return { type, value };
  }
  return { type: 'Custom', value: impact };
}

export default function WinEditModal({ win, existingTags, onClose }) {
  const { type: initType, value: initValue } = parseImpactForEdit(win.impact);
  const [metricType, setMetricType] = useState(initType);
  const [metricValue, setMetricValue] = useState(initValue);

  const boundAction = updateWin.bind(null, win.id);
  const [state, formAction, pending] = useActionState(boundAction, {});

  // Close on success
  useEffect(() => {
    if (state?.success) onClose();
  }, [state, onClose]);

  // Lock body scroll; close on Escape
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const impactCombined =
    metricType && metricValue
      ? metricType === 'Custom'
        ? metricValue
        : `${metricType}: ${metricValue}`
      : '';

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-label="Edit Win">

        <div className="modal-header">
          <span className="modal-title">Edit Win</span>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <form action={formAction} className="wins-form">

          {/* Row 1: date / category / visibility */}
          <div className="wins-fields-row">
            <div className="wins-field">
              <label className="wins-label" htmlFor="edit-date">Date</label>
              <input
                id="edit-date"
                name="date"
                type="date"
                className="wins-input"
                defaultValue={win.date}
                required
              />
            </div>

            <div className="wins-field">
              <label className="wins-label" htmlFor="edit-category">Category</label>
              <select
                id="edit-category"
                name="category"
                className="wins-select"
                defaultValue={win.category}
                required
              >
                <option value="" disabled>Select…</option>
                {CATEGORIES.map(({ value, label, desc }) => (
                  <option key={value} value={value} title={desc}>{label}</option>
                ))}
              </select>
            </div>

            <div className="wins-field">
              <label className="wins-label" htmlFor="edit-visibility">Visibility</label>
              <select
                id="edit-visibility"
                name="visibility"
                className="wins-select"
                defaultValue={win.visibility}
                required
              >
                <option value="" disabled>Select…</option>
                {VISIBILITIES.map((v) => (
                  <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: impact metric */}
          <div className="wins-field">
            <label className="wins-label">
              Impact Metric <span className="wins-label-optional">(optional)</span>
            </label>
            <div className="wins-impact-row">
              <select
                className="wins-select wins-impact-type"
                value={metricType}
                onChange={(e) => { setMetricType(e.target.value); setMetricValue(''); }}
              >
                <option value="">None</option>
                {METRIC_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {metricType && (
                <input
                  type="text"
                  className="wins-input wins-impact-value"
                  value={metricValue}
                  onChange={(e) => setMetricValue(e.target.value)}
                  placeholder={
                    metricType === 'Custom'
                      ? 'Describe the impact…'
                      : 'e.g. 40%, $12k, 200 users'
                  }
                />
              )}
            </div>
            <input type="hidden" name="impact" value={impactCombined} />
          </div>

          {/* Row 3: description */}
          <div className="wins-field">
            <label className="wins-label" htmlFor="edit-description">Description</label>
            <textarea
              id="edit-description"
              name="description"
              className="wins-textarea"
              rows={3}
              defaultValue={win.description}
              required
            />
          </div>

          {/* Row 4: tags */}
          <div className="wins-field">
            <label className="wins-label">
              Tags <span className="wins-label-optional">(pick or create)</span>
            </label>
            <TagPicker existingTags={existingTags} initialSelected={win.tags} />
          </div>

          {state?.error && <p className="wins-form-error" role="alert">{state.error}</p>}

          <div className="modal-actions">
            <button type="submit" className="btn-primary wins-submit" disabled={pending}>
              {pending ? 'Saving…' : 'Save Changes →'}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
