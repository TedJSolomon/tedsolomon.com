import { createServerClient } from './supabase';

export const WL_PRIORITIES = ['Must Have', 'Want', 'Nice to Have'];

// Color palette for dynamic categories (deterministic hash assignment)
const COLOR_PALETTE = [
  { bg: '#7eb8f7', rgb: '126,184,247' },
  { bg: '#c49df0', rgb: '196,157,240' },
  { bg: '#7ecb8a', rgb: '126,203,138' },
  { bg: '#f0944d', rgb: '240,148,77'  },
  { bg: '#5dbfbf', rgb: '93,191,191'  },
  { bg: '#f07878', rgb: '240,120,120' },
  { bg: '#a8d870', rgb: '168,216,112' },
  { bg: '#e8a838', rgb: '232,168,56'  },
];

export function getCategoryColor(category) {
  if (!category) return COLOR_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < category.length; i++) hash = (hash * 31 + category.charCodeAt(i)) | 0;
  return COLOR_PALETTE[Math.abs(hash) % COLOR_PALETTE.length];
}

export const WL_PRIORITY_COLORS = {
  'Must Have':    { bg: '#e8a838', rgb: '232,168,56'  },
  'Want':         { bg: '#7eb8f7', rgb: '126,184,247' },
  'Nice to Have': { bg: '#7ecb8a', rgb: '126,203,138' },
};

const PRIORITY_ORDER = { 'Must Have': 0, 'Want': 1, 'Nice to Have': 2 };

export async function getAllItems() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('wishlist_items')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(`getAllItems: ${error.message}`);
  return data || [];
}

/** Extract unique categories from a list of items, sorted alphabetically. */
export function getAllCategories(items) {
  return [...new Set(items.map((i) => i.category).filter(Boolean))].sort();
}

export function filterItems(items, { category, priority, purchased }) {
  return items.filter((item) => {
    if (category  && item.category !== category)  return false;
    if (priority  && item.priority !== priority)  return false;
    if (purchased === 'yes' && !item.purchased)   return false;
    if (purchased === 'no'  &&  item.purchased)   return false;
    return true;
  });
}

export function sortItems(items, sort) {
  const arr = [...items];
  switch (sort) {
    case 'price-asc':
      return arr.sort((a, b) => {
        if (a.price == null && b.price == null) return 0;
        if (a.price == null) return 1;
        if (b.price == null) return -1;
        return Number(a.price) - Number(b.price);
      });
    case 'price-desc':
      return arr.sort((a, b) => {
        if (a.price == null && b.price == null) return 0;
        if (a.price == null) return 1;
        if (b.price == null) return -1;
        return Number(b.price) - Number(a.price);
      });
    case 'date-asc':
      return arr.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    case 'name-asc':
      return arr.sort((a, b) => a.name.localeCompare(b.name));
    case 'priority':
      return arr.sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9));
    case 'date-desc':
    default:
      return arr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
}

export async function getAllShares() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('wishlist_shares')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(`getAllShares: ${error.message}`);
  return data || [];
}

export async function getShareByToken(token) {
  const supabase = createServerClient();
  const { data: share, error: shareErr } = await supabase
    .from('wishlist_shares')
    .select('*')
    .eq('share_token', token)
    .single();
  if (shareErr || !share) return null;

  const ids = share.item_ids || [];
  if (ids.length === 0) return { share, items: [] };

  const { data: items, error: itemsErr } = await supabase
    .from('wishlist_items')
    .select('*')
    .in('id', ids);
  if (itemsErr) return { share, items: [] };

  const ordered = ids.map((id) => items.find((i) => i.id === id)).filter(Boolean);
  return { share, items: ordered };
}
