'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '../../lib/supabase';

// ── Goals ────────────────────────────────────────────────────────────────────

export async function createGoal(prevState, formData) {
  const title       = formData.get('title')?.toString().trim();
  const description = formData.get('description')?.toString().trim() || null;
  const category    = formData.get('category')?.toString().trim();
  const target_date = formData.get('target_date')?.toString().trim() || null;
  const status      = formData.get('status')?.toString().trim() || 'active';
  const subtasksRaw = formData.get('subtasks')?.toString() || '[]';

  if (!title)    return { error: 'Title is required.' };
  if (!category) return { error: 'Category is required.' };

  let subtasks = [];
  try { subtasks = JSON.parse(subtasksRaw); } catch {}

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('goals')
    .insert({ title, description, category, target_date, status })
    .select('id')
    .single();
  if (error) return { error: error.message };

  if (subtasks.length > 0) {
    const rows = subtasks.map((s, idx) => ({
      goal_id:    data.id,
      title:      s.title,
      due_date:   s.due_date || null,
      completed:  false,
      sort_order: idx,
    }));
    const { error: stErr } = await supabase.from('subtasks').insert(rows);
    if (stErr) return { error: stErr.message };
  }

  revalidatePath('/dashboard/goals');
  return { success: true };
}

export async function updateGoal(id, prevState, formData) {
  const title       = formData.get('title')?.toString().trim();
  const description = formData.get('description')?.toString().trim() || null;
  const category    = formData.get('category')?.toString().trim();
  const target_date = formData.get('target_date')?.toString().trim() || null;
  const status      = formData.get('status')?.toString().trim() || 'active';

  if (!title)    return { error: 'Title is required.' };
  if (!category) return { error: 'Category is required.' };

  const supabase = createServerClient();
  const { error } = await supabase
    .from('goals')
    .update({ title, description, category, target_date, status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/dashboard/goals');
  return { success: true };
}

export async function deleteGoal(id) {
  const supabase = createServerClient();
  // Delete subtasks first (defensive — may not have CASCADE)
  await supabase.from('subtasks').delete().eq('goal_id', id);
  const { error } = await supabase.from('goals').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/goals');
}

// ── Subtasks ─────────────────────────────────────────────────────────────────

export async function addSubtask(goalId, prevState, formData) {
  const title    = formData.get('title')?.toString().trim();
  const due_date = formData.get('due_date')?.toString().trim() || null;

  if (!title) return { error: 'Title is required.' };

  const supabase = createServerClient();
  // Get current max sort_order
  const { data: existing } = await supabase
    .from('subtasks')
    .select('sort_order')
    .eq('goal_id', goalId)
    .order('sort_order', { ascending: false })
    .limit(1);
  const nextOrder = existing?.length ? (existing[0].sort_order + 1) : 0;

  const { error } = await supabase.from('subtasks').insert({
    goal_id: goalId,
    title,
    due_date,
    completed: false,
    sort_order: nextOrder,
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
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/goals');
}

export async function deleteSubtask(id) {
  const supabase = createServerClient();
  const { error } = await supabase.from('subtasks').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/goals');
}

export async function reorderSubtasks(orderedIds) {
  // orderedIds: array of subtask UUIDs in new sort order
  const supabase = createServerClient();
  await Promise.all(
    orderedIds.map((id, idx) =>
      supabase.from('subtasks').update({ sort_order: idx, updated_at: new Date().toISOString() }).eq('id', id)
    )
  );
  revalidatePath('/dashboard/goals');
}
