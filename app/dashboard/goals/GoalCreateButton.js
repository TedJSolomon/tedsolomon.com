'use client';

import { useState } from 'react';
import GoalFormModal from './GoalFormModal';

export default function GoalCreateButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="btn-primary goal-create-btn" onClick={() => setOpen(true)}>
        + New Goal
      </button>
      {open && <GoalFormModal onClose={() => setOpen(false)} />}
    </>
  );
}
