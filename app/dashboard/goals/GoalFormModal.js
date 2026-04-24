'use client';

import { useActionState, useEffect, useState, useRef } from 'react';
import { createGoal, updateGoal } from './actions';
import { CATEGORIES, STATUSES, MEASURE_TYPES } from '../../lib/goals';

// ── Inline subtask builder (create mode only) ─────────────────────────────────
function SubtaskBuilder({ subtasks, onChange }) {
  const [title,       setTitle]       = useState('');
  const [dueDate,     setDueDate]     = useState('');
  const [measureType, setMeasureType] = useState('Yes/No');
  const [measureUnit, setMeasureUnit] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [threshold,   setThreshold]   = useState('');
  const titleRef = useRef(null);

  const showUnit = measureType === 'Count (each)' || measureType === 'Custom';

  function handleAdd(e) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    if (measureType !== 'Yes/No' && !targetValue) return;
    onChange([...subtasks, {
      title:                trimmed,
      due_date:             dueDate || null,
      measure_type:         measureType,
      measure_unit:         showUnit ? (measureUnit.trim() || null) : null,
      target_value:         measureType !== 'Yes/No' ? parseFloat(targetValue) : null,
      completion_threshold: measureType !== 'Yes/No' && threshold
        ? parseFloat(threshold)
        : null,
    }]);
    setTitle(''); setDueDate(''); setMeasureType('Yes/No');
    setMeasureUnit(''); setTargetValue(''); setThreshold('');
    titleRef.current?.focus();
  }

  function handleRemove(idx) {
    onChange(subtasks.filter((_, i) => i !== idx));
  }

  function handleTypeChange(e) {
    setMeasureType(e.target.value);
    setTargetValue(''); setMeasureUnit(''); setThreshold('');
  }

  return (
    <div className="goal-subtask-builder">
      <span className="wins-label">
        Subtasks <span className="wins-label-optional">(optional — add before saving)</span>
      </span>

      {subtasks.length > 0 && (
        <ul className="goal-builder-list">
          {subtasks.map((s, i) => (
            <li key={i} className="goal-builder-item">
              <span className="goal-builder-item-title">{s.title}</span>
              {s.measure_type && s.measure_type !== 'Yes/No' && (
                <span className="goal-builder-item-measure">
                  {s.measure_type === 'Custom' && s.measure_unit
                    ? `${s.measure_unit}: ${s.target_value}`
                    : `${s.measure_type}: ${s.target_value}`}
                  {s.completion_threshold != null && s.completion_threshold !== s.target_value
                    ? ` (thr: ${s.completion_threshold})`
                    : ''}
                </span>
              )}
              {s.due_date && <span className="goal-builder-item-due">{s.due_date}</span>}
              <button
                type="button"
                className="goal-builder-remove"
                onClick={() => handleRemove(i)}
                aria-label={`Remove ${s.title}`}
              >×</button>
            </li>
          ))}
        </ul>
      )}

      <div className="goal-builder-inputs">
        <input
          ref={titleRef}
          type="text"
          className="wins-input goal-subtask-input"
          placeholder="Subtask title…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(e); }}
        />
        <select
          className="wins-input wins-select goal-measure-select"
          value={measureType}
          onChange={handleTypeChange}
        >
          {MEASURE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {showUnit && (
        <input
          type="text"
          className="wins-input goal-measure-unit-input"
          placeholder={measureType === 'Custom' ? 'Unit name…' : 'Unit label (e.g. automations)…'}
          value={measureUnit}
          onChange={(e) => setMeasureUnit(e.target.value)}
        />
      )}

      {measureType !== 'Yes/No' && (
        <div className="goal-builder-inputs">
          <input
            type="number"
            className="wins-input goal-target-input"
            placeholder="Target value…"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            min={0}
            step="any"
          />
          <input
            type="number"
            className="wins-input goal-threshold-input"
            placeholder="Threshold (optional)…"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            min={0}
            step="any"
          />
        </div>
      )}

      <div className="goal-builder-inputs">
        <input
          type="date"
          className="wins-input goal-subtask-date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <button
          type="button"
          className="btn-secondary goal-builder-add-btn"
          onClick={handleAdd}
          disabled={!title.trim() || (measureType !== 'Yes/No' && !targetValue)}
        >
          Add
        </button>
      </div>
    </div>
  );
}

// ── Goal measurement section (controlled, for conditional rendering) ───────────
function GoalMeasureSection({ goal }) {
  const [measureType, setMeasureType] = useState(goal?.measure_type || '');

  const showUnit    = measureType === 'Count (each)' || measureType === 'Custom';
  const showNumeric = measureType && measureType !== 'Yes/No';

  function handleTypeChange(e) {
    setMeasureType(e.target.value);
  }

  return (
    <div className="goal-measure-section">
      <div className="ooo-top-row">
        <div className="wins-field">
          <label className="wins-label" htmlFor="goal-measure-type">
            Measurement <span className="wins-label-optional">(optional)</span>
          </label>
          <select
            id="goal-measure-type"
            name="measure_type"
            className="wins-input wins-select"
            value={measureType}
            onChange={handleTypeChange}
          >
            <option value="">No measurement</option>
            {MEASURE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {showUnit && (
          <div className="wins-field">
            <label className="wins-label" htmlFor="goal-measure-unit">
              Unit{measureType === 'Count (each)' && <span className="wins-label-optional"> (optional)</span>}
            </label>
            <input
              id="goal-measure-unit"
              name="measure_unit"
              type="text"
              className="wins-input"
              defaultValue={goal?.measure_unit ?? ''}
              placeholder={measureType === 'Custom' ? 'Unit name…' : 'e.g. automations'}
            />
          </div>
        )}
      </div>

      {showNumeric && (
        <div className="ooo-top-row">
          <div className="wins-field">
            <label className="wins-label" htmlFor="goal-target-value">Target Value</label>
            <input
              id="goal-target-value"
              name="target_value"
              type="number"
              className="wins-input"
              defaultValue={goal?.target_value ?? ''}
              min={0}
              step="any"
              placeholder="e.g. 10000"
              required
            />
          </div>
          <div className="wins-field">
            <label className="wins-label" htmlFor="goal-comp-threshold">
              Completion Threshold <span className="wins-label-optional">(optional)</span>
            </label>
            <input
              id="goal-comp-threshold"
              name="completion_threshold"
              type="number"
              className="wins-input"
              defaultValue={goal?.completion_threshold ?? ''}
              min={0}
              step="any"
              placeholder="e.g. 6000"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────
export default function GoalFormModal({ goal, onClose }) {
  const isEdit = Boolean(goal);
  const action = isEdit ? updateGoal.bind(null, goal.id) : createGoal;
  const [state, formAction, pending] = useActionState(action, {});
  const [subtasks, setSubtasks] = useState([]);

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
      <div className="modal-card goal-modal-card" role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit Goal' : 'New Goal'}>

        <div className="modal-header">
          <span className="modal-title">{isEdit ? `Edit Goal — ${goal.title}` : 'Create New Goal'}</span>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <form action={formAction} className="wins-form">

          <div className="wins-field">
            <label className="wins-label" htmlFor="goal-title">Title</label>
            <input
              id="goal-title"
              name="title"
              type="text"
              className="wins-input"
              defaultValue={goal?.title}
              required
            />
          </div>

          <div className="wins-field">
            <label className="wins-label" htmlFor="goal-description">
              Description <span className="wins-label-optional">(optional)</span>
            </label>
            <textarea
              id="goal-description"
              name="description"
              className="wins-textarea"
              rows={3}
              defaultValue={goal?.description}
            />
          </div>

          <div className="ooo-top-row">
            <div className="wins-field">
              <label className="wins-label" htmlFor="goal-category">Category</label>
              <select id="goal-category" name="category" className="wins-input wins-select" defaultValue={goal?.category || ''} required>
                <option value="" disabled>Select category…</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="wins-field">
              <label className="wins-label" htmlFor="goal-status">Status</label>
              <select id="goal-status" name="status" className="wins-input wins-select" defaultValue={goal?.status || 'active'}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="wins-field">
            <label className="wins-label" htmlFor="goal-target-date">
              Target Date <span className="wins-label-optional">(optional)</span>
            </label>
            <input
              id="goal-target-date"
              name="target_date"
              type="date"
              className="wins-input"
              defaultValue={goal?.target_date}
            />
          </div>

          {/* Goal-level measurement fields */}
          <GoalMeasureSection goal={goal} />

          {/* Inline subtask builder — create mode only */}
          {!isEdit && (
            <>
              <SubtaskBuilder subtasks={subtasks} onChange={setSubtasks} />
              <input type="hidden" name="subtasks" value={JSON.stringify(subtasks)} />
            </>
          )}

          {state?.error && <p className="wins-form-error" role="alert">{state.error}</p>}

          <div className="modal-actions">
            <button type="submit" className="btn-primary wins-submit" disabled={pending}>
              {pending ? 'Saving…' : isEdit ? 'Save Changes →' : 'Create Goal →'}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          </div>

        </form>
      </div>
    </div>
  );
}
