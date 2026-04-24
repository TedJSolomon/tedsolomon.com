'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { CATEGORIES, STATUSES } from '../../lib/goals';

export default function GoalFilters({ filters, view }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [local, setLocal] = useState(filters);

  function buildParams(overrides = {}) {
    const merged = { ...local, ...overrides };
    const params = new URLSearchParams();
    if (merged.category)           params.set('category', merged.category);
    if (merged.status)             params.set('status',   merged.status);
    if (merged.search)             params.set('search',   merged.search);
    if (view && view !== 'grid')   params.set('view',     view);
    return params.toString();
  }

  function apply() {
    const qs = buildParams();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function clear() {
    const cleared = { category: '', status: '', search: '' };
    setLocal(cleared);
    const params = new URLSearchParams();
    if (view && view !== 'grid') params.set('view', view);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  const hasActive = Object.values(local).some(Boolean);

  return (
    <div className="wins-filters goal-filters">
      <select
        className="wins-input wins-select wins-filter-select"
        value={local.category}
        onChange={(e) => setLocal((p) => ({ ...p, category: e.target.value }))}
      >
        <option value="">All Categories</option>
        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>

      <select
        className="wins-input wins-select wins-filter-select"
        value={local.status}
        onChange={(e) => setLocal((p) => ({ ...p, status: e.target.value }))}
      >
        <option value="">All Statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
        ))}
      </select>

      <input
        type="text"
        className="wins-input wins-filter-search"
        placeholder="Search goals…"
        value={local.search}
        onChange={(e) => setLocal((p) => ({ ...p, search: e.target.value }))}
        onKeyDown={(e) => { if (e.key === 'Enter') apply(); }}
      />

      <button className="btn-primary wins-filter-apply" onClick={apply}>Apply</button>
      {hasActive && (
        <button className="btn-secondary wins-filter-clear" onClick={clear}>Clear</button>
      )}
    </div>
  );
}
