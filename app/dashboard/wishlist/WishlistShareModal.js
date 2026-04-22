'use client';

import { useActionState, useEffect, useState } from 'react';
import { createShare } from './actions';

function ShareSuccess({ token, onClose }) {
  const [copied, setCopied] = useState(false);
  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/wishlist/${token}`;

  function copy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="wl-share-success">
      <div className="wl-share-success-icon">✓</div>
      <p className="wl-share-success-msg">Your share link is ready!</p>
      <div className="wl-share-url-row">
        <input type="text" readOnly className="wins-input wl-share-url-input" value={url} />
        <button type="button" className="btn-primary wl-copy-btn" onClick={copy}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <button type="button" className="btn-secondary wl-share-done-btn" onClick={onClose}>Done</button>
    </div>
  );
}

export default function WishlistShareModal({ allItems, onClose }) {
  const [state, formAction, pending] = useActionState(createShare, {});
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function selectAll()  { setSelected(new Set(allItems.map((i) => i.id))); }
  function selectNone() { setSelected(new Set()); }

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card wl-share-modal-card" role="dialog" aria-modal="true" aria-label="Create Share Link">
        <div className="modal-header">
          <span className="modal-title">Create Share Link</span>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        {state?.success ? (
          <ShareSuccess token={state.token} onClose={onClose} />
        ) : (
          <form action={formAction} className="wins-form">

            <div className="wins-field">
              <label className="wins-label" htmlFor="share-title">List Title</label>
              <input
                id="share-title"
                name="title"
                type="text"
                className="wins-input"
                placeholder="e.g. Birthday Ideas, Holiday List…"
                required
              />
            </div>

            <div className="wins-field">
              <div className="wl-share-items-header">
                <span className="wins-label">Select Items ({selected.size} selected)</span>
                <div className="wl-share-sel-actions">
                  <button type="button" className="wl-sel-btn" onClick={selectAll}>All</button>
                  <button type="button" className="wl-sel-btn" onClick={selectNone}>None</button>
                </div>
              </div>

              <div className="wl-share-items-list">
                {allItems.length === 0 && (
                  <p className="goal-subtasks-empty">No items in your wishlist yet.</p>
                )}
                {allItems.map((item) => (
                  <label key={item.id} className={`wl-share-item${selected.has(item.id) ? ' selected' : ''}`}>
                    <input
                      type="checkbox"
                      name="item_ids"
                      value={item.id}
                      checked={selected.has(item.id)}
                      onChange={() => toggle(item.id)}
                    />
                    <span className="wl-share-item-name">{item.name}</span>
                    {item.price != null && (
                      <span className="wl-share-item-price">${Number(item.price).toFixed(2)}</span>
                    )}
                    <span className="wl-share-item-cat">{item.category}</span>
                  </label>
                ))}
              </div>
            </div>

            {state?.error && <p className="wins-form-error" role="alert">{state.error}</p>}

            <div className="modal-actions">
              <button type="submit" className="btn-primary wins-submit" disabled={pending || selected.size === 0}>
                {pending ? 'Creating…' : `Create Link (${selected.size} items) →`}
              </button>
              <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}
