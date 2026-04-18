import fs from 'fs';
import path from 'path';

export const WINS_DIR = path.join(process.cwd(), 'content/wins');

export function ensureWinsDir() {
  if (!fs.existsSync(WINS_DIR)) fs.mkdirSync(WINS_DIR, { recursive: true });
}

// Minimal frontmatter parser — handles simple key: value lines
function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: raw.trim() };
  const data = {};
  for (const line of match[1].split('\n')) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const val = line.slice(colon + 1).trim();
    if (key) data[key] = val;
  }
  return { data, body: match[2].trim() };
}

export function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 40)
    .replace(/-+$/, '') || 'win';
}

export function getAllWins() {
  ensureWinsDir();
  const files = fs
    .readdirSync(WINS_DIR)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .reverse(); // YYYY-MM-DD prefix → newest first

  return files.map((filename) => {
    const raw = fs.readFileSync(path.join(WINS_DIR, filename), 'utf8');
    const { data, body } = parseFrontmatter(raw);
    return {
      filename,
      date: data.date || '',
      category: data.category || '',
      tags: data.tags
        ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
      visibility: data.visibility || '',
      impact: data.impact || '',
      description: body,
    };
  });
}

export function filterWins(wins, { from, to, category, visibility, tag } = {}) {
  return wins.filter((w) => {
    if (from && w.date < from) return false;
    if (to && w.date > to) return false;
    if (category && w.category !== category) return false;
    if (visibility && w.visibility !== visibility) return false;
    if (tag && !w.tags.includes(tag)) return false;
    return true;
  });
}

// Collect every unique tag across all wins
export function getAllTags(wins) {
  const set = new Set();
  wins.forEach((w) => w.tags.forEach((t) => set.add(t)));
  return [...set].sort();
}

// { shipped: 2, learned: 1, ... }
export function getCategoryCounts(wins) {
  const counts = {};
  wins.forEach((w) => {
    if (w.category) counts[w.category] = (counts[w.category] || 0) + 1;
  });
  return counts;
}

// [{ tag: 'api', count: 3 }, ...] sorted desc, top N
export function getTopTagCounts(wins, n = 10) {
  const counts = {};
  wins.forEach((w) => w.tags.forEach((t) => { counts[t] = (counts[t] || 0) + 1; }));
  return Object.entries(counts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}

// { 'Time Saved': 2, 'Revenue Impact': 1, ... } — only types actually used
export function getImpactTypeCounts(wins) {
  const counts = {};
  wins.forEach((w) => {
    if (!w.impact) return;
    const colonIdx = w.impact.indexOf(': ');
    const type = colonIdx === -1 ? 'Custom' : w.impact.slice(0, colonIdx);
    counts[type] = (counts[type] || 0) + 1;
  });
  return counts;
}
