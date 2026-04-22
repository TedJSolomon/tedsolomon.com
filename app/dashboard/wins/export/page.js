import { getAllWins, filterWins } from '../../../lib/wins';
import PrintButton from './PrintButton';

export const metadata = { title: 'Export Wins — Dashboard' };

const CATEGORY_LABELS = {
  shipped: 'Shipped',
  learned: 'Learned',
  led: 'Led',
  impact: 'Impact',
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default async function ExportPage({ searchParams }) {
  const sp = await searchParams;
  const from = sp?.from || '';
  const to = sp?.to || '';
  const visibility = sp?.visibility || '';

  const allWins = await getAllWins();
  const wins = filterWins(allWins, { from, to, visibility });

  // Group by category in a defined order
  const order = ['shipped', 'led', 'impact', 'learned'];
  const grouped = {};
  for (const cat of order) grouped[cat] = [];
  for (const win of wins) {
    if (grouped[win.category]) grouped[win.category].push(win);
    else grouped[win.category] = [win];
  }
  const usedCategories = order.filter((c) => grouped[c]?.length > 0);

  const rangeLabel =
    from && to ? `${formatDate(from)} – ${formatDate(to)}`
    : from ? `From ${formatDate(from)}`
    : to ? `Through ${formatDate(to)}`
    : 'All time';

  const visLabel = visibility
    ? visibility.charAt(0).toUpperCase() + visibility.slice(1)
    : 'All';

  return (
    <div className="db-content export-page">

      {/* Controls — hidden when printing */}
      <div className="export-controls no-print">
        <div className="db-page-tag">Export</div>
        <div className="wins-page-title-row">
          <h1 className="db-page-title">Export Wins</h1>
          <PrintButton />
        </div>
        <p className="db-page-sub">Filter below, then print or save as PDF.</p>

        <form method="GET" className="export-filters">
          <div className="wins-fields-row">
            <div className="wins-field">
              <label className="wins-label" htmlFor="ef-from">From</label>
              <input id="ef-from" name="from" type="date" className="wins-input" defaultValue={from} />
            </div>
            <div className="wins-field">
              <label className="wins-label" htmlFor="ef-to">To</label>
              <input id="ef-to" name="to" type="date" className="wins-input" defaultValue={to} />
            </div>
            <div className="wins-field">
              <label className="wins-label" htmlFor="ef-vis">Visibility</label>
              <select id="ef-vis" name="visibility" className="wins-select" defaultValue={visibility}>
                <option value="">All</option>
                <option value="resume">Resume</option>
                <option value="raise">Raise</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn-secondary">Apply Filters</button>
        </form>

        <div className="export-divider" />
      </div>

      {/* Printable content */}
      <div className="export-doc">
        <div className="export-doc-header">
          <div className="export-doc-name">Ted Solomon — Wins Log</div>
          <div className="export-doc-meta">
            {rangeLabel} &nbsp;·&nbsp; Visibility: {visLabel} &nbsp;·&nbsp; {wins.length} entries
          </div>
        </div>

        {wins.length === 0 ? (
          <p className="export-empty">No wins match the current filters.</p>
        ) : (
          usedCategories.map((cat) => (
            <div key={cat} className="export-category">
              <div className="export-category-label">{CATEGORY_LABELS[cat]}</div>
              <ul className="export-list">
                {grouped[cat].map((win) => (
                  <li key={win.id} className="export-item">
                    <div className="export-item-header">
                      <span className="export-item-date">{formatDate(win.date)}</span>
                      {win.visibility !== 'both' && (
                        <span className="export-item-vis">{win.visibility}</span>
                      )}
                    </div>
                    {win.impact && (
                      <div className="export-item-impact">{win.impact}</div>
                    )}
                    <div className="export-item-desc">{win.description}</div>
                    {win.tags.length > 0 && (
                      <div className="export-item-tags">{win.tags.join(', ')}</div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
