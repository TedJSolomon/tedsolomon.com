'use client';

import { useTransition } from 'react';
import { deleteWin } from './actions';

export default function DeleteWinButton({ filename }) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm('Delete this win? This cannot be undone.')) return;
    startTransition(() => deleteWin(filename));
  }

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      className="win-delete-btn"
      aria-label="Delete win"
    >
      {pending ? '…' : 'Delete'}
    </button>
  );
}
