/**
 * Migrates existing markdown wins from /content/wins/ into the Supabase wins table.
 * Run once after creating the tables:
 *   node scripts/migrate-wins.mjs
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// ── Load .env.local ──────────────────────────────────────────
const envRaw = readFileSync(join(root, '.env.local'), 'utf8');
const env = Object.fromEntries(
  envRaw.split('\n')
    .filter((l) => l.trim() && !l.startsWith('#'))
    .map((l) => {
      const eq = l.indexOf('=');
      return [l.slice(0, eq).trim(), l.slice(eq + 1).trim()];
    })
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

// ── Parse frontmatter ────────────────────────────────────────
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

function splitImpact(impact) {
  if (!impact) return { impact_metric_type: null, impact_metric_value: null };
  const colonIdx = impact.indexOf(': ');
  if (colonIdx === -1) return { impact_metric_type: 'Custom', impact_metric_value: impact };
  return { impact_metric_type: impact.slice(0, colonIdx), impact_metric_value: impact.slice(colonIdx + 2) };
}

// ── Read markdown files ──────────────────────────────────────
const winsDir = join(root, 'content', 'wins');
let files;
try {
  files = readdirSync(winsDir).filter((f) => f.endsWith('.md'));
} catch {
  console.log('No content/wins directory found — nothing to migrate.');
  process.exit(0);
}

if (files.length === 0) {
  console.log('No markdown wins found — nothing to migrate.');
  process.exit(0);
}

console.log(`Found ${files.length} markdown win(s) to migrate...\n`);

// ── Verify tables exist ──────────────────────────────────────
const { error: tableCheck } = await supabase.from('wins').select('id').limit(1);
if (tableCheck?.code === 'PGRST205') {
  console.error('❌  The wins table does not exist yet.');
  console.error('   Run the SQL in supabase/schema.sql in the Supabase SQL editor first:');
  console.error('   https://supabase.com/dashboard/project/yzgfpteoyyubfmmlixbz/sql/new\n');
  process.exit(1);
}

// ── Migrate ──────────────────────────────────────────────────
let inserted = 0;
let skipped  = 0;

for (const filename of files) {
  const raw = readFileSync(join(winsDir, filename), 'utf8');
  const { data, body } = parseFrontmatter(raw);
  const description = body.trim();
  if (!description) { console.log(`  skip ${filename} — empty description`); skipped++; continue; }

  const tags = data.tags
    ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  const { impact_metric_type, impact_metric_value } = splitImpact(data.impact || '');

  const row = {
    date:                data.date        || null,
    category:            data.category    || null,
    visibility:          data.visibility  || null,
    description,
    tags,
    impact_metric_type:  impact_metric_type  || null,
    impact_metric_value: impact_metric_value || null,
  };

  const { error } = await supabase.from('wins').insert(row);
  if (error) {
    console.error(`  ❌  ${filename}: ${error.message}`);
    skipped++;
  } else {
    console.log(`  ✓  ${filename}`);
    inserted++;
  }
}

console.log(`\nDone — ${inserted} inserted, ${skipped} skipped.`);
