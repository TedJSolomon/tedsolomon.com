import OOOForm from './OOOForm';
import OOOFilters from './OOOFilters';
import OOOCard from './OOOCard';
import { getAllOOOs, filterOOOs, getAllPeople, groupByPerson } from '../../lib/oneOnOnes';

export const metadata = { title: '1-on-1s — Dashboard' };

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default async function OOOPage({ searchParams }) {
  const sp = await searchParams;
  const from   = sp?.from   || '';
  const to     = sp?.to     || '';
  const person = sp?.person || '';

  const allOOOs = await getAllOOOs();
  const filtered = filterOOOs(allOOOs, { from, to, person });
  const allPeople = getAllPeople(allOOOs);
  const groups = groupByPerson(filtered);

  const today = new Date().toLocaleDateString('en-CA');
  const filters = { from, to, person };
  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <div className="db-content ooo-page">

      <div className="db-page-header">
        <div className="db-page-tag">1-on-1s</div>
        <h1 className="db-page-title">1-on-1 Notes</h1>
        <p className="db-page-sub">Log meetings, capture feedback, track action items.</p>
      </div>

      <OOOForm today={today} />

      <div className="ooo-list-section">
        <div className="ooo-list-header">
          <span className="ooo-count">
            {filtered.length} meeting{filtered.length !== 1 ? 's' : ''}
            {hasActiveFilters ? ' (filtered)' : ''}
          </span>
          <OOOFilters filters={filters} allPeople={allPeople} />
        </div>

        {filtered.length === 0 ? (
          <div className="wins-empty">
            <p>{hasActiveFilters ? 'No meetings match these filters.' : 'No meetings logged yet.'}</p>
          </div>
        ) : (
          <div className="ooo-groups">
            {groups.map(({ person_name, entries }) => (
              <div key={person_name} className="ooo-group">
                <div className="ooo-group-header">
                  <span className="ooo-group-name">{person_name}</span>
                  <span className="ooo-group-count">
                    {entries.length} meeting{entries.length !== 1 ? 's' : ''}
                  </span>
                  {entries[0]?.person_role && (
                    <span className="ooo-group-role">{entries[0].person_role}</span>
                  )}
                </div>
                <div className="ooo-cards">
                  {entries.map((ooo) => (
                    <OOOCard key={ooo.id} ooo={ooo} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
