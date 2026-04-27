'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '../../lib/supabase';
import { incrementActivity } from '../../lib/dailyActivity';

// ── Goals ────────────────────────────────────────────────────────────────────

export async function createGoal(prevState, formData) {
  const title        = formData.get('title')?.toString().trim();
  const description  = formData.get('description')?.toString().trim() || null;
  const category     = formData.get('category')?.toString().trim();
  const target_date  = formData.get('target_date')?.toString().trim() || null;
  const status       = formData.get('status')?.toString().trim() || 'active';
  const subtasksRaw  = formData.get('subtasks')?.toString() || '[]';

  const measure_type        = formData.get('measure_type')?.toString() || null;
  const measure_unit        = formData.get('measure_unit')?.toString().trim() || null;
  const tgt_raw             = formData.get('target_value')?.toString().trim();
  const thresh_raw          = formData.get('completion_threshold')?.toString().trim();
  const target_value        = tgt_raw   ? parseFloat(tgt_raw)   : null;
  const completion_threshold = thresh_raw ? parseFloat(thresh_raw) : null;

  if (!title)    return { error: 'Title is required.' };
  if (!category) return { error: 'Category is required.' };
  if (measure_type && measure_type !== 'Yes/No' && (target_value === null || isNaN(target_value))) {
    return { error: 'Target value is required for the selected measurement type.' };
  }

  let subtasks = [];
  try { subtasks = JSON.parse(subtasksRaw); } catch {}

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('goals')
    .insert({
      title, description, category, target_date, status,
      measure_type:         measure_type || null,
      measure_unit:         measure_unit || null,
      target_value,
      current_value:        0,
      completion_threshold,
    })
    .select('id')
    .single();
  if (error) return { error: error.message };

  if (subtasks.length > 0) {
    const rows = subtasks.map((s, idx) => ({
      goal_id:              data.id,
      title:                s.title,
      due_date:             s.due_date || null,
      completed:            false,
      sort_order:           idx,
      measure_type:         s.measure_type || 'Yes/No',
      measure_unit:         s.measure_unit || null,
      target_value:         s.target_value != null ? Number(s.target_value) : null,
      current_value:        0,
      completion_threshold: s.completion_threshold != null
        ? Number(s.completion_threshold)
        : (s.target_value != null ? Number(s.target_value) : null),
    }));
    const { error: stErr } = await supabase.from('subtasks').insert(rows);
    if (stErr) return { error: stErr.message };
  }

  revalidatePath('/dashboard/goals');
  return { success: true };
}

export async function updateGoal(id, prevState, formData) {
  const title        = formData.get('title')?.toString().trim();
  const description  = formData.get('description')?.toString().trim() || null;
  const category     = formData.get('category')?.toString().trim();
  const target_date  = formData.get('target_date')?.toString().trim() || null;
  const status       = formData.get('status')?.toString().trim() || 'active';

  const measure_type        = formData.get('measure_type')?.toString() || null;
  const measure_unit        = formData.get('measure_unit')?.toString().trim() || null;
  const tgt_raw             = formData.get('target_value')?.toString().trim();
  const thresh_raw          = formData.get('completion_threshold')?.toString().trim();
  const target_value        = tgt_raw   ? parseFloat(tgt_raw)   : null;
  const completion_threshold = thresh_raw ? parseFloat(thresh_raw) : null;

  if (!title)    return { error: 'Title is required.' };
  if (!category) return { error: 'Category is required.' };
  if (measure_type && measure_type !== 'Yes/No' && (target_value === null || isNaN(target_value))) {
    return { error: 'Target value is required for the selected measurement type.' };
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from('goals')
    .update({
      title, description, category, target_date, status,
      measure_type:         measure_type || null,
      measure_unit:         measure_unit || null,
      target_value,
      completion_threshold,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/dashboard/goals');
  return { success: true };
}

export async function updateGoalProgress(id, current_value, note) {
  const supabase = createServerClient();
  const { data: goal } = await supabase
    .from('goals')
    .select('completion_threshold, target_value, status')
    .eq('id', id)
    .single();

  const threshold   = goal?.completion_threshold ?? goal?.target_value;
  const nowComplete = threshold != null && Number(current_value) >= Number(threshold);
  const updates     = { current_value, updated_at: new Date().toISOString() };
  if (nowComplete && goal?.status === 'active') updates.status = 'completed';

  const [{ error }] = await Promise.all([
    supabase.from('goals').update(updates).eq('id', id),
    supabase.from('progress_log').insert({
      goal_id:    id,
      subtask_id: null,
      value:      current_value,
      note:       note || null,
      logged_at:  new Date().toISOString(),
    }),
  ]);
  if (error) throw new Error(error.message);
  await incrementActivity('goals_updated');
  revalidatePath('/dashboard/goals');
}

export async function deleteGoal(id) {
  const supabase = createServerClient();
  await supabase.from('subtasks').delete().eq('goal_id', id);
  await supabase.from('progress_log').delete().eq('goal_id', id);
  const { error } = await supabase.from('goals').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/goals');
}

// ── Subtasks ─────────────────────────────────────────────────────────────────

export async function addSubtask(goalId, prevState, formData) {
  const title        = formData.get('title')?.toString().trim();
  const due_date     = formData.get('due_date')?.toString().trim() || null;
  const measure_type = formData.get('measure_type')?.toString() || 'Yes/No';
  const measure_unit = formData.get('measure_unit')?.toString().trim() || null;
  const target_raw   = formData.get('target_value')?.toString().trim();
  const thresh_raw   = formData.get('completion_threshold')?.toString().trim();
  const target_value = target_raw ? parseFloat(target_raw) : null;
  const completion_threshold = thresh_raw ? parseFloat(thresh_raw) : target_value;

  if (!title) return { error: 'Title is required.' };
  if (measure_type !== 'Yes/No' && (target_value === null || isNaN(target_value))) {
    return { error: 'Target value is required for this measurement type.' };
  }

  const supabase = createServerClient();
  const { data: existing } = await supabase
    .from('subtasks')
    .select('sort_order')
    .eq('goal_id', goalId)
    .order('sort_order', { ascending: false })
    .limit(1);
  const nextOrder = existing?.length ? (existing[0].sort_order + 1) : 0;

  const { error } = await supabase.from('subtasks').insert({
    goal_id:              goalId,
    title,
    due_date,
    completed:            false,
    sort_order:           nextOrder,
    measure_type,
    measure_unit,
    target_value,
    current_value:        0,
    completion_threshold,
  });
  if (error) return { error: error.message };

  revalidatePath('/dashboard/goals');
  return { success: true };
}

export async function toggleSubtask(id, completed) {
  const supabase = createServerClient();
  const { error } = await supabase
    .from('subtasks')
    .update({
      completed,
      completed_at: completed ? new Date().toISOString() : null,
      updated_at:   new Date().toISOString(),
    })
    .eq('id', id);
  if (error) throw new Error(error.message);
  if (completed) await incrementActivity('subtasks_completed');
  revalidatePath('/dashboard/goals');
}

// goal_id is the parent goal — stored on the log so one query fetches all logs for a goal + its subtasks
export async function updateSubtaskProgress(id, current_value, note, goal_id) {
  const supabase = createServerClient();
  const { data: subtask } = await supabase
    .from('subtasks')
    .select('target_value, completion_threshold, completed')
    .eq('id', id)
    .single();

  const threshold    = subtask?.completion_threshold ?? subtask?.target_value;
  const wasCompleted = subtask?.completed ?? false;
  const completed    = threshold != null && Number(current_value) >= Number(threshold);

  const [{ error }] = await Promise.all([
    supabase.from('subtasks').update({
      current_value,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
      updated_at:   new Date().toISOString(),
    }).eq('id', id),
    supabase.from('progress_log').insert({
      goal_id:    goal_id || null,
      subtask_id: id,
      value:      current_value,
      note:       note || null,
      logged_at:  new Date().toISOString(),
    }),
  ]);
  if (error) throw new Error(error.message);
  // Only count newly-completed subtasks (not re-saves of already-complete ones)
  if (completed && !wasCompleted) await incrementActivity('subtasks_completed');
  revalidatePath('/dashboard/goals');
}

export async function deleteSubtask(id) {
  const supabase = createServerClient();
  await supabase.from('progress_log').delete().eq('subtask_id', id);
  const { error } = await supabase.from('subtasks').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/goals');
}

export async function reorderSubtasks(orderedIds) {
  const supabase = createServerClient();
  await Promise.all(
    orderedIds.map((id, idx) =>
      supabase.from('subtasks').update({ sort_order: idx, updated_at: new Date().toISOString() }).eq('id', id)
    )
  );
  revalidatePath('/dashboard/goals');
}

// ── Progress log ─────────────────────────────────────────────────────────────

export async function fetchProgressLog(goalId) {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('progress_log')
    .select('id, goal_id, subtask_id, value, note, logged_at')
    .eq('goal_id', goalId)
    .order('logged_at', { ascending: true });
  return data || [];
}
