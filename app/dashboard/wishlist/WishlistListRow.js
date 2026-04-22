'use client';

import { useState, useTransition } from 'react';
import { deleteItem, togglePurchased } from './actions';
import WishlistEditModal from './WishlistEditModal';
import { getCategoryColor, WL_PRIORITY_COLORS } from '../../lib/wishlist';

function formatPrice(price) {
  if (price == null) return null;
  return `$${Number(price).toFixed(2)}`;
}

export default function WishlistListRow({ item, allCategories = [] }) {
  const [editing,   setEditing]   = useState(false);
  const [deleting,  startDelete]  = useTransition();
  const [toggling,  startToggle]  = useTransition();
  const [purchased, setPurchased] = useState(item.purchased);
  const [imgError,  setImgError]  = useState(false);

  const catColor = getCategoryColor(item.category);
  const priColor = WL_PRIORITY_COLORS[item.priority] || WL_PRIORITY_COLORS.Want;
  const price    = formatPrice(item.price);

  function handleDelete() {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    startDelete(() => deleteItem(item.id));
  }

  function handleToggle() {
    const next = !purchased;
    setPurchased(next);
    startToggle(() => togglePurchased(item.id, next));
  }

  return (
    <>
      <div className={`wl-list-row${purchased ? ' wl-list-row-purchased' : ''}`}>
        <div className="wl-list-thumb">
          {item.image_url && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.image_url} alt={item.name} onError={() => setImgError(true)} />
          ) : (
            <div className="wl-list-thumb-placeholder">
              <span>{item.name.charAt(0).toUpperCase()}</span>
            </div>
          )}
        </div>

        <div className="wl-list-main">
          <span className="wl-list-name">{item.name}</span>
          <div className="wl-list-badges">
            <span className="wl-badge wl-cat-badge"
              style={{ background: `rgba(${catColor.rgb},0.14)`, color: catColor.bg }}>
              {item.category}
            </span>
            <span className="wl-badge wl-pri-badge"
              style={{ background: `rgba(${priColor.rgb},0.14)`, color: priColor.bg }}>
              {item.priority}
            </span>
          </div>
        </div>

        {price ? (
          <div className="wl-list-price">{price}</div>
        ) : (
          <div className="wl-list-price wl-list-price-empty" />
        )}

        <div className="wl-list-actions">
          {item.url && (
            <a href={item.url} target="_blank" rel="noopener noreferrer"
              className="wl-list-link-btn" title="View product" aria-label={`View ${item.name} product page`}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                <path d="M5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1V8M8 1h4m0 0v4m0-4L5.5 7.5"
                  stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          )}
          <label className="wl-list-check" title={purchased ? 'Mark unpurchased' : 'Mark purchased'}>
            <input type="checkbox" checked={purchased} disabled={toggling} onChange={handleToggle} />
          </label>
          <button type="button" className="win-edit-btn wl-list-edit-btn" onClick={() => setEditing(true)}>
            Edit
          </button>
          <button type="button" className="win-delete-btn wl-list-del-btn" onClick={handleDelete} disabled={deleting}>
            {deleting ? '…' : 'Del'}
          </button>
        </div>
      </div>

      {editing && (
        <WishlistEditModal item={item} allCategories={allCategories} onClose={() => setEditing(false)} />
      )}
    </>
  );
}
