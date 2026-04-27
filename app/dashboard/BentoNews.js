'use client';

import { useState, useEffect, useCallback } from 'react';

function timeAgo(isoStr) {
  if (!isoStr) return '';
  const diff    = Date.now() - new Date(isoStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1)  return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)   return `${hours}h ago`;
  const days  = Math.floor(hours / 24);
  return `${days}d ago`;
}

function SkeletonRow() {
  return (
    <div className="bento-news-row bento-news-skeleton" aria-hidden="true">
      <div className="bento-news-skel-title" />
      <div className="bento-news-skel-title bento-news-skel-title--short" />
      <div className="bento-news-skel-meta" />
    </div>
  );
}

export default function BentoNews() {
  const [articles, setArticles] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const load = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`/api/news${force ? '?force=1' : ''}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to load news');
      setArticles(data.articles ?? []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="bento-card bento-news">
      <div className="bento-card-header">
        <span className="bento-card-label">News</span>
        <button
          className="bento-news-refresh"
          onClick={() => load(true)}
          disabled={loading}
          title="Refresh headlines"
          aria-label="Refresh news"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true"
            style={{ animation: loading ? 'bento-news-spin 0.7s linear infinite' : 'none' }}
          >
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
        </button>
      </div>

      {error ? (
        <p className="bento-empty bento-error">{error}</p>
      ) : (
        <div className="bento-news-articles">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            : articles.map((a, i) => (
                <a
                  key={i}
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bento-news-row"
                >
                  <span className="bento-news-row-title">{a.title}</span>
                  <span className="bento-news-meta">
                    <span className="bento-news-source">{a.source}</span>
                    <span className="bento-news-dot" aria-hidden="true">·</span>
                    <span className="bento-news-time">{timeAgo(a.publishedAt)}</span>
                  </span>
                </a>
              ))
          }
        </div>
      )}
    </div>
  );
}
