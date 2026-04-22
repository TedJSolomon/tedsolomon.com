'use client';

import { useState } from 'react';
import WishlistCard from './WishlistCard';
import WishlistListRow from './WishlistListRow';
import { getCategoryColor } from '../../lib/wishlist';

function ChevronIcon({ open }) {
  return (
    <svg
      className={`wl-chevron${open ? ' wl-chevron-open' : ''}`}
      width="16" height="16" viewBox="0 0 16 16" fill="none"
      aria-hidden="true"
    >
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="8.5" y="1" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="1" y="8.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path d="M2 3.5h11M2 7.5h11M2 11.5h11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export default function WishlistSections({ sortedItems, allCategories, categoryNames }) {
  const [collapsed, setCollapsed] = useState({});
  const [view, setView] = useState('grid');

  const allCollapsed = categoryNames.length > 0 && categoryNames.every((c) => !!collapsed[c]);

  function toggleSection(cat) {
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));
  }

  function collapseAll() {
    const next = {};
    categoryNames.forEach((c) => { next[c] = true; });
    setCollapsed(next);
  }

  function expandAll() {
    setCollapsed({});
  }

  return (
    <div>
      <div className="wl-view-controls">
        <div className="wl-view-toggle">
          <button
            type="button"
            className={`wl-view-btn${view === 'grid' ? ' active' : ''}`}
            onClick={() => setView('grid')}
            title="Grid view"
          >
            <GridIcon /> Grid
          </button>
          <button
            type="button"
            className={`wl-view-btn${view === 'list' ? ' active' : ''}`}
            onClick={() => setView('list')}
            title="List view"
          >
            <ListIcon /> List
          </button>
        </div>

        <button
          type="button"
          className="btn-secondary wl-collapse-all-btn"
          onClick={allCollapsed ? expandAll : collapseAll}
        >
          {allCollapsed ? 'Expand All' : 'Collapse All'}
        </button>
      </div>

      <div className="wl-sections">
        {categoryNames.map((cat) => {
          const catItems = sortedItems.filter((i) => i.category === cat);
          const color = getCategoryColor(cat);
          const isCollapsed = !!collapsed[cat];

          return (
            <div key={cat} className="wl-category-section">
              <button
                type="button"
                className="wl-section-header"
                onClick={() => toggleSection(cat)}
                aria-expanded={!isCollapsed}
              >
                <ChevronIcon open={!isCollapsed} />
                <span
                  className="wl-section-cat-badge"
                  style={{ background: `rgba(${color.rgb},0.14)`, color: color.bg }}
                >
                  {cat}
                </span>
                <span className="wl-section-count">
                  {catItems.length} item{catItems.length !== 1 ? 's' : ''}
                </span>
              </button>

              {!isCollapsed && (
                view === 'grid' ? (
                  <div className="wl-grid">
                    {catItems.map((item) => (
                      <WishlistCard key={item.id} item={item} allCategories={allCategories} />
                    ))}
                  </div>
                ) : (
                  <div className="wl-list">
                    {catItems.map((item) => (
                      <WishlistListRow key={item.id} item={item} allCategories={allCategories} />
                    ))}
                  </div>
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
