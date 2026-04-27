import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const TTL = 4 * 60 * 60 * 1000; // 4 hours

const QUERIES = [
  'artificial intelligence',
  'SaaS enterprise software',
  'construction technology',
  'product management',
  'startups venture capital',
];

// Ordered by quality — index 0 is highest priority when deduplicating
const TIER1_SOURCES = [
  'reuters', 'bloomberg', 'financial times', 'wall street journal', 'wsj',
  'the economist', 'mit technology review', 'ieee spectrum',
  'new york times', 'nytimes', 'the information',
  'techcrunch', 'ars technica', 'the verge', 'wired',
  'venturebeat', 'axios', 'semafor',
  'fast company', 'fortune', 'forbes', 'inc.',
  'cnbc', 'business insider', 'engadget', 'zdnet', 'cnet',
  'hacker news', 'product hunt', 'y combinator', 'a16z', 'sequoia',
  'mit news', 'nature', 'science',
];

// Returns 0 (highest) … Infinity (unknown). Lower = better source.
function sourceRank(sourceName) {
  if (!sourceName) return Infinity;
  const lower = sourceName.toLowerCase();
  const idx = TIER1_SOURCES.findIndex((s) => lower.includes(s));
  return idx === -1 ? Infinity : idx;
}

function isAllowedSource(sourceName) {
  return sourceRank(sourceName) < Infinity;
}

// ── Deduplication ─────────────────────────────────────────────────────────────

function normaliseTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')  // strip punctuation
    .replace(/\s+/g, ' ')
    .trim();
}

function titleWords(title) {
  // Filter out very common stop-words so they don't inflate similarity
  const STOPS = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'as',
    'it', 'its', 'this', 'that', 'will', 'has', 'have', 'had', 's',
  ]);
  return normaliseTitle(title)
    .split(' ')
    .filter((w) => w.length > 1 && !STOPS.has(w));
}

// Returns true when two titles are 80%+ similar:
//   1. One title (normalised) contains the other as a substring, OR
//   2. ≥ 80% of the shorter title's words appear in the longer title's word set
function areDuplicates(a, b) {
  const na = normaliseTitle(a);
  const nb = normaliseTitle(b);

  // Substring check
  if (na.includes(nb) || nb.includes(na)) return true;

  // Word-overlap check
  const wa = titleWords(a);
  const wb = titleWords(b);
  if (wa.length === 0 || wb.length === 0) return false;

  const [shorter, longer] = wa.length <= wb.length ? [wa, wb] : [wb, wa];
  const longerSet = new Set(longer);
  const overlap = shorter.filter((w) => longerSet.has(w)).length;
  return overlap / shorter.length >= 0.8;
}

// Deduplicate a list: for each cluster of near-duplicates, keep the one
// from the highest-ranked source (lowest sourceRank index).
function deduplicate(articles) {
  const kept = [];

  for (const candidate of articles) {
    const dupIdx = kept.findIndex((k) => areDuplicates(candidate.title, k.title));

    if (dupIdx === -1) {
      // No duplicate — add it
      kept.push(candidate);
    } else {
      // Duplicate found — keep whichever has the better source
      if (sourceRank(candidate.source) < sourceRank(kept[dupIdx].source)) {
        kept[dupIdx] = candidate;
      }
      // else keep existing (it's already the better source)
    }
  }

  return kept;
}

// Module-level cache
let cachedArticles = null;
let cacheExpiry    = 0;
let queryIndex     = 0;

export async function GET(request) {
  const force = new URL(request.url).searchParams.get('force') === '1';
  const now   = Date.now();

  if (!force && cachedArticles && now < cacheExpiry) {
    return NextResponse.json({ articles: cachedArticles, cached: true });
  }

  const key = process.env.GNEWS_API_KEY;
  if (!key) {
    return NextResponse.json({ error: 'GNEWS_API_KEY not configured' }, { status: 500 });
  }

  const query = QUERIES[queryIndex % QUERIES.length];
  queryIndex  = (queryIndex + 1) % QUERIES.length;

  try {
    // Fetch 10 so dedup + source filter still leave us with 5
    const params = new URLSearchParams({
      q:       query,
      lang:    'en',
      country: 'us',
      max:     '10',
      sortby:  'publishedAt',
      token:   key,
    });
    const res = await fetch(`https://gnews.io/api/v4/search?${params}`, { cache: 'no-store' });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const msg  = body?.errors?.[0] ?? `GNews responded with ${res.status}`;
      if (cachedArticles) return NextResponse.json({ articles: cachedArticles, cached: true, stale: true });
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    const data = await res.json();

    const all = (data.articles ?? []).map((a) => ({
      title:       a.title,
      url:         a.url,
      source:      a.source?.name ?? '',
      publishedAt: a.publishedAt,
    }));

    // 1. Deduplicate across all results first
    const deduped = deduplicate(all);

    // 2. Prefer tier-1 sources; fall back to full deduped list if too few pass
    const filtered = deduped.filter((a) => isAllowedSource(a.source));
    const articles  = (filtered.length >= 3 ? filtered : deduped).slice(0, 5);

    cachedArticles = articles;
    cacheExpiry    = now + TTL;

    return NextResponse.json({ articles, cached: false, query });
  } catch (err) {
    if (cachedArticles) return NextResponse.json({ articles: cachedArticles, cached: true, stale: true });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
