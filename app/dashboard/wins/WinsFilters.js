'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const CATEGORIES = ['', 'shipped', 'learned', 'led', 'impact'];
const VISIBILITIES = ['', 'resume', 'raise', 'both'];

export default function WinsFilters({ filters, allTags }) {
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
    router.push(`/dashboard/wins${qs ? '?' + qs : ''}`);
  }

  function clear() {
    setLocal({ from: '', to: '', category: '', visibility: '', tag: '' });
    router.push('/dashboard/wins');
  }

  const hasFilters = Object.values(local).some(Boolean);

  return (
    <form onSubmit={apply} className="wins-filters">
      <div className="wins-filters-row">
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
        <div className="wins-filter-group">
          <label className="wins-label">Category</label>
          <select
            className="wins-select wins-filter-input"
            value={local.category}
            onChange={(e) => set('category', e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c || 'All'}</option>
            ))}
          </select>
        </div>
        <div className="wins-filter-group">
          <label className="wins-label">Visibility</label>
          <select
            className="wins-select wins-filter-input"
            value={local.visibility}
            onChange={(e) => set('visibility', e.target.value)}
          >
            {VISIBILITIES.map((v) => (
              <option key={v} value={v}>{v || 'All'}</option>
            ))}
          </select>
        </div>
        <div className="wins-filter-group">
          <label className="wins-label">Tag</label>
          <input
            type="text"
            className="wins-input wins-filter-input"
            placeholder="Filter by tag"
            value={local.tag}
            onChange={(e) => set('tag', e.target.value)}
            list="wins-tags-list"
          />
          <datalist id="wins-tags-list">
            {allTags.map((t) => <option key={t} value={t} />)}
          </datalist>
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
