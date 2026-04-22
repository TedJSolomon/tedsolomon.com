import { createServerClient } from './supabase';

// ── Shape helpers ────────────────────────────────────────────

/** Convert a DB row into the win shape used throughout the UI. */
function rowToWin(row) {
  // Reconstruct the combined impact string the UI expects
  let impact = '';
  if (row.impact_metric_type && row.impact_metric_value) {
    impact = row.impact_metric_type === 'Custom'
      ? row.impact_metric_value
      : `${row.impact_metric_type}: ${row.impact_metric_value}`;
  }
  return {
    id: row.id,
    date: row.date,           // 'YYYY-MM-DD'
    category: row.category,
    tags: row.tags || [],
    visibility: row.visibility,
    impact,
    description: row.description,
  };
}

/** Parse the combined impact string back into type + value for DB writes. */
export function splitImpact(impact) {
  if (!impact) return { impact_metric_type: null, impact_metric_value: null };
  const colonIdx = impact.indexOf(': ');
  if (colonIdx === -1) {
    return { impact_metric_type: 'Custom', impact_metric_value: impact };
  }
  return {
    impact_metric_type: impact.slice(0, colonIdx),
    impact_metric_value: impact.slice(colonIdx + 2),
  };
}

// ── Data fetching ────────────────────────────────────────────

export async function getAllWins() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('wins')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw new Error(`getAllWins: ${error.message}`);
  return (data || []).map(rowToWin);
}

// ── Pure JS helpers (operate on already-fetched win arrays) ──

export function filterWins(wins, { from, to, category, visibility, tag } = {}) {
  return wins.filter((w) => {
    if (from && w.date < from) return false;
    if (to && w.date > to) return false;
    if (category && w.category !== category) return false;
    if (visibility && w.visibility !== visibility) return false;
    if (tag && !w.tags.includes(tag)) return false;
    return true;
  });
}

export function getAllTags(wins) {
  const set = new Set();
  wins.forEach((w) => w.tags.forEach((t) => set.add(t)));
  return [...set].sort();
}

export function getCategoryCounts(wins) {
  const counts = {};
  wins.forEach((w) => {
    if (w.category) counts[w.category] = (counts[w.category] || 0) + 1;
  });
  return counts;
}

export function getTopTagCounts(wins, n = 10) {
  const counts = {};
  wins.forEach((w) => w.tags.forEach((t) => { counts[t] = (counts[t] || 0) + 1; }));
  return Object.entries(counts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}

export function getImpactTypeCounts(wins) {
  const counts = {};
  wins.forEach((w) => {
    if (!w.impact) return;
    const colonIdx = w.impact.indexOf(': ');
    const type = colonIdx === -1 ? 'Custom' : w.impact.slice(0, colonIdx);
    counts[type] = (counts[type] || 0) + 1;
  });
  return counts;
}
