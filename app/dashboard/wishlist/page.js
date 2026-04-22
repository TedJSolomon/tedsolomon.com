import WishlistItemForm from './WishlistItemForm';
import WishlistFilters from './WishlistFilters';
import WishlistShareButton from './WishlistShareButton';
import WishlistSections from './WishlistSections';
import SharesList from './SharesList';
import { getAllItems, getAllShares, filterItems, sortItems, getAllCategories } from '../../lib/wishlist';

export const metadata = { title: 'Wishlist — Dashboard' };

export default async function WishlistPage({ searchParams }) {
  const sp        = await searchParams;
  const category  = sp?.category  || '';
  const priority  = sp?.priority  || '';
  const purchased = sp?.purchased || '';
  const sort      = sp?.sort      || 'date-desc';

  const [allItems, allShares] = await Promise.all([getAllItems(), getAllShares()]);

  const allCategories = getAllCategories(allItems);
  const filtered      = filterItems(allItems, { category, priority, purchased });
  const sorted        = sortItems(filtered, sort);
  const filters       = { category, priority, purchased, sort };
  const hasActive     = category || priority || purchased || (sort && sort !== 'date-desc');

  // Group sorted items by category, alphabetically
  const categoryNames = [...new Set(sorted.map((i) => i.category))].sort();

  return (
    <div className="db-content wishlist-page">

      <div className="db-page-header">
        <div className="db-page-tag">Wishlist</div>
        <h1 className="db-page-title">My Wishlist</h1>
        <p className="db-page-sub">Track what you want, share curated lists with friends and family.</p>
      </div>

      <div className="wl-toolbar">
        <WishlistItemForm allCategories={allCategories} />
        <WishlistFilters filters={filters} allCategories={allCategories} />
        <WishlistShareButton allItems={allItems} />
      </div>

      <div className="wl-list-header">
        <span className="ooo-count">
          {sorted.length} item{sorted.length !== 1 ? 's' : ''}
          {hasActive ? ' (filtered)' : ''}
        </span>
      </div>

      {sorted.length === 0 ? (
        <div className="wins-empty">
          <p>{hasActive ? 'No items match these filters.' : 'Your wishlist is empty. Add your first item!'}</p>
        </div>
      ) : (
        <WishlistSections
          sortedItems={sorted}
          allCategories={allCategories}
          categoryNames={categoryNames}
        />
      )}

      {allShares.length > 0 && (
        <SharesList shares={allShares} />
      )}

    </div>
  );
}
