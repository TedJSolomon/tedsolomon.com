import { createServerClient } from './supabase';

function rowToOOO(row) {
  return {
    id:             row.id,
    person_name:    row.person_name,
    person_role:    row.person_role    || '',
    date:           row.date,
    talking_points: row.talking_points || '',
    their_feedback: row.their_feedback || '',
    my_notes:       row.my_notes       || '',
    action_items:   row.action_items   || '',
    follow_up_date: row.follow_up_date || '',
  };
}

export async function getAllOOOs() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('one_on_ones')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw new Error(`getAllOOOs: ${error.message}`);
  return (data || []).map(rowToOOO);
}

export function filterOOOs(ooos, { from, to, person } = {}) {
  return ooos.filter((o) => {
    if (from && o.date < from) return false;
    if (to && o.date > to) return false;
    if (person && o.person_name !== person) return false;
    return true;
  });
}

/** Unique person names sorted alphabetically. */
export function getAllPeople(ooos) {
  const set = new Set(ooos.map((o) => o.person_name).filter(Boolean));
  return [...set].sort();
}

/**
 * Group OOOs by person_name, ordered by the most recent meeting date per person.
 * Returns [{ person_name, entries: [...] }, ...]
 */
export function groupByPerson(ooos) {
  const map = {};
  ooos.forEach((o) => {
    if (!map[o.person_name]) map[o.person_name] = [];
    map[o.person_name].push(o);
  });
  return Object.entries(map)
    .map(([person_name, entries]) => ({ person_name, entries }))
    .sort((a, b) => {
      // Sort groups by their latest entry date (entries already newest-first)
      return b.entries[0].date.localeCompare(a.entries[0].date);
    });
}
