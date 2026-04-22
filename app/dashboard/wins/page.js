import Link from 'next/link';
import WinsForm from './WinsForm';
import WinsFilters from './WinsFilters';
import WinCard from './WinCard';
import WinsCharts from './WinsCharts';
import {
  getAllWins,
  filterWins,
  getAllTags,
  getCategoryCounts,
  getTopTagCounts,
  getImpactTypeCounts,
} from '../../lib/wins';

export const metadata = { title: 'Daily Wins — Dashboard' };

export default async function WinsPage({ searchParams }) {
  const sp = await searchParams;
  const from       = sp?.from       || '';
  const to         = sp?.to         || '';
  const category   = sp?.category   || '';
  const visibility = sp?.visibility || '';
  const tag        = sp?.tag        || '';

  const allWins  = await getAllWins();
  const filtered = filterWins(allWins, { from, to, category, visibility, tag });
  const allTags  = getAllTags(allWins);

  const categoryCounts   = getCategoryCounts(allWins);
  const tagCounts        = getTopTagCounts(allWins, 10);
  const impactTypeCounts = getImpactTypeCounts(allWins);

  const today = new Date().toLocaleDateString('en-CA');
  const filters = { from, to, category, visibility, tag };
  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <div className="db-content wins-page">

      <div className="db-page-header">
        <div className="db-page-tag">Daily Wins</div>
        <div className="wins-page-title-row">
          <h1 className="db-page-title">Daily Wins</h1>
          <Link href="/dashboard/wins/export" className="btn-secondary wins-export-link">
            Export →
          </Link>
        </div>
        <p className="db-page-sub">Log what you shipped, learned, led, or drove impact on.</p>
      </div>

      {/* Top section: form + filter header | charts */}
      <div className="wins-top-section">
        <div className="wins-top-left">
          <WinsForm today={today} existingTags={allTags} />
          <div className="wins-list-header">
            <span className="wins-count">
              {filtered.length} win{filtered.length !== 1 ? 's' : ''}
              {hasActiveFilters ? ' (filtered)' : ''}
            </span>
            <WinsFilters filters={filters} allTags={allTags} />
          </div>
        </div>

        <WinsCharts
          categoryCounts={categoryCounts}
          tagCounts={tagCounts}
          impactTypeCounts={impactTypeCounts}
        />
      </div>

      {/* Full-width wins grid */}
      {filtered.length === 0 ? (
        <div className="wins-empty">
          <p>{hasActiveFilters ? 'No wins match these filters.' : 'No wins yet. Log your first one above.'}</p>
        </div>
      ) : (
        <div className="wins-grid">
          {filtered.map((win) => (
            <WinCard key={win.id} win={win} existingTags={allTags} />
          ))}
        </div>
      )}

    </div>
  );
}
