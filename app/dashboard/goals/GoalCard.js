'use client';

import { useState, useTransition, useRef, useEffect, useActionState } from 'react';
import { deleteGoal, addSubtask, toggleSubtask, deleteSubtask, reorderSubtasks } from './actions';
import GoalFormModal from './GoalFormModal';
import { CATEGORY_COLORS } from '../../lib/goals';

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

function ProgressBar({ subtasks }) {
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

function SubtaskRow({ subtask, onToggle, onDelete, dragHandlers }) {
  const [toggling, startToggle] = useTransition();
  const [deleting, startDelete] = useTransition();

  return (
    <div
      className={`goal-subtask-row${subtask.completed ? ' completed' : ''}`}
      draggable
      data-id={subtask.id}
      {...dragHandlers}
    >
      <label className="goal-subtask-check">
        <input
          type="checkbox"
          checked={subtask.completed}
          disabled={toggling}
          onChange={() => startToggle(() => onToggle(subtask.id, !subtask.completed))}
        />
        <span className="goal-subtask-title">{subtask.title}</span>
      </label>
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

function AddSubtaskForm({ goalId }) {
  const boundAction = addSubtask.bind(null, goalId);
  const [state, formAction, pending] = useActionState(boundAction, {});
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    if (state?.success) setResetKey((k) => k + 1);
  }, [state]);

  return (
    <form key={resetKey} action={formAction} className="goal-add-subtask-form">
      <input
        name="title"
        type="text"
        className="wins-input goal-subtask-input"
        placeholder="Add subtask…"
        required
      />
      <input
        name="due_date"
        type="date"
        className="wins-input goal-subtask-date"
      />
      <button type="submit" className="btn-primary goal-subtask-add-btn" disabled={pending}>
        {pending ? '…' : 'Add'}
      </button>
      {state?.error && <p className="wins-form-error goal-subtask-err" role="alert">{state.error}</p>}
    </form>
  );
}

export default function GoalCard({ goal }) {
  const [expanded, setExpanded] = useState(false);
  const [editing,  setEditing]  = useState(false);
  const [deleting, startDelete] = useTransition();
  const [subtasks, setSubtasks] = useState(goal.subtasks || []);
  const dragIdRef = useRef(null);

  // Sync subtasks when server revalidates and new props arrive
  useEffect(() => {
    setSubtasks(goal.subtasks || []);
  }, [goal.subtasks]);

  const color   = CATEGORY_COLORS[goal.category] || CATEGORY_COLORS.Other;
  const overdue = isOverdue(goal.target_date) && goal.status === 'active';

  function handleDelete(e) {
    e.stopPropagation();
    if (!confirm(`Delete "${goal.title}" and all its subtasks? This cannot be undone.`)) return;
    startDelete(() => deleteGoal(goal.id));
  }

  async function handleToggle(id, newVal) {
    setSubtasks((prev) => prev.map((s) => s.id === id ? { ...s, completed: newVal } : s));
    await toggleSubtask(id, newVal);
  }

  async function handleDeleteSubtask(id) {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
    await deleteSubtask(id);
  }

  // Drag-and-drop
  const dragHandlers = {
    onDragStart(e) {
      dragIdRef.current = e.currentTarget.dataset.id;
      e.currentTarget.classList.add('dragging');
    },
    onDragEnd(e) {
      e.currentTarget.classList.remove('dragging');
    },
    onDragOver(e) {
      e.preventDefault();
      e.currentTarget.classList.add('drag-over');
    },
    onDragLeave(e) {
      e.currentTarget.classList.remove('drag-over');
    },
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
        {/* Header — click toggles expand */}
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
              <span className="goal-cat-badge">
                {goal.category}
              </span>
              {goal.target_date && (
                <span className={`goal-target-date${overdue ? ' overdue' : ''}`}>
                  {overdue ? 'Overdue · ' : 'Target · '}{formatDate(goal.target_date)}
                </span>
              )}
            </div>

            <ProgressBar subtasks={subtasks} />
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

        {/* Expanded body */}
        {expanded && (
          <div className="goal-card-body">
            {goal.description && (
              <p className="goal-description">{goal.description}</p>
            )}

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
                    onToggle={handleToggle}
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
