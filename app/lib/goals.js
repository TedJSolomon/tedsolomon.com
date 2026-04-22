import { createServerClient } from './supabase';

export const CATEGORIES = [
  'Career', 'Learning', 'Health', 'Personal', 'Financial', 'Creative', 'Relationships', 'Other',
];

export const STATUSES = ['active', 'completed', 'paused', 'cancelled'];

export const CATEGORY_COLORS = {
  Career:        { bg: '#e8a838', rgb: '232,168,56'  },
  Learning:      { bg: '#7eb8f7', rgb: '126,184,247' },
  Health:        { bg: '#7ecb8a', rgb: '126,203,138' },
  Personal:      { bg: '#c49df0', rgb: '196,157,240' },
  Financial:     { bg: '#5dbfbf', rgb: '93,191,191'  },
  Creative:      { bg: '#f0944d', rgb: '240,148,77'  },
  Relationships: { bg: '#f07878', rgb: '240,120,120' },
  Other:         { bg: '#a8d870', rgb: '168,216,112' },
};

export async function getAllGoals() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('goals')
    .select('*, subtasks(*)')
    .order('created_at', { ascending: false });
  if (error) throw new Error(`getAllGoals: ${error.message}`);
  return (data || []).map((g) => ({
    ...g,
    subtasks: (g.subtasks || []).sort((a, b) => a.sort_order - b.sort_order),
  }));
}

export function filterGoals(goals, { category, status, search }) {
  return goals.filter((g) => {
    if (category && g.category !== category) return false;
    if (status   && g.status   !== status)   return false;
    if (search) {
      const q = search.toLowerCase();
      if (!g.title.toLowerCase().includes(q) && !(g.description || '').toLowerCase().includes(q)) return false;
    }
    return true;
  });
}
