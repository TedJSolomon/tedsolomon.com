'use client';

import { useState, useTransition } from 'react';
import { deleteItem, togglePurchased } from './actions';
import WishlistEditModal from './WishlistEditModal';
import { getCategoryColor, WL_PRIORITY_COLORS } from '../../lib/wishlist';

function formatPrice(price) {
  if (price == null) return null;
  return `$${Number(price).toFixed(2)}`;
}

function ItemImage({ imageUrl, name, productUrl, purchased }) {
  const [error, setError] = useState(false);

  const content = imageUrl && !error ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={imageUrl} alt={name} className="wl-card-image" onError={() => setError(true)} />
  ) : (
    <div className="wl-card-image wl-card-image-placeholder">
      <span>{name.charAt(0).toUpperCase()}</span>
    </div>
  );

  return (
    <div className="wl-card-image-wrap">
      {productUrl ? (
        <a href={productUrl} target="_blank" rel="noopener noreferrer"
          className="wl-card-image-link" tabIndex={-1} aria-label={`Open ${name} product page`}>
          {content}
        </a>
      ) : content}
      {purchased && (
        <div className="wl-purchased-overlay"><span>Purchased</span></div>
      )}
    </div>
  );
}

export default function WishlistCard({ item, allCategories = [] }) {
  const [editing,   setEditing]   = useState(false);
  const [deleting,  startDelete]  = useTransition();
  const [toggling,  startToggle]  = useTransition();
  const [purchased, setPurchased] = useState(item.purchased);

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
      <div className={`wl-card${purchased ? ' wl-card-purchased' : ''}`}>
        <ItemImage
          imageUrl={item.image_url}
          name={item.name}
          productUrl={item.url}
          purchased={purchased}
        />

        <div className="wl-card-body">
          <div className="wl-card-badges">
            <span className="wl-badge wl-cat-badge"
              style={{ background: `rgba(${catColor.rgb},0.14)`, color: catColor.bg }}>
              {item.category}
            </span>
            <span className="wl-badge wl-pri-badge"
              style={{ background: `rgba(${priColor.rgb},0.14)`, color: priColor.bg }}>
              {item.priority}
            </span>
          </div>

          <h3 className="wl-card-name">{item.name}</h3>

          {price && <div className="wl-card-price">{price}</div>}

          {item.description && (
            <p className="wl-card-desc">{item.description}</p>
          )}

          {item.url && (
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="wl-buy-link">
              View Product →
            </a>
          )}
        </div>

        <div className="wl-card-footer">
          <label className="wl-purchased-toggle">
            <input type="checkbox" checked={purchased} disabled={toggling} onChange={handleToggle} />
            <span>Purchased</span>
          </label>
          <div className="win-card-actions">
            <button type="button" className="win-edit-btn" onClick={() => setEditing(true)}>Edit</button>
            <button type="button" className="win-delete-btn" onClick={handleDelete} disabled={deleting}>
              {deleting ? '…' : 'Delete'}
            </button>
          </div>
        </div>
      </div>

      {editing && (
        <WishlistEditModal item={item} allCategories={allCategories} onClose={() => setEditing(false)} />
      )}
    </>
  );
}
