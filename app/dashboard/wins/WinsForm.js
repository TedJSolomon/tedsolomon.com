'use client';

import { useActionState, useEffect, useState } from 'react';
import { addWin } from './actions';
import TagPicker from './TagPicker';
import { CATEGORIES, VISIBILITIES, METRIC_TYPES } from './constants';

export default function WinsForm({ today, existingTags = [] }) {
  const [state, formAction, pending] = useActionState(addWin, {});
  // Bump this key to force a full remount (resetting all sub-component state)
  const [formKey, setFormKey] = useState(0);
  const [metricType, setMetricType] = useState('');
  const [metricValue, setMetricValue] = useState('');

  useEffect(() => {
    if (state?.success) {
      setFormKey((k) => k + 1);
      setMetricType('');
      setMetricValue('');
    }
  }, [state]);

  const impactCombined =
    metricType && metricValue
      ? metricType === 'Custom'
        ? metricValue
        : `${metricType}: ${metricValue}`
      : '';

  return (
    <div className="wins-form-card">
      <div className="wins-form-heading">Log a Win</div>
      <form key={formKey} action={formAction} className="wins-form">

        {/* Row 1: date / category / visibility */}
        <div className="wins-fields-row">
          <div className="wins-field">
            <label className="wins-label" htmlFor="win-date">Date</label>
            <input
              id="win-date"
              name="date"
              type="date"
              className="wins-input"
              defaultValue={today}
              required
            />
          </div>

          <div className="wins-field">
            <label className="wins-label" htmlFor="win-category">Category</label>
            <select id="win-category" name="category" className="wins-select" required>
              <option value="" disabled>Select…</option>
              {CATEGORIES.map(({ value, label, desc }) => (
                <option key={value} value={value} title={desc}>{label}</option>
              ))}
            </select>
          </div>

          <div className="wins-field">
            <label className="wins-label" htmlFor="win-visibility">Visibility</label>
            <select id="win-visibility" name="visibility" className="wins-select" required>
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
          {/* Hidden input consumed by server action */}
          <input type="hidden" name="impact" value={impactCombined} />
        </div>

        {/* Row 3: description */}
        <div className="wins-field">
          <label className="wins-label" htmlFor="win-description">Description</label>
          <textarea
            id="win-description"
            name="description"
            className="wins-textarea"
            rows={3}
            placeholder="What did you ship, learn, or lead today?"
            required
          />
        </div>

        {/* Row 4: tags */}
        <div className="wins-field">
          <label className="wins-label">
            Tags <span className="wins-label-optional">(pick or create)</span>
          </label>
          <TagPicker existingTags={existingTags} />
        </div>

        {state?.error && <p className="wins-form-error" role="alert">{state.error}</p>}
        {state?.success && <p className="wins-form-success" role="status">Win logged.</p>}

        <button type="submit" className="btn-primary wins-submit" disabled={pending}>
          {pending ? 'Saving…' : 'Log Win →'}
        </button>
      </form>
    </div>
  );
}
