'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { CATEGORIES, STATUSES } from '../../lib/goals';

export default function GoalFilters({ filters }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [local, setLocal] = useState(filters);

  function apply() {
    const params = new URLSearchParams();
    if (local.category) params.set('category', local.category);
    if (local.status)   params.set('status',   local.status);
    if (local.search)   params.set('search',   local.search);
    router.push(`${pathname}?${params.toString()}`);
  }

  function clear() {
    setLocal({ category: '', status: '', search: '' });
    router.push(pathname);
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
