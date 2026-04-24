'use client';

import { useState, useTransition, useRef, useEffect, useActionState } from 'react';
import {
  deleteGoal, addSubtask, toggleSubtask, deleteSubtask,
  reorderSubtasks, updateSubtaskProgress, updateGoalProgress,
  fetchProgressLog,
} from './actions';
import GoalFormModal from './GoalFormModal';
import GoalProgressChart from './GoalProgressChart';
import { CATEGORY_COLORS, MEASURE_TYPES } from '../../lib/goals';

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function formatProgress(item) {
  const type = item.measure_type || 'Yes/No';
  const cur  = Number(item.current_value ?? 0);
  const tgt  = Number(item.target_value  ?? 0);
  const unit = item.measure_unit || '';
  switch (type) {
    case 'Percentage':    return `${cur}% / ${tgt}%`;
    case 'Currency ($)':  return `$${cur.toLocaleString()} / $${tgt.toLocaleString()}`;
    case 'Hours':         return `${cur}h / ${tgt}h`;
    case 'Weight (lbs)':  return `${cur} / ${tgt} lbs`;
    case 'Count (each)':  return unit ? `${cur} / ${tgt} ${unit}` : `${cur} / ${tgt}`;
    case 'Custom':        return unit ? `${cur} / ${tgt} ${unit}` : `${cur} / ${tgt}`;
    default:              return `${cur} / ${tgt}`;
  }
}

function thresholdPct(threshold, target) {
  if (threshold == null || !target) return null;
  return Math.min(99, Math.max(1, Math.round((Number(threshold) / Number(target)) * 100)));
}

// ── Progress bars ─────────────────────────────────────────────────────────────

function SubtaskProgressBar({ subtasks }) {
  const done = subtasks.filter((s) => s.completed).length;
  const pct  = subtasks.length ? Math.round((done / subtasks.length) * 100) : 0;
  return (
    <div className="goal-progress">
      <div className="goal-progress-bar">
        <div className="goal-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="goal-progress-label">{pct}%</span>
    </div>
  );
}

function GoalMetricBar({ current, target, threshold, measureType, measureUnit }) {
  const tgt   = Number(target  ?? 0);
  const cur   = Number(current ?? 0);
  const pct   = tgt > 0 ? Math.min(100, Math.round((cur / tgt) * 100)) : 0;
  const tPct  = thresholdPct(threshold, tgt);
  const label = formatProgress({
    measure_type: measureType, current_value: cur,
    target_value: tgt, measure_unit: measureUnit,
  });
  return (
    <div className="goal-progress goal-metric-bar">
      <div className="goal-progress-bar">
        <div className="goal-progress-fill" style={{ width: `${pct}%` }} />
        {tPct !== null && (
          <div
            className="goal-progress-threshold-tick"
            style={{ left: `${tPct}%` }}
            title={`Threshold: ${threshold}`}
          />
        )}
      </div>
      <span className="goal-progress-label">{label}</span>
    </div>
  );
}

// ── Subtask row ───────────────────────────────────────────────────────────────

function SubtaskRow({ subtask, goalId, onToggle, onUpdateProgress, onDelete, dragHandlers }) {
  const [toggling, startToggle] = useTransition();
  const [deleting, startDelete] = useTransition();
  const [updating, startUpdate] = useTransition();
  const type    = subtask.measure_type || 'Yes/No';
  const isYesNo = type === 'Yes/No';
  const [localVal, setLocalVal] = useState(String(subtask.current_value ?? 0));
  const [note,     setNote]     = useState('');

  useEffect(() => {
    setLocalVal(String(subtask.current_value ?? 0));
  }, [subtask.current_value]);

  function save(newVal) {
    const savedNote = note;
    setNote('');
    startUpdate(() => onUpdateProgress(subtask.id, newVal, savedNote));
  }

  function handleStep(delta) {
    const newVal = Math.max(0, Number(subtask.current_value ?? 0) + delta);
    setLocalVal(String(newVal));
    save(newVal);
  }

  function handleInputBlur() {
    const newVal = Math.max(0, parseFloat(localVal) || 0);
    save(newVal);
  }

  const tgt   = Number(subtask.target_value ?? 0);
  const cur   = Number(subtask.current_value ?? 0);
  const sPct  = tgt > 0 ? Math.min(100, Math.round((cur / tgt) * 100)) : 0;
  const stPct = thresholdPct(subtask.completion_threshold, tgt);

  return (
    <div
      className={`goal-subtask-row${subtask.completed ? ' completed' : ''}${isYesNo ? '' : ' measure'}`}
      draggable
      data-id={subtask.id}
      {...dragHandlers}
    >
      <div className="goal-subtask-left">
        {isYesNo ? (
          <label className="goal-subtask-check">
            <input
              type="checkbox"
              checked={subtask.completed}
              disabled={toggling}
              onChange={() => startToggle(() => onToggle(subtask.id, !subtask.completed))}
            />
            <span className="goal-subtask-title">{subtask.title}</span>
          </label>
        ) : (
          <div className="goal-subtask-measure">
            <span className="goal-subtask-title">{subtask.title}</span>
            <div className="goal-subtask-progress-row">
              <span className="goal-subtask-progress-text">{formatProgress(subtask)}</span>
              <div className="goal-subtask-controls" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className="goal-subtask-step-btn"
                  onClick={() => handleStep(-1)}
                  disabled={updating || cur <= 0}
                  aria-label="Decrease"
                >−</button>
                <input
                  type="number"
                  className="goal-subtask-value-input"
                  value={localVal}
                  min={0}
                  step="any"
                  onChange={(e) => setLocalVal(e.target.value)}
                  onBlur={handleInputBlur}
                  disabled={updating}
                  aria-label="Current value"
                />
                <button
                  type="button"
                  className="goal-subtask-step-btn"
                  onClick={() => handleStep(1)}
                  disabled={updating}
                  aria-label="Increase"
                >+</button>
              </div>
            </div>
            {/* Note input */}
            <div className="goal-note-row" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                className="goal-note-input"
                placeholder="Add a note…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); handleInputBlur(); }
                }}
                disabled={updating}
                maxLength={200}
              />
            </div>
            {/* Mini progress bar with threshold tick */}
            {tgt > 0 && (
              <div className="goal-subtask-mini-wrap">
                <div className="goal-subtask-mini-fill" style={{ width: `${sPct}%` }} />
                {stPct !== null && (
                  <div
                    className="goal-subtask-mini-threshold"
                    style={{ left: `${stPct}%` }}
                    title={`Threshold: ${subtask.completion_threshold}`}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="goal-subtask-right">
        {subtask.due_date && (
          <span className={`goal-subtask-due${isOverdue(subtask.due_date) && !subtask.completed ? ' overdue' : ''}`}>
            {formatDate(subtask.due_date)}
          </span>
        )}
        <button
          type="button"
          className="win-delete-btn goal-subtask-del"
          disabled={deleting}
          onClick={(e) => { e.stopPropagation(); startDelete(() => onDelete(subtask.id)); }}
        >
          {deleting ? '…' : '×'}
        </button>
      </div>
    </div>
  );
}

// ── Add subtask form ──────────────────────────────────────────────────────────

function AddSubtaskForm({ goalId }) {
  const boundAction = addSubtask.bind(null, goalId);
  const [state, formAction, pending] = useActionState(boundAction, {});
  const [resetKey,    setResetKey]    = useState(0);
  const [measureType, setMeasureType] = useState('Yes/No');

  useEffect(() => {
    if (state?.success) {
      setResetKey((k) => k + 1);
      setMeasureType('Yes/No');
    }
  }, [state]);

  const showUnit = measureType === 'Count (each)' || measureType === 'Custom';

  return (
    <form key={resetKey} action={formAction} className="goal-add-subtask-form">
      <div className="goal-add-subtask-row">
        <input
          name="title"
          type="text"
          className="wins-input goal-subtask-input"
          placeholder="Add subtask…"
          required
        />
        <select
          name="measure_type"
          className="wins-input wins-select goal-measure-select"
          value={measureType}
          onChange={(e) => setMeasureType(e.target.value)}
        >
          {MEASURE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      {showUnit && (
        <input
          name="measure_unit"
          type="text"
          className="wins-input goal-measure-unit-input"
          placeholder={measureType === 'Custom' ? 'Unit name…' : 'Unit label (e.g. automations)…'}
        />
      )}
      {measureType !== 'Yes/No' && (
        <div className="goal-add-subtask-row">
          <input
            name="target_value"
            type="number"
            className="wins-input goal-target-input"
            placeholder="Target value…"
            min={0}
            step="any"
            required
          />
          <input
            name="completion_threshold"
            type="number"
            className="wins-input goal-threshold-input"
            placeholder="Threshold (optional)…"
            min={0}
            step="any"
          />
        </div>
      )}
      <div className="goal-add-subtask-bottom">
        <input
          name="due_date"
          type="date"
          className="wins-input goal-subtask-date"
        />
        <button type="submit" className="btn-primary goal-subtask-add-btn" disabled={pending}>
          {pending ? '…' : 'Add'}
        </button>
      </div>
      {state?.error && <p className="wins-form-error goal-subtask-err" role="alert">{state.error}</p>}
    </form>
  );
}

// ── Goal card ─────────────────────────────────────────────────────────────────

export default function GoalCard({ goal }) {
  const [expanded,     setExpanded]     = useState(false);
  const [editing,      setEditing]      = useState(false);
  const [deleting,     startDelete]     = useTransition();
  const [goalUpdating, startGoalUpd]    = useTransition();
  const [subtasks,     setSubtasks]     = useState(goal.subtasks || []);
  const [goalCurrent,  setGoalCurrent]  = useState(goal.current_value ?? 0);
  const [localGoalVal, setLocalGoalVal] = useState(String(goal.current_value ?? 0));
  const [goalNote,     setGoalNote]     = useState('');
  const [logs,         setLogs]         = useState(null); // null = not yet fetched
  const dragIdRef = useRef(null);

  // Sync from server revalidation
  useEffect(() => { setSubtasks(goal.subtasks || []); }, [goal.subtasks]);
  useEffect(() => {
    setGoalCurrent(goal.current_value ?? 0);
    setLocalGoalVal(String(goal.current_value ?? 0));
  }, [goal.current_value]);

  // Fetch progress log whenever card is expanded
  useEffect(() => {
    if (!expanded) return;
    let cancelled = false;
    fetchProgressLog(goal.id).then((data) => {
      if (!cancelled) setLogs(data);
    });
    return () => { cancelled = true; };
  }, [expanded, goal.id]);

  const color     = CATEGORY_COLORS[goal.category] || CATEGORY_COLORS.Other;
  const overdue   = isOverdue(goal.target_date) && goal.status === 'active';
  const hasMetric = !!(goal.measure_type);
  const isYesNo   = goal.measure_type === 'Yes/No';
  const isNumeric = hasMetric && !isYesNo;

  // ── Optimistic log append ────────────────────────────────────────────────────

  function appendLog(entry) {
    setLogs((prev) => prev === null ? null : [...prev, entry]);
  }

  // ── Goal-level progress handlers ─────────────────────────────────────────────

  function handleGoalStep(delta) {
    const newVal    = Math.max(0, Number(goalCurrent) + delta);
    const savedNote = goalNote;
    setGoalCurrent(newVal);
    setLocalGoalVal(String(newVal));
    setGoalNote('');
    appendLog({ id: `opt-${Date.now()}`, goal_id: goal.id, subtask_id: null, value: newVal, note: savedNote || null, logged_at: new Date().toISOString() });
    startGoalUpd(() => updateGoalProgress(goal.id, newVal, savedNote));
  }

  function handleGoalInputBlur() {
    const newVal    = Math.max(0, parseFloat(localGoalVal) || 0);
    const savedNote = goalNote;
    setGoalCurrent(newVal);
    setGoalNote('');
    appendLog({ id: `opt-${Date.now()}`, goal_id: goal.id, subtask_id: null, value: newVal, note: savedNote || null, logged_at: new Date().toISOString() });
    startGoalUpd(() => updateGoalProgress(goal.id, newVal, savedNote));
  }

  function handleGoalToggle(checked) {
    const newVal = checked ? 1 : 0;
    setGoalCurrent(newVal);
    startGoalUpd(() => updateGoalProgress(goal.id, newVal, ''));
  }

  // ── Goal delete ───────────────────────────────────────────────────────────────

  function handleDelete(e) {
    e.stopPropagation();
    if (!confirm(`Delete "${goal.title}" and all its subtasks? This cannot be undone.`)) return;
    startDelete(() => deleteGoal(goal.id));
  }

  // ── Subtask handlers ──────────────────────────────────────────────────────────

  async function handleToggle(id, newVal) {
    setSubtasks((prev) => prev.map((s) => s.id === id ? { ...s, completed: newVal } : s));
    await toggleSubtask(id, newVal);
  }

  async function handleUpdateProgress(id, current_value, note) {
    setSubtasks((prev) => prev.map((s) => {
      if (s.id !== id) return s;
      const threshold = s.completion_threshold ?? s.target_value;
      const completed = threshold != null && Number(current_value) >= Number(threshold);
      return { ...s, current_value, completed };
    }));
    appendLog({ id: `opt-${Date.now()}`, goal_id: goal.id, subtask_id: id, value: current_value, note: note || null, logged_at: new Date().toISOString() });
    await updateSubtaskProgress(id, current_value, note, goal.id);
  }

  async function handleDeleteSubtask(id) {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
    await deleteSubtask(id);
  }

  // ── Drag-and-drop ─────────────────────────────────────────────────────────────

  const dragHandlers = {
    onDragStart(e) {
      dragIdRef.current = e.currentTarget.dataset.id;
      e.currentTarget.classList.add('dragging');
    },
    onDragEnd(e) { e.currentTarget.classList.remove('dragging'); },
    onDragOver(e) {
      e.preventDefault();
      e.currentTarget.classList.add('drag-over');
    },
    onDragLeave(e) { e.currentTarget.classList.remove('drag-over'); },
    onDrop(e) {
      e.preventDefault();
      e.currentTarget.classList.remove('drag-over');
      const draggedId = dragIdRef.current;
      const targetId  = e.currentTarget.dataset.id;
      if (!draggedId || draggedId === targetId) return;
      setSubtasks((prev) => {
        const arr     = [...prev];
        const fromIdx = arr.findIndex((s) => s.id === draggedId);
        const toIdx   = arr.findIndex((s) => s.id === targetId);
        const [item]  = arr.splice(fromIdx, 1);
        arr.splice(toIdx, 0, item);
        reorderSubtasks(arr.map((s) => s.id));
        return arr;
      });
    },
  };

  const statusLabel = goal.status.charAt(0).toUpperCase() + goal.status.slice(1);

  return (
    <>
      <div
        className={`goal-card${expanded ? ' expanded' : ''}`}
        style={{ '--cat': color.bg, '--cat-rgb': color.rgb }}
      >
        {/* ── Header ── */}
        <div
          className="goal-card-header"
          role="button"
          tabIndex={0}
          onClick={() => setExpanded((v) => !v)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded((v) => !v); } }}
          aria-expanded={expanded}
        >
          <div className="goal-card-header-left">
            <div className="goal-card-title-row">
              <h3 className="goal-card-title">{goal.title}</h3>
              <span className={`goal-status-badge goal-status-${goal.status}`}>{statusLabel}</span>
            </div>

            <div className="goal-card-meta">
              <span className="goal-cat-badge">{goal.category}</span>
              {goal.target_date && (
                <span className={`goal-target-date${overdue ? ' overdue' : ''}`}>
                  {overdue ? 'Overdue · ' : 'Target · '}{formatDate(goal.target_date)}
                </span>
              )}
            </div>

            {subtasks.length > 0 && <SubtaskProgressBar subtasks={subtasks} />}

            {isNumeric && (
              <GoalMetricBar
                current={goalCurrent}
                target={goal.target_value}
                threshold={goal.completion_threshold}
                measureType={goal.measure_type}
                measureUnit={goal.measure_unit}
              />
            )}
          </div>

          <div className="goal-card-actions" onClick={(e) => e.stopPropagation()}>
            <div className="win-card-actions">
              <button
                type="button"
                className="win-edit-btn"
                onClick={(e) => { e.stopPropagation(); setEditing(true); }}
              >
                Edit
              </button>
              <button
                type="button"
                className="win-delete-btn"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? '…' : 'Delete'}
              </button>
            </div>
            <span className="ooo-card-toggle" aria-hidden="true">{expanded ? '▲' : '▼'}</span>
          </div>
        </div>

        {/* ── Expanded body ── */}
        {expanded && (
          <div className="goal-card-body">
            {goal.description && <p className="goal-description">{goal.description}</p>}

            {/* Goal-level metric controls */}
            {hasMetric && (
              <div className="goal-metric-section">
                <span className="goal-subtasks-label">Goal Metric</span>
                {isYesNo ? (
                  <label className="goal-subtask-check goal-metric-yesno-check">
                    <input
                      type="checkbox"
                      checked={goalCurrent >= 1}
                      disabled={goalUpdating}
                      onChange={(e) => handleGoalToggle(e.target.checked)}
                    />
                    <span className="goal-subtask-title">Mark as achieved</span>
                  </label>
                ) : (
                  <>
                    <div className="goal-metric-update-row">
                      <span className="goal-subtask-progress-text">
                        {formatProgress({
                          measure_type: goal.measure_type,
                          current_value: goalCurrent,
                          target_value: goal.target_value,
                          measure_unit: goal.measure_unit,
                        })}
                      </span>
                      {goal.completion_threshold != null &&
                       goal.completion_threshold !== goal.target_value && (
                        <span className="goal-metric-threshold-hint">
                          threshold {formatProgress({
                            measure_type: goal.measure_type,
                            current_value: goal.completion_threshold,
                            target_value: goal.target_value,
                            measure_unit: goal.measure_unit,
                          }).split(' / ')[0]}
                        </span>
                      )}
                      <div className="goal-subtask-controls" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="goal-subtask-step-btn"
                          onClick={() => handleGoalStep(-1)}
                          disabled={goalUpdating || goalCurrent <= 0}
                          aria-label="Decrease"
                        >−</button>
                        <input
                          type="number"
                          className="goal-subtask-value-input"
                          value={localGoalVal}
                          min={0}
                          step="any"
                          onChange={(e) => setLocalGoalVal(e.target.value)}
                          onBlur={handleGoalInputBlur}
                          disabled={goalUpdating}
                          aria-label="Current value"
                        />
                        <button
                          type="button"
                          className="goal-subtask-step-btn"
                          onClick={() => handleGoalStep(1)}
                          disabled={goalUpdating}
                          aria-label="Increase"
                        >+</button>
                      </div>
                    </div>
                    {/* Goal-level note */}
                    <div className="goal-note-row">
                      <input
                        type="text"
                        className="goal-note-input"
                        placeholder="Add a note for this update…"
                        value={goalNote}
                        onChange={(e) => setGoalNote(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleGoalInputBlur(); } }}
                        disabled={goalUpdating}
                        maxLength={200}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Progress history chart — lazy loaded when expanded */}
            {logs === null ? (
              <p className="goal-history-loading">Loading history…</p>
            ) : (
              <GoalProgressChart logs={logs} goal={goal} subtasks={subtasks} />
            )}

            {/* Subtasks */}
            <div className="goal-subtasks-section">
              <span className="goal-subtasks-label">Subtasks</span>

              {subtasks.length === 0 && (
                <p className="goal-subtasks-empty">No subtasks yet.</p>
              )}

              <div className="goal-subtasks-list">
                {subtasks.map((s) => (
                  <SubtaskRow
                    key={s.id}
                    subtask={s}
                    goalId={goal.id}
                    onToggle={handleToggle}
                    onUpdateProgress={handleUpdateProgress}
                    onDelete={handleDeleteSubtask}
                    dragHandlers={dragHandlers}
                  />
                ))}
              </div>

              <AddSubtaskForm goalId={goal.id} />
            </div>
          </div>
        )}
      </div>

      {editing && <GoalFormModal goal={goal} onClose={() => setEditing(false)} />}
    </>
  );
}
