'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { WL_PRIORITIES } from '../../lib/wishlist';

const SORT_OPTIONS = [
  { value: 'date-desc',   label: 'Newest first'      },
  { value: 'date-asc',    label: 'Oldest first'      },
  { value: 'price-asc',   label: 'Price: low → high' },
  { value: 'price-desc',  label: 'Price: high → low' },
  { value: 'name-asc',    label: 'Name A → Z'        },
  { value: 'priority',    label: 'By priority'       },
];

export default function WishlistFilters({ filters, allCategories = [] }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [local, setLocal] = useState(filters);

  function buildParams(state) {
    const p = new URLSearchParams();
    if (state.category)  p.set('category',  state.category);
    if (state.priority)  p.set('priority',  state.priority);
    if (state.purchased) p.set('purchased', state.purchased);
    if (state.sort && state.sort !== 'date-desc') p.set('sort', state.sort);
    return p;
  }

  function apply() {
    router.push(`${pathname}?${buildParams(local).toString()}`);
  }

  function clear() {
    const reset = { category: '', priority: '', purchased: '', sort: 'date-desc' };
    setLocal(reset);
    router.push(pathname);
  }

  function toggleHidePurchased() {
    const next = { ...local, purchased: local.purchased === 'no' ? '' : 'no' };
    setLocal(next);
    router.push(`${pathname}?${buildParams(next).toString()}`);
  }

  const hasActive = local.category || local.priority || local.purchased ||
    (local.sort && local.sort !== 'date-desc');
  const hidePurchased = local.purchased === 'no';

  return (
    <div className="wl-filters">
      <select
        className="wins-input wins-select wl-filter-select"
        value={local.category}
        onChange={(e) => setLocal((p) => ({ ...p, category: e.target.value }))}
      >
        <option value="">All Categories</option>
        {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>

      <select
        className="wins-input wins-select wl-filter-select"
        value={local.priority}
        onChange={(e) => setLocal((p) => ({ ...p, priority: e.target.value }))}
      >
        <option value="">All Priorities</option>
        {WL_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>

      <select
        className="wins-input wins-select wl-filter-select"
        value={local.sort || 'date-desc'}
        onChange={(e) => setLocal((p) => ({ ...p, sort: e.target.value }))}
      >
        {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      <button
        type="button"
        role="switch"
        aria-checked={hidePurchased}
        className={`wl-switch${hidePurchased ? ' on' : ''}`}
        onClick={toggleHidePurchased}
      >
        <span className="wl-switch-track">
          <span className="wl-switch-thumb" />
        </span>
        <span>Hide Purchased</span>
      </button>

      <button className="btn-primary wins-filter-apply" onClick={apply}>Apply</button>
      {hasActive && (
        <button className="btn-secondary wins-filter-clear" onClick={clear}>Clear</button>
      )}
    </div>
  );
}
