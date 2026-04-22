'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '../../lib/supabase';

function parseFormData(formData) {
  return {
    person_name:    formData.get('person_name')?.toString().trim()    || '',
    person_role:    formData.get('person_role')?.toString().trim()    || null,
    date:           formData.get('date')?.toString().trim()           || '',
    talking_points: formData.get('talking_points')?.toString().trim() || null,
    their_feedback: formData.get('their_feedback')?.toString().trim() || null,
    my_notes:       formData.get('my_notes')?.toString().trim()       || null,
    action_items:   formData.get('action_items')?.toString().trim()   || null,
    follow_up_date: formData.get('follow_up_date')?.toString().trim() || null,
  };
}

export async function addOOO(prevState, formData) {
  const fields = parseFormData(formData);

  if (!fields.person_name || !fields.date) {
    return { error: 'Person name and date are required.' };
  }

  const supabase = createServerClient();
  const { error } = await supabase.from('one_on_ones').insert(fields);

  if (error) return { error: error.message };
  revalidatePath('/dashboard/one-on-ones');
  return { success: true };
}

export async function updateOOO(id, prevState, formData) {
  const fields = parseFormData(formData);

  if (!fields.person_name || !fields.date) {
    return { error: 'Person name and date are required.' };
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from('one_on_ones')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return { error: error.message };
  revalidatePath('/dashboard/one-on-ones');
  return { success: true };
}

export async function deleteOOO(id) {
  const supabase = createServerClient();
  const { error } = await supabase.from('one_on_ones').delete().eq('id', id);
  if (error) console.error('deleteOOO:', error.message);
  revalidatePath('/dashboard/one-on-ones');
}
