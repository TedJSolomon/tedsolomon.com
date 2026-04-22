import { notFound } from 'next/navigation';
import { getShareByToken, getCategoryColor, WL_PRIORITY_COLORS } from '../../lib/wishlist';

export async function generateMetadata({ params }) {
  const { share_token } = await params;
  const result = await getShareByToken(share_token);
  if (!result) return { title: 'Wishlist' };
  return { title: `${result.share.title} — Wishlist` };
}

function formatPrice(price) {
  if (price == null) return null;
  return `$${Number(price).toFixed(2)}`;
}

function PublicItemCard({ item }) {
  const catColor = getCategoryColor(item.category);
  const priColor = WL_PRIORITY_COLORS[item.priority] || WL_PRIORITY_COLORS.Want;
  const price    = formatPrice(item.price);

  return (
    <div className={`wl-pub-card${item.purchased ? ' wl-pub-purchased' : ''}`}>
      <div className="wl-pub-image-wrap">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image_url} alt={item.name} className="wl-pub-image" />
        ) : (
          <div className="wl-pub-image wl-pub-placeholder">
            <span>{item.name.charAt(0).toUpperCase()}</span>
          </div>
        )}
        {item.purchased && (
          <div className="wl-pub-purchased-badge">Purchased</div>
        )}
      </div>

      <div className="wl-pub-body">
        <div className="wl-pub-badges">
          <span
            className="wl-badge wl-cat-badge"
            style={{ background: `rgba(${catColor.rgb},0.14)`, color: catColor.bg }}
          >
            {item.category}
          </span>
          <span
            className="wl-badge wl-pri-badge"
            style={{ background: `rgba(${priColor.rgb},0.14)`, color: priColor.bg }}
          >
            {item.priority}
          </span>
        </div>

        <h3 className={`wl-pub-name${item.purchased ? ' wl-pub-struck' : ''}`}>{item.name}</h3>

        {price && <div className="wl-pub-price">{price}</div>}

        {item.description && (
          <p className="wl-pub-desc">{item.description}</p>
        )}
      </div>

      {item.url && !item.purchased && (
        <div className="wl-pub-footer">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="wl-pub-buy-btn"
          >
            Buy This →
          </a>
        </div>
      )}
    </div>
  );
}

export default async function PublicWishlistPage({ params }) {
  const { share_token } = await params;
  const result = await getShareByToken(share_token);
  if (!result) notFound();

  const { share, items } = result;
  const unpurchased = items.filter((i) => !i.purchased);
  const purchased   = items.filter((i) =>  i.purchased);

  return (
    <div className="wl-pub-page">
      <header className="wl-pub-header">
        <a href="/" className="wl-pub-logo">ted<span>.</span></a>
        <div className="wl-pub-title-block">
          <div className="wl-pub-eyebrow">Wishlist</div>
          <h1 className="wl-pub-title">{share.title}</h1>
          <p className="wl-pub-sub">{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>
      </header>

      <main className="wl-pub-main">
        {items.length === 0 ? (
          <p className="wl-pub-empty">This wishlist is empty.</p>
        ) : (
          <>
            {unpurchased.length > 0 && (
              <div className="wl-pub-grid">
                {unpurchased.map((item) => (
                  <PublicItemCard key={item.id} item={item} />
                ))}
              </div>
            )}

            {purchased.length > 0 && (
              <div className="wl-pub-purchased-section">
                <div className="wl-pub-section-label">Already Purchased</div>
                <div className="wl-pub-grid wl-pub-grid-purchased">
                  {purchased.map((item) => (
                    <PublicItemCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="wl-pub-footer-bar">
        <a href="/" className="wl-pub-footer-link">tedsolomon.com</a>
      </footer>
    </div>
  );
}
