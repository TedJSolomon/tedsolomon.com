'use client';

import { useState } from 'react';
import WishlistShareModal from './WishlistShareModal';

export default function WishlistShareButton({ allItems }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="btn-secondary wl-share-btn" onClick={() => setOpen(true)}>
        Share ↗
      </button>
      {open && <WishlistShareModal allItems={allItems} onClose={() => setOpen(false)} />}
    </>
  );
}
