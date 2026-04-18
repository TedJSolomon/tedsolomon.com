'use client';

import { useState, useRef } from 'react';

export default function TagPicker({ existingTags = [], initialSelected = [] }) {
  const [selected, setSelected] = useState(initialSelected);
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);

  const query = input.trim().toLowerCase();
  const suggestions = existingTags.filter(
    (t) => !selected.includes(t) && t.toLowerCase().includes(query)
  );
  const canCreate =
    query.length > 0 &&
    !existingTags.includes(query) &&
    !selected.includes(query);

  function add(tag) {
    const clean = tag.trim().toLowerCase();
    if (!clean || selected.includes(clean)) return;
    setSelected((prev) => [...prev, clean]);
    setInput('');
    inputRef.current?.focus();
  }

  function remove(tag) {
    setSelected((prev) => prev.filter((t) => t !== tag));
  }

  function handleKeyDown(e) {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      add(input);
    }
    if (e.key === 'Backspace' && !input && selected.length) {
      remove(selected[selected.length - 1]);
    }
    if (e.key === 'Escape') setOpen(false);
  }

  const showDropdown = open && (suggestions.length > 0 || canCreate);

  return (
    <div className="tag-picker-wrap">
      {/* Hidden input carries the value to the server action */}
      <input type="hidden" name="tags" value={selected.join(',')} />

      <div
        className="tag-picker"
        onClick={() => inputRef.current?.focus()}
      >
        {selected.map((tag) => (
          <span key={tag} className="tag-chip">
            {tag}
            <button
              type="button"
              className="tag-chip-remove"
              onClick={(e) => { e.stopPropagation(); remove(tag); }}
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          className="tag-picker-input"
          value={input}
          placeholder={selected.length === 0 ? 'Add tags…' : ''}
          onChange={(e) => { setInput(e.target.value); setOpen(true); }}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          autoComplete="off"
        />
      </div>

      {showDropdown && (
        <div className="tag-picker-dropdown">
          {suggestions.map((tag) => (
            <button
              key={tag}
              type="button"
              className="tag-picker-option"
              onMouseDown={(e) => { e.preventDefault(); add(tag); }}
            >
              {tag}
            </button>
          ))}
          {canCreate && (
            <button
              type="button"
              className="tag-picker-option tag-picker-option--create"
              onMouseDown={(e) => { e.preventDefault(); add(input); }}
            >
              Create &ldquo;{input.trim()}&rdquo;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
