'use server';

import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { createServerClient } from '../../lib/supabase';

function parseItem(formData) {
  const price = formData.get('price')?.toString().trim();
  return {
    name:        formData.get('name')?.toString().trim(),
    description: formData.get('description')?.toString().trim() || null,
    url:         formData.get('url')?.toString().trim() || null,
    image_url:   formData.get('image_url')?.toString().trim() || null,
    price:       price ? parseFloat(price) : null,
    category:    formData.get('category')?.toString().trim(),
    priority:    formData.get('priority')?.toString().trim(),
  };
}

// ── Items ─────────────────────────────────────────────────────────────────────

export async function addItem(prevState, formData) {
  const item = parseItem(formData);
  if (!item.name)     return { error: 'Name is required.' };
  if (!item.category) return { error: 'Category is required.' };
  if (!item.priority) return { error: 'Priority is required.' };

  const supabase = createServerClient();
  const { error } = await supabase.from('wishlist_items').insert({ ...item, purchased: false });
  if (error) return { error: error.message };

  revalidatePath('/dashboard/wishlist');
  return { success: true };
}

export async function updateItem(id, prevState, formData) {
  const item = parseItem(formData);
  if (!item.name)     return { error: 'Name is required.' };
  if (!item.category) return { error: 'Category is required.' };
  if (!item.priority) return { error: 'Priority is required.' };

  const supabase = createServerClient();
  const { error } = await supabase
    .from('wishlist_items')
    .update({ ...item, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/dashboard/wishlist');
  return { success: true };
}

export async function deleteItem(id) {
  const supabase = createServerClient();
  const { error } = await supabase.from('wishlist_items').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/wishlist');
}

export async function togglePurchased(id, purchased) {
  const supabase = createServerClient();
  const { error } = await supabase
    .from('wishlist_items')
    .update({ purchased, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/wishlist');
}

// ── Shares ────────────────────────────────────────────────────────────────────

export async function createShare(prevState, formData) {
  const title    = formData.get('title')?.toString().trim();
  const item_ids = formData.getAll('item_ids');

  if (!title)             return { error: 'Title is required.' };
  if (!item_ids.length)   return { error: 'Select at least one item.' };

  const share_token = randomUUID();
  const supabase    = createServerClient();
  const { error }   = await supabase.from('wishlist_shares').insert({ title, share_token, item_ids });
  if (error) return { error: error.message };

  revalidatePath('/dashboard/wishlist');
  return { success: true, token: share_token };
}

export async function deleteShare(id) {
  const supabase = createServerClient();
  const { error } = await supabase.from('wishlist_shares').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/wishlist');
}
