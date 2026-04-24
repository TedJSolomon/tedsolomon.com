'use client';

import { useRouter, usePathname } from 'next/navigation';

export default function GoalViewToggle({ currentView, filters }) {
  const router   = useRouter();
  const pathname = usePathname();

  function navigate(view) {
    const params = new URLSearchParams();
    if (filters?.category) params.set('category', filters.category);
    if (filters?.status)   params.set('status',   filters.status);
    if (filters?.search)   params.set('search',   filters.search);
    if (view !== 'grid')   params.set('view',     view);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  const isTimeline = currentView === 'timeline';

  return (
    <div className="goal-view-toggle" role="group" aria-label="View mode">
      <button
        type="button"
        className={`goal-view-btn${!isTimeline ? ' active' : ''}`}
        onClick={() => navigate('grid')}
        title="Grid view"
      >
        Grid
      </button>
      <button
        type="button"
        className={`goal-view-btn${isTimeline ? ' active' : ''}`}
        onClick={() => navigate('timeline')}
        title="Timeline / Gantt view"
      >
        Timeline
      </button>
    </div>
  );
}
