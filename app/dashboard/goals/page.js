import GoalCreateButton from './GoalCreateButton';
import GoalFilters from './GoalFilters';
import GoalViewToggle from './GoalViewToggle';
import GoalCard from './GoalCard';
import GoalTimeline from './GoalTimeline';
import GoalsProgressChart from './GoalsProgressChart';
import { getAllGoals, filterGoals } from '../../lib/goals';

export const metadata = { title: 'Goals — Dashboard' };

export default async function GoalsPage({ searchParams }) {
  const sp       = await searchParams;
  const category = sp?.category || '';
  const status   = sp?.status   || '';
  const search   = sp?.search   || '';
  const view     = sp?.view     || 'grid';

  const allGoals  = await getAllGoals();
  const filtered  = filterGoals(allGoals, { category, status, search });
  const filters   = { category, status, search };
  const hasActive = Object.values(filters).some(Boolean);

  return (
    <div className="db-content goals-page">

      <div className="db-page-header">
        <div className="db-page-tag">Goals</div>
        <h1 className="db-page-title">Goal Tracking</h1>
        <p className="db-page-sub">Set goals, break them into subtasks, track your progress.</p>
      </div>

      <GoalsProgressChart goals={allGoals} />

      <div className="goals-toolbar">
        <GoalCreateButton />
        <GoalFilters filters={filters} view={view} />
        <GoalViewToggle currentView={view} filters={filters} />
      </div>

      <div className="goals-list-header">
        <span className="ooo-count">
          {filtered.length} goal{filtered.length !== 1 ? 's' : ''}
          {hasActive ? ' (filtered)' : ''}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="wins-empty">
          <p>{hasActive ? 'No goals match these filters.' : 'No goals yet. Create your first goal!'}</p>
        </div>
      ) : view === 'timeline' ? (
        <GoalTimeline goals={filtered} />
      ) : (
        <div className="goals-grid">
          {filtered.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}

    </div>
  );
}
