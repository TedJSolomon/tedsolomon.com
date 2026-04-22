'use client';

import { useActionState, useState, useEffect, useCallback, useRef } from 'react';
import { addItem } from './actions';
import { WL_PRIORITIES } from '../../lib/wishlist';

// ── Category combobox ─────────────────────────────────────────────────────────

function CategoryCombobox({ value, onChange, categories, inputId }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const filtered = categories.filter((c) =>
    c.toLowerCase().includes(value.toLowerCase())
  );
  const showCreate = value.trim() && !categories.some((c) => c.toLowerCase() === value.toLowerCase());

  // Close on outside click
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
            <li
              key={c}
              className="wl-combo-option"
              onMouseDown={(e) => { e.preventDefault(); onChange(c); setOpen(false); }}
            >
              {c}
            </li>
          ))}
          {showCreate && (
            <li
              className="wl-combo-option wl-combo-create"
              onMouseDown={(e) => { e.preventDefault(); onChange(value.trim()); setOpen(false); }}
            >
              Create &ldquo;{value.trim()}&rdquo;
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

// ── Main add-item modal ───────────────────────────────────────────────────────

export default function WishlistItemForm({ allCategories = [] }) {
  const [state, formAction, pending] = useActionState(addItem, {});
  const [open,    setOpen]    = useState(false);
  const [formKey, setFormKey] = useState(0);

  // Controlled fields (need auto-fill)
  const [productUrl, setProductUrl] = useState('');
  const [name,       setName]       = useState('');
  const [price,      setPrice]      = useState('');
  const [category,   setCategory]   = useState('');
  const [imageUrl,   setImageUrl]   = useState('');

  // Fetch state
  const [fetching,      setFetching]      = useState(false);
  const [showImgField,  setShowImgField]  = useState(false); // shown only if no auto-image
  const [fetchDone,     setFetchDone]     = useState(false);

  // Reset all state on success
  useEffect(() => {
    if (state?.success) {
      setOpen(false);
      setFormKey((k) => k + 1);
      setProductUrl(''); setName(''); setPrice(''); setCategory(''); setImageUrl('');
      setFetching(false); setShowImgField(false); setFetchDone(false);
    }
  }, [state]);

  // Also reset when modal is closed manually
  function handleClose() {
    setOpen(false);
    setFormKey((k) => k + 1);
    setProductUrl(''); setName(''); setPrice(''); setCategory(''); setImageUrl('');
    setFetching(false); setShowImgField(false); setFetchDone(false);
  }

  const runFetch = useCallback(async (url) => {
    const trimmed = url?.trim();
    if (!trimmed) return;
    try { new URL(trimmed); } catch { return; }

    setFetching(true);
    setFetchDone(false);
    try {
      const res  = await fetch(`/api/og-image?url=${encodeURIComponent(trimmed)}`);
      const data = await res.json();

      if (data.image) {
        setImageUrl(data.image);
        setShowImgField(false);
      } else {
        setShowImgField(true); // no image found — show manual field
      }
      if (data.title) setName(data.title);
      if (data.price) setPrice(String(data.price));
    } catch {
      setShowImgField(true);
    } finally {
      setFetching(false);
      setFetchDone(true);
    }
  }, []);

  function handleUrlPaste(e) {
    const pasted = (e.clipboardData || window.clipboardData).getData('text').trim();
    if (!pasted.startsWith('http')) return;
    setProductUrl(pasted);
    // Let the paste land in the input before fetching
    setTimeout(() => runFetch(pasted), 0);
  }

  function handleUrlBlur(e) {
    const val = e.target.value.trim();
    if (val && !fetchDone) runFetch(val);
  }

  // Escape key closes modal
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      <button type="button" className="btn-primary wl-add-btn" onClick={() => setOpen(true)}>
        + Add Item
      </button>

      {open && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
          <div className="modal-card wl-add-modal" role="dialog" aria-modal="true" aria-label="Add Wishlist Item">
            <div className="modal-header">
              <span className="modal-title">Add Item</span>
              <button type="button" className="modal-close" onClick={handleClose} aria-label="Close">×</button>
            </div>

            <form key={formKey} action={formAction} className="wins-form">

              {/* 1. Product URL — first, triggers auto-fill */}
              <div className="wins-field">
                <label className="wins-label" htmlFor="wl-url">
                  Product Link <span className="wins-label-optional">(optional — paste to auto-fill)</span>
                </label>
                <div className="wl-url-row">
                  <input
                    id="wl-url"
                    name="url"
                    type="url"
                    className="wins-input"
                    placeholder="https://…"
                    value={productUrl}
                    onChange={(e) => { setProductUrl(e.target.value); setFetchDone(false); }}
                    onPaste={handleUrlPaste}
                    onBlur={handleUrlBlur}
                  />
                  {fetching && <span className="wl-fetch-spinner" aria-label="Fetching…" />}
                </div>
              </div>

              {/* Image preview / field */}
              {(imageUrl || showImgField) && (
                <div className="wins-field">
                  <div className="wl-img-label-row">
                    <label className="wins-label" htmlFor="wl-image">Image URL</label>
                    {imageUrl && !showImgField && (
                      <button type="button" className="wl-img-change-btn"
                        onClick={() => setShowImgField(true)}>change</button>
                    )}
                  </div>
                  <div className="wl-image-field-row">
                    {showImgField && (
                      <input
                        id="wl-image"
                        name="image_url"
                        type="url"
                        className="wins-input"
                        placeholder="https://…"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                      />
                    )}
                    {!showImgField && <input type="hidden" name="image_url" value={imageUrl} />}
                    {imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imageUrl} alt="Preview" className="wl-img-thumb-lg"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    )}
                  </div>
                </div>
              )}
              {/* Hidden field when no image at all */}
              {!imageUrl && !showImgField && (
                <input type="hidden" name="image_url" value="" />
              )}

              {/* 2. Name */}
              <div className="wins-field">
                <label className="wins-label" htmlFor="wl-name">Name</label>
                <input id="wl-name" name="name" type="text" className="wins-input"
                  value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              {/* 3. Price + category row */}
              <div className="wl-row-2">
                <div className="wins-field">
                  <label className="wins-label" htmlFor="wl-price">
                    Price <span className="wins-label-optional">(optional)</span>
                  </label>
                  <input id="wl-price" name="price" type="number" step="0.01" min="0"
                    className="wins-input" placeholder="0.00"
                    value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
                <div className="wins-field">
                  <label className="wins-label" htmlFor="wl-category">Category</label>
                  <CategoryCombobox
                    inputId="wl-category"
                    value={category}
                    onChange={setCategory}
                    categories={allCategories}
                  />
                </div>
              </div>

              {/* 4. Priority */}
              <div className="wins-field">
                <label className="wins-label" htmlFor="wl-priority">Priority</label>
                <select id="wl-priority" name="priority" className="wins-input wins-select"
                  defaultValue="" required>
                  <option value="" disabled>Select…</option>
                  {WL_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              {/* 5. Description */}
              <div className="wins-field">
                <label className="wins-label" htmlFor="wl-desc">
                  Description <span className="wins-label-optional">(optional)</span>
                </label>
                <textarea id="wl-desc" name="description" className="wins-textarea" rows={2} />
              </div>

              {state?.error && <p className="wins-form-error" role="alert">{state.error}</p>}

              <div className="modal-actions">
                <button type="submit" className="btn-primary wins-submit" disabled={pending || fetching}>
                  {pending ? 'Saving…' : fetching ? 'Fetching…' : 'Add to Wishlist →'}
                </button>
                <button type="button" className="btn-secondary" onClick={handleClose}>Cancel</button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}
