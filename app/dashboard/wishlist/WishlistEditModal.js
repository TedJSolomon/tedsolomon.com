'use client';

import { useActionState, useEffect, useState, useCallback, useRef } from 'react';
import { updateItem } from './actions';
import { WL_PRIORITIES } from '../../lib/wishlist';

// Shared combobox (same as in WishlistItemForm)
function CategoryCombobox({ value, onChange, categories, inputId }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const filtered = categories.filter((c) =>
    c.toLowerCase().includes(value.toLowerCase())
  );
  const showCreate = value.trim() && !categories.some((c) => c.toLowerCase() === value.toLowerCase());

  useEffect(() => {
    function onDown(e) { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  return (
    <div className="wl-combo-wrap" ref={wrapRef}>
      <input
        id={inputId}
        name="category"
        type="text"
        className="wins-input"
        value={value}
        autoComplete="off"
        placeholder="Category…"
        required
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
      />
      {open && (filtered.length > 0 || showCreate) && (
        <ul className="wl-combo-dropdown">
          {filtered.map((c) => (
            <li key={c} className="wl-combo-option"
              onMouseDown={(e) => { e.preventDefault(); onChange(c); setOpen(false); }}>
              {c}
            </li>
          ))}
          {showCreate && (
            <li className="wl-combo-option wl-combo-create"
              onMouseDown={(e) => { e.preventDefault(); onChange(value.trim()); setOpen(false); }}>
              Create &ldquo;{value.trim()}&rdquo;
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

export default function WishlistEditModal({ item, allCategories = [], onClose }) {
  const boundAction = updateItem.bind(null, item.id);
  const [state, formAction, pending] = useActionState(boundAction, {});

  const [productUrl, setProductUrl] = useState(item.url        ?? '');
  const [imageUrl,   setImageUrl]   = useState(item.image_url  ?? '');
  const [category,   setCategory]   = useState(item.category   ?? '');
  const [fetching,   setFetching]   = useState(false);
  const [showImgField, setShowImgField] = useState(true); // always shown in edit

  useEffect(() => { if (state?.success) onClose(); }, [state, onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', onKey); };
  }, [onClose]);

  const runFetch = useCallback(async (url) => {
    const trimmed = url?.trim();
    if (!trimmed) return;
    try { new URL(trimmed); } catch { return; }
    setFetching(true);
    try {
      const res  = await fetch(`/api/og-image?url=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (data.image) setImageUrl(data.image);
    } catch {}
    finally { setFetching(false); }
  }, []);

  function handleUrlPaste(e) {
    const pasted = (e.clipboardData || window.clipboardData).getData('text').trim();
    if (!pasted.startsWith('http')) return;
    setProductUrl(pasted);
    setTimeout(() => runFetch(pasted), 0);
  }

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-label="Edit Item">
        <div className="modal-header">
          <span className="modal-title">Edit — {item.name}</span>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <form action={formAction} className="wins-form">

          {/* URL first */}
          <div className="wins-field">
            <label className="wins-label" htmlFor="edit-wl-url">
              Product Link <span className="wins-label-optional">(optional)</span>
            </label>
            <div className="wl-url-row">
              <input id="edit-wl-url" name="url" type="url" className="wins-input"
                placeholder="https://…" value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                onPaste={handleUrlPaste} />
              <button type="button" className="btn-secondary wl-fetch-btn"
                onClick={() => runFetch(productUrl)}
                disabled={fetching || !productUrl.trim()}>
                {fetching ? <span className="wl-fetch-spinner" aria-label="Fetching…" /> : 'Fetch Image'}
              </button>
            </div>
          </div>

          {/* Image URL */}
          <div className="wins-field">
            <label className="wins-label" htmlFor="edit-wl-img">
              Image URL <span className="wins-label-optional">(optional)</span>
            </label>
            <div className="wl-image-field-row">
              <input id="edit-wl-img" name="image_url" type="url" className="wins-input"
                placeholder="https://…" value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)} />
              {imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="Preview" className="wl-img-thumb"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              )}
            </div>
          </div>

          <div className="wl-row-2">
            <div className="wins-field">
              <label className="wins-label" htmlFor="edit-wl-name">Name</label>
              <input id="edit-wl-name" name="name" type="text" className="wins-input"
                defaultValue={item.name} required />
            </div>
            <div className="wins-field">
              <label className="wins-label" htmlFor="edit-wl-price">
                Price <span className="wins-label-optional">(optional)</span>
              </label>
              <input id="edit-wl-price" name="price" type="number" step="0.01" min="0"
                className="wins-input" defaultValue={item.price ?? ''} placeholder="0.00" />
            </div>
          </div>

          <div className="wl-row-2">
            <div className="wins-field">
              <label className="wins-label" htmlFor="edit-wl-cat">Category</label>
              <CategoryCombobox inputId="edit-wl-cat" value={category}
                onChange={setCategory} categories={allCategories} />
            </div>
            <div className="wins-field">
              <label className="wins-label" htmlFor="edit-wl-pri">Priority</label>
              <select id="edit-wl-pri" name="priority" className="wins-input wins-select"
                defaultValue={item.priority} required>
                {WL_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="wins-field">
            <label className="wins-label" htmlFor="edit-wl-desc">
              Description <span className="wins-label-optional">(optional)</span>
            </label>
            <textarea id="edit-wl-desc" name="description" className="wins-textarea" rows={2}
              defaultValue={item.description ?? ''} />
          </div>

          {state?.error && <p className="wins-form-error" role="alert">{state.error}</p>}

          <div className="modal-actions">
            <button type="submit" className="btn-primary wins-submit" disabled={pending}>
              {pending ? 'Saving…' : 'Save Changes →'}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          </div>

        </form>
      </div>
    </div>
  );
}
