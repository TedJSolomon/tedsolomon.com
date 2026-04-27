'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '../../lib/supabase';
import { splitImpact } from '../../lib/wins';
import { incrementActivity } from '../../lib/dailyActivity';

function parseFormData(formData) {
  const tagsRaw = formData.get('tags')?.toString().trim() || '';
  const impact  = formData.get('impact')?.toString().trim() || '';
  return {
    date:        formData.get('date')?.toString().trim(),
    category:    formData.get('category')?.toString().trim(),
    visibility:  formData.get('visibility')?.toString().trim(),
    description: formData.get('description')?.toString().trim(),
    tags:        tagsRaw ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean) : [],
    ...splitImpact(impact),
  };
}

export async function addWin(prevState, formData) {
  const fields = parseFormData(formData);

  if (!fields.date || !fields.category || !fields.visibility || !fields.description) {
    return { error: 'Date, category, visibility, and description are required.' };
  }

  const supabase = createServerClient();
  const { error } = await supabase.from('wins').insert({
    date:                fields.date,
    category:            fields.category,
    visibility:          fields.visibility,
    description:         fields.description,
    tags:                fields.tags,
    impact_metric_type:  fields.impact_metric_type,
    impact_metric_value: fields.impact_metric_value,
  });

  if (error) return { error: error.message };
  await incrementActivity('wins_logged');
  revalidatePath('/dashboard/wins');
  return { success: true };
}

export async function deleteWin(id) {
  const supabase = createServerClient();
  const { error } = await supabase.from('wins').delete().eq('id', id);
  if (error) console.error('deleteWin:', error.message);
  revalidatePath('/dashboard/wins');
}

export async function updateWin(id, prevState, formData) {
  const fields = parseFormData(formData);

  if (!fields.date || !fields.category || !fields.visibility || !fields.description) {
    return { error: 'Date, category, visibility, and description are required.' };
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from('wins')
    .update({
      date:                fields.date,
      category:            fields.category,
      visibility:          fields.visibility,
      description:         fields.description,
      tags:                fields.tags,
      impact_metric_type:  fields.impact_metric_type,
      impact_metric_value: fields.impact_metric_value,
      updated_at:          new Date().toISOString(),
    })
    .eq('id', id);

  if (error) return { error: error.message };
  revalidatePath('/dashboard/wins');
  return { success: true };
}
