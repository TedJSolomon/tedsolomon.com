'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function OOOFilters({ filters, allPeople }) {
  const router = useRouter();
  const [local, setLocal] = useState(filters);

  function set(key, value) {
    setLocal((prev) => ({ ...prev, [key]: value }));
  }

  function apply(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(local).forEach(([k, v]) => { if (v) params.set(k, v); });
    const qs = params.toString();
    router.push(`/dashboard/one-on-ones${qs ? '?' + qs : ''}`);
  }

  function clear() {
    setLocal({ from: '', to: '', person: '' });
    router.push('/dashboard/one-on-ones');
  }

  const hasFilters = Object.values(local).some(Boolean);

  return (
    <form onSubmit={apply} className="ooo-filters">
      <div className="ooo-filters-row">
        <div className="wins-filter-group">
          <label className="wins-label">Person</label>
          <select
            className="wins-select wins-filter-input"
            value={local.person}
            onChange={(e) => set('person', e.target.value)}
          >
            <option value="">All people</option>
            {allPeople.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="wins-filter-group">
          <label className="wins-label">From</label>
          <input
            type="date"
            className="wins-input wins-filter-input"
            value={local.from}
            onChange={(e) => set('from', e.target.value)}
          />
        </div>
        <div className="wins-filter-group">
          <label className="wins-label">To</label>
          <input
            type="date"
            className="wins-input wins-filter-input"
            value={local.to}
            onChange={(e) => set('to', e.target.value)}
          />
        </div>
      </div>
      <div className="wins-filters-actions">
        <button type="submit" className="btn-secondary wins-filter-btn">Apply</button>
        {hasFilters && (
          <button type="button" className="wins-clear-btn" onClick={clear}>Clear</button>
        )}
      </div>
    </form>
  );
}
