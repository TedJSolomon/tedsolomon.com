'use client';

import { useState, useTransition } from 'react';
import { importJobs } from '../actions';

// ── Theme ────────────────────────────────────────────────────────────────────
const AMBER     = '#e8a838';
const BORDER    = 'rgba(232, 168, 56, 0.15)';
const TEXT      = '#f5f3ef';
const DIM       = '#7a7870';
const CARD      = 'rgba(19, 22, 29, 0.85)';
const RED       = '#e85858';
const GREEN     = '#4ade80';
const RED_ROW   = 'rgba(232, 88, 88, 0.08)';
const GREEN_ROW = 'rgba(74, 222, 128, 0.05)';

// ── CSV low-level helpers ─────────────────────────────────────────────────────

function parseCSVLine(line) {
  const fields = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (ch === ',' && !inQ) {
      fields.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  fields.push(cur.trim());
  return fields;
}

function parseMoney(str) {
  if (!str) return 0;
  const s = str.replace(/\$/g, '').replace(/,/g, '').trim();
  if (s === '-' || s === '' || s.toLowerCase() === 'n/a') return 0;
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

function parseDate(str) {
  const s = (str || '').trim();
  const parts = s.split('/');
  if (parts.length !== 3) return null;
  const m = parseInt(parts[0], 10);
  const d = parseInt(parts[1], 10);
  let y   = parseInt(parts[2], 10);
  if (isNaN(m) || isNaN(d) || isNaN(y)) return null;
  if (y < 100) y += 2000;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function calcPay(row) {
  if (row.job_type === 'bust') return Number(row.bust_rate);
  const rate = Number(row.per_page_rate) - (row.proofreading ? Number(row.proofreading_rate) : 0);
  return Number(row.pages) * rate + Number(row.per_diem) * Number(row.per_diem_multiplier);
}

// ── Header-driven CSV parser ──────────────────────────────────────────────────

// Canonical name → normalised header strings to match against
const COL_ALIASES = {
  date:           ['date'],
  didTheJobGo:    ['did the job go'],
  pages:          ['pages'],
  proof:          ['proof?', 'proof'],
  rate:           ['rate'],
  magsRate:       ['mags rate'],
  appearanceFees: ['appearance fees'],
  fee:            ['fee'],
  takeHomeTotal:  ['take home total'],
};

const REQUIRED_COLS = ['date', 'didTheJobGo', 'pages', 'rate', 'magsRate', 'appearanceFees', 'fee', 'takeHomeTotal'];

function buildColMap(rawHeaders) {
  // Normalise: trim + collapse whitespace + lowercase
  const normalised = rawHeaders.map(h => h.trim().replace(/\s+/g, ' ').toLowerCase());

  const map = {};
  for (const [key, aliases] of Object.entries(COL_ALIASES)) {
    const idx = normalised.findIndex(h => aliases.includes(h));
    map[key] = idx >= 0 ? idx : null;
  }
  return map;
}

function parseCSV(text) {
  // Strip UTF-8 BOM if present
  const raw = text.startsWith('﻿') ? text.slice(1) : text;

  const lines = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    .split('\n')
    .filter(l => l.trim());

  if (lines.length < 2) {
    return { rows: [], layout: null, colMap: null, headerFields: null, error: 'File appears empty or has no data rows.' };
  }

  const headerFields = parseCSVLine(lines[0]);
  const colMap = buildColMap(headerFields);

  // Check required columns are present
  const missing = REQUIRED_COLS.filter(k => colMap[k] === null);
  if (missing.length > 0) {
    const friendly = { date:'Date', didTheJobGo:'Did the Job Go', pages:'Pages', rate:'Rate',
      magsRate:'Mags Rate', appearanceFees:'Appearance Fees', fee:'Fee', takeHomeTotal:'Take Home Total' };
    return {
      rows: [], layout: null, colMap: null, headerFields,
      error: `Missing required column${missing.length > 1 ? 's' : ''}: ${missing.map(k => friendly[k] || k).join(', ')}`,
    };
  }

  const hasProofCol = colMap.proof !== null;
  const layout = hasProofCol ? 'A' : 'B';

  function get(f, key) {
    const idx = colMap[key];
    return idx !== null && idx < f.length ? (f[idx] || '').trim() : '';
  }

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const f = parseCSVLine(lines[i]);
    // Skip rows that are entirely blank
    if (f.every(cell => !cell)) continue;

    const job_type         = get(f, 'didTheJobGo').toLowerCase() === 'yes' ? 'normal' : 'bust';
    const pagesRaw         = get(f, 'pages');
    const pages            = job_type === 'bust' ? 0 : Math.round(parseMoney(pagesRaw));
    const csv_total        = parseMoney(get(f, 'takeHomeTotal'));
    const bust_rate        = job_type === 'bust' ? csv_total : 85;
    const proofreading_rate = parseMoney(get(f, 'magsRate'));
    const proofreading     = hasProofCol
      ? get(f, 'proof').toLowerCase() === 'yes'
      : proofreading_rate > 0;

    const row = {
      date:                parseDate(get(f, 'date')),
      job_type,
      pages,
      per_page_rate:       parseMoney(get(f, 'rate')),
      proofreading,
      proofreading_rate,
      per_diem:            parseMoney(get(f, 'fee')),
      per_diem_multiplier: Math.max(1, parseInt(get(f, 'appearanceFees'), 10) || 1),
      bust_rate,
      csv_total,
    };

    row.computed_total = calcPay(row);
    row.match = Math.abs(row.computed_total - csv_total) < 0.005;
    rows.push(row);
  }

  if (rows.length === 0) {
    return { rows: [], layout, colMap, headerFields, error: 'No valid rows found after the header.' };
  }

  return { rows, layout, colMap, headerFields, error: null };
}

// ── Styles ────────────────────────────────────────────────────────────────────

const monoSm = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.7rem',
  letterSpacing: '0.08em',
};

const th = {
  ...monoSm,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color: DIM,
  padding: '0.5rem 0.75rem',
  textAlign: 'left',
  whiteSpace: 'nowrap',
  borderBottom: `1px solid ${BORDER}`,
  background: 'rgba(8,10,14,0.6)',
  fontWeight: 600,
  position: 'sticky',
  top: 0,
  zIndex: 1,
};

function td(extra = {}) {
  return {
    padding: '0.45rem 0.75rem',
    fontSize: '0.82rem',
    color: TEXT,
    borderBottom: `1px solid rgba(232,168,56,0.07)`,
    whiteSpace: 'nowrap',
    ...extra,
  };
}

// ── Layout info banner ────────────────────────────────────────────────────────

function LayoutBanner({ layout, colMap, headerFields }) {
  const isA = layout === 'A';

  // Build a human-readable column mapping list (1-indexed)
  const LABELS = {
    date: 'Date', didTheJobGo: 'Did the Job Go', pages: 'Pages',
    proof: 'Proof?', rate: 'Rate', magsRate: 'Mags Rate',
    appearanceFees: 'Appearance Fees', fee: 'Fee', takeHomeTotal: 'Take Home Total',
  };
  const mappingParts = Object.entries(LABELS)
    .filter(([key]) => colMap[key] !== null)
    .map(([key, label]) => `${label} → col ${colMap[key] + 1}`);

  return (
    <div style={{
      background: 'rgba(8,10,14,0.5)',
      border: `1px solid ${BORDER}`,
      borderRadius: 8,
      padding: '0.75rem 1rem',
      marginBottom: '1rem',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.75rem',
      alignItems: 'flex-start',
    }}>
      {/* Layout badge */}
      <div style={{ flexShrink: 0 }}>
        <span style={{
          ...monoSm,
          display: 'inline-block',
          padding: '0.2rem 0.6rem',
          borderRadius: 4,
          background: isA ? 'rgba(232,168,56,0.12)' : 'rgba(74,222,128,0.08)',
          color: isA ? AMBER : GREEN,
          border: `1px solid ${isA ? 'rgba(232,168,56,0.25)' : 'rgba(74,222,128,0.2)'}`,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}>
          Layout {layout}
        </span>
        <div style={{ ...monoSm, color: DIM, marginTop: '0.35rem', fontSize: '0.68rem' }}>
          {isA
            ? '2025 format — Proof? column present'
            : '2023/2024 format — no Proof? column; proofreading inferred from Mags Rate > 0'}
        </div>
      </div>

      {/* Column mapping */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...monoSm, color: DIM, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.3rem' }}>
          Column mapping
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem 0.6rem' }}>
          {mappingParts.map(part => (
            <span key={part} style={{ ...monoSm, fontSize: '0.72rem', color: TEXT, whiteSpace: 'nowrap' }}>
              {part}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ImportClient() {
  const [rows, setRows]             = useState(null);
  const [layoutMeta, setLayoutMeta] = useState(null); // { layout, colMap, headerFields }
  const [parseError, setParseError] = useState('');
  const [imported, setImported]     = useState(false);
  const [importCount, setImportCount] = useState(0);
  const [importError, setImportError] = useState('');
  const [pending, startImport]      = useTransition();

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const { rows: parsed, layout, colMap, headerFields, error } = parseCSV(ev.target.result);
      if (error) { setParseError(error); setRows(null); setLayoutMeta(null); return; }
      setParseError('');
      setRows(parsed);
      setLayoutMeta({ layout, colMap, headerFields });
      setImported(false);
      setImportError('');
    };
    reader.readAsText(file);
  }

  function handleImport() {
    if (!rows?.length) return;
    const toInsert = rows.map(({ csv_total, computed_total, match, ...rest }) => rest);
    startImport(async () => {
      const result = await importJobs(toInsert);
      if (result?.error) { setImportError(result.error); }
      else { setImported(true); setImportCount(result.count); }
    });
  }

  const matchCount    = rows ? rows.filter(r => r.match).length : 0;
  const mismatchCount = rows ? rows.length - matchCount : 0;

  // ── Success ──────────────────────────────────────────────────────────────
  if (imported) {
    return (
      <div style={{ maxWidth: 520 }}>
        <div style={{
          background: 'rgba(74,222,128,0.07)',
          border: '1px solid rgba(74,222,128,0.25)',
          borderRadius: 10,
          padding: '2rem',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>✓</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 600, color: GREEN, marginBottom: '0.4rem' }}>
            {importCount} job{importCount !== 1 ? 's' : ''} imported
          </div>
          <div style={{ fontSize: '0.88rem', color: DIM, marginBottom: '1.5rem' }}>
            All rows have been added to the transcription log.
          </div>
          <a
            href="/dashboard/transcription"
            style={{
              display: 'inline-block',
              padding: '0.6rem 1.4rem',
              background: AMBER,
              color: '#0a0b0e',
              borderRadius: 7,
              fontWeight: 700,
              fontSize: '0.88rem',
              textDecoration: 'none',
            }}
          >
            View all jobs →
          </a>
        </div>
      </div>
    );
  }

  // ── Upload ────────────────────────────────────────────────────────────────
  if (!rows) {
    return (
      <div style={{ maxWidth: 520 }}>
        <label style={{
          display: 'block',
          border: `2px dashed ${BORDER}`,
          borderRadius: 10,
          padding: '3rem 2rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: CARD,
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem', color: AMBER }}>↑</div>
          <div style={{ fontSize: '1rem', color: TEXT, marginBottom: '0.4rem', fontWeight: 500 }}>
            Choose a CSV file
          </div>
          <div style={{ fontSize: '0.82rem', color: DIM, lineHeight: 1.6 }}>
            Layout A (2025): Date, Did the Job Go, Pages, Proof?, Rate, Mags Rate,<br />
            Appearance Fees, Fee, Pre Mags Total, Take Home Total<br />
            <br />
            Layout B (2023/2024): same, without the Proof? column
          </div>
          <input type="file" accept=".csv,text/csv" onChange={handleFile} style={{ display: 'none' }} />
        </label>
        {parseError && (
          <p style={{ color: RED, fontSize: '0.85rem', marginTop: '1rem' }}>{parseError}</p>
        )}
      </div>
    );
  }

  // ── Preview ───────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Layout detection banner */}
      {layoutMeta && (
        <LayoutBanner
          layout={layoutMeta.layout}
          colMap={layoutMeta.colMap}
          headerFields={layoutMeta.headerFields}
        />
      )}

      {/* Stats + action bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        marginBottom: '1rem',
        flexWrap: 'wrap',
      }}>
        <div style={{ ...monoSm, fontSize: '0.82rem', color: DIM }}>
          {rows.length} rows parsed
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: GREEN, display: 'inline-block' }} />
          <span style={{ fontSize: '0.82rem', color: GREEN }}>{matchCount} match</span>
        </div>
        {mismatchCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: RED, display: 'inline-block' }} />
            <span style={{ fontSize: '0.82rem', color: RED }}>{mismatchCount} mismatch</span>
          </div>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => { setRows(null); setLayoutMeta(null); }}
            style={{
              background: 'none',
              border: `1px solid ${BORDER}`,
              borderRadius: 6,
              color: DIM,
              fontSize: '0.78rem',
              padding: '0.35rem 0.75rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            ← New file
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={pending}
            style={{
              padding: '0.5rem 1.25rem',
              background: AMBER,
              color: '#0a0b0e',
              border: 'none',
              borderRadius: 7,
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: pending ? 'not-allowed' : 'pointer',
              opacity: pending ? 0.7 : 1,
              fontFamily: 'inherit',
            }}
          >
            {pending ? 'Importing…' : `Confirm and Import ${rows.length} rows →`}
          </button>
        </div>
      </div>

      {importError && (
        <p style={{ color: RED, fontSize: '0.85rem', marginBottom: '1rem' }}>{importError}</p>
      )}

      {/* Preview table */}
      <div style={{ overflowX: 'auto', borderRadius: 8, border: `1px solid ${BORDER}` }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 860 }}>
          <thead>
            <tr>
              {['Date','Type','Pages','Proof','Rate','Proof $','Per Diem','×','Computed','CSV Total','✓'].map(h => (
                <th key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{ background: row.match ? GREEN_ROW : RED_ROW }}>
                <td style={td()}>{row.date ?? <span style={{ color: RED }}>invalid</span>}</td>
                <td style={td()}>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.15rem 0.45rem',
                    borderRadius: 4,
                    fontSize: '0.72rem',
                    fontFamily: "'JetBrains Mono', monospace",
                    background: row.job_type === 'bust' ? 'rgba(232,88,88,0.15)' : 'rgba(232,168,56,0.12)',
                    color: row.job_type === 'bust' ? RED : AMBER,
                  }}>
                    {row.job_type === 'bust' ? 'Bust' : 'Went'}
                  </span>
                </td>
                <td style={td({ color: row.job_type === 'bust' ? DIM : TEXT })}>
                  {row.job_type === 'bust' ? '—' : row.pages}
                </td>
                <td style={td({ color: row.proofreading ? TEXT : DIM })}>
                  {row.proofreading ? 'Yes' : 'No'}
                </td>
                <td style={td({ color: DIM })}>${row.per_page_rate.toFixed(2)}</td>
                <td style={td({ color: DIM })}>
                  {row.proofreading ? `$${row.proofreading_rate.toFixed(2)}` : '—'}
                </td>
                <td style={td({ color: DIM })}>
                  {row.per_diem > 0 ? `$${row.per_diem.toFixed(2)}` : '—'}
                </td>
                <td style={td({ color: DIM })}>{row.per_diem_multiplier}×</td>
                <td style={td({ fontWeight: 600, color: AMBER })}>${row.computed_total.toFixed(2)}</td>
                <td style={td({ color: DIM })}>${row.csv_total.toFixed(2)}</td>
                <td style={td({ textAlign: 'center', fontSize: '1rem' })}>
                  {row.match
                    ? <span style={{ color: GREEN }}>✓</span>
                    : <span style={{ color: RED }} title={`Diff: $${Math.abs(row.computed_total - row.csv_total).toFixed(2)}`}>✗</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mismatchCount > 0 && (
        <p style={{ fontSize: '0.78rem', color: DIM, marginTop: '0.75rem' }}>
          Red rows will still be imported. Hover ✗ to see the dollar difference.
        </p>
      )}
    </div>
  );
}
