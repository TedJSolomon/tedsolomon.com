'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '../../lib/supabase';

function parseJob(formData) {
  return {
    date:                formData.get('date')?.toString().trim(),
    job_type:            formData.get('job_type')?.toString().trim() || 'normal',
    pages:               parseInt(formData.get('pages')?.toString() || '0', 10),
    per_page_rate:       parseFloat(formData.get('per_page_rate')?.toString() || '3.40'),
    proofreading:        formData.get('proofreading') === 'true',
    proofreading_rate:   parseFloat(formData.get('proofreading_rate')?.toString() || '0.50'),
    rush:                formData.get('rush') === 'true',
    rush_rate:           parseFloat(formData.get('rush_rate')?.toString() || '0.60'),
    per_diem:            parseFloat(formData.get('per_diem')?.toString() || '25'),
    per_diem_multiplier: parseInt(formData.get('per_diem_multiplier')?.toString() || '1', 10),
    bust_rate:           parseFloat(formData.get('bust_rate')?.toString() || '85'),
  };
}

export async function addJob(prevState, formData) {
  const fields = parseJob(formData);
  if (!fields.date) return { error: 'Date is required.' };

  const supabase = createServerClient();
  const { error } = await supabase.from('transcription_jobs').insert(fields);
  if (error) return { error: error.message };

  revalidatePath('/dashboard/transcription');
  return { success: true };
}

export async function updateJob(id, prevState, formData) {
  const fields = parseJob(formData);
  if (!fields.date) return { error: 'Date is required.' };

  const supabase = createServerClient();
  const { error } = await supabase
    .from('transcription_jobs')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/dashboard/transcription');
  return { success: true };
}

export async function deleteJob(id) {
  const supabase = createServerClient();
  const { error } = await supabase.from('transcription_jobs').delete().eq('id', id);
  if (error) console.error('deleteJob:', error.message);
  revalidatePath('/dashboard/transcription');
}

export async function importJobs(jobs) {
  if (!Array.isArray(jobs) || jobs.length === 0) return { error: 'No jobs to import.' };
  const supabase = createServerClient();
  const { error } = await supabase.from('transcription_jobs').insert(jobs);
  if (error) return { error: error.message };
  revalidatePath('/dashboard/transcription');
  return { success: true, count: jobs.length };
}
