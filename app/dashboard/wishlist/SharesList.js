'use client';

import { useState, useTransition } from 'react';
import { deleteShare } from './actions';

function CopyButton({ url }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button type="button" className="win-edit-btn wl-copy-inline-btn" onClick={copy}>
      {copied ? 'Copied!' : 'Copy Link'}
    </button>
  );
}

function ShareRow({ share }) {
  const [deleting, startDelete] = useTransition();
  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/wishlist/${share.share_token}`;
  const date = new Date(share.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const count = (share.item_ids || []).length;

  function handleDelete() {
    if (!confirm(`Delete "${share.title}"? The link will stop working.`)) return;
    startDelete(() => deleteShare(share.id));
  }

  return (
    <div className="wl-share-row">
      <div className="wl-share-row-left">
        <span className="wl-share-title">{share.title}</span>
        <span className="wl-share-meta">{count} item{count !== 1 ? 's' : ''} · Created {date}</span>
        <span className="wl-share-token-url">{url}</span>
      </div>
      <div className="wl-share-row-actions">
        <CopyButton url={url} />
        <button type="button" className="win-delete-btn" onClick={handleDelete} disabled={deleting}>
          {deleting ? '…' : 'Delete'}
        </button>
      </div>
    </div>
  );
}

export default function SharesList({ shares }) {
  if (!shares.length) return null;

  return (
    <div className="wl-shares-section">
      <div className="wl-shares-header">
        <span className="ooo-count">{shares.length} share link{shares.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="wl-shares-list">
        {shares.map((s) => <ShareRow key={s.id} share={s} />)}
      </div>
    </div>
  );
}
