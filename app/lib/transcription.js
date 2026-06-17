import { createServerClient } from './supabase';

export function calcPay(job) {
  if (job.job_type === 'bust') {
    return Number(job.bust_rate);
  }
  const pageRate = Number(job.per_page_rate);
  const proofDeduct = job.proofreading ? Number(job.proofreading_rate) : 0;
  const perDiem = Number(job.per_diem) * Number(job.per_diem_multiplier);
  return Number(job.pages) * (pageRate - proofDeduct) + perDiem;
}

export async function getAllJobs() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('transcription_jobs')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw new Error(`getAllJobs: ${error.message}`);
  return data || [];
}
