'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { WINS_DIR, ensureWinsDir, slugify } from '../../lib/wins';

export async function addWin(prevState, formData) {
  const date = formData.get('date')?.toString().trim();
  const category = formData.get('category')?.toString().trim();
  const tags = formData.get('tags')?.toString().trim();
  const visibility = formData.get('visibility')?.toString().trim();
  const impact = formData.get('impact')?.toString().trim();
  const description = formData.get('description')?.toString().trim();

  if (!date || !category || !visibility || !description) {
    return { error: 'Date, category, visibility, and description are required.' };
  }

  ensureWinsDir();

  const slug = slugify(description);
  let filename = `${date}-${slug}.md`;
  let filePath = path.join(WINS_DIR, filename);

  // Avoid collisions on same date + similar description
  let counter = 1;
  while (fs.existsSync(filePath)) {
    filename = `${date}-${slug}-${counter}.md`;
    filePath = path.join(WINS_DIR, filename);
    counter++;
  }

  const content = [
    '---',
    `date: ${date}`,
    `category: ${category}`,
    `tags: ${tags || ''}`,
    `visibility: ${visibility}`,
    `impact: ${impact || ''}`,
    '---',
    '',
    description,
  ].join('\n');

  fs.writeFileSync(filePath, content, 'utf8');
  revalidatePath('/dashboard/wins');
  return { success: true };
}

export async function deleteWin(filename) {
  // Guard against path traversal
  const resolved = path.resolve(WINS_DIR, filename);
  if (!resolved.startsWith(WINS_DIR + path.sep) && resolved !== WINS_DIR) {
    return;
  }
  if (fs.existsSync(resolved)) fs.unlinkSync(resolved);
  revalidatePath('/dashboard/wins');
}

export async function updateWin(filename, prevState, formData) {
  const resolved = path.resolve(WINS_DIR, filename);
  if (!resolved.startsWith(WINS_DIR + path.sep)) {
    return { error: 'Invalid filename.' };
  }
  if (!fs.existsSync(resolved)) {
    return { error: 'Win not found.' };
  }

  const date        = formData.get('date')?.toString().trim();
  const category    = formData.get('category')?.toString().trim();
  const tags        = formData.get('tags')?.toString().trim();
  const visibility  = formData.get('visibility')?.toString().trim();
  const impact      = formData.get('impact')?.toString().trim();
  const description = formData.get('description')?.toString().trim();

  if (!date || !category || !visibility || !description) {
    return { error: 'Date, category, visibility, and description are required.' };
  }

  const content = [
    '---',
    `date: ${date}`,
    `category: ${category}`,
    `tags: ${tags || ''}`,
    `visibility: ${visibility}`,
    `impact: ${impact || ''}`,
    '---',
    '',
    description,
  ].join('\n');

  fs.writeFileSync(resolved, content, 'utf8');
  revalidatePath('/dashboard/wins');
  return { success: true };
}
