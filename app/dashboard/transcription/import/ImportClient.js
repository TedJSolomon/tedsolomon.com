'use client';

import { useState, useTransition } from 'react';
import { importJobs } from '../actions';

// ── Theme ────────────────────────────────────────────────────────────────────
const AMBER      = '#e8a838';
const BORDER     = 'rgba(232, 168, 56, 0.15)';
const TEXT       = '#f5f3ef';
const DIM        = '#7a7870';
const CARD       = 'rgba(19, 22, 29, 0.85)';
const RED        = '#e85858';
const GREEN      = '#4ade80';
const RED_ROW    = 'rgba(232, 88, 88, 0.08)';
const GREEN_ROW  = 'rgba(74, 222, 128, 0.05)';

// ── CSV helpers ───────────────────────────────────────────────────────────────

function parseCSVLine(line) {
  const fields = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      // doubled quote inside quoted field → literal quote
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
  let y = parseInt(parts[2], 10);
  if (isNaN(m) || isNaN(d) || isNaN(y)) return null;
  if (y < 100) y += 2000;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function calcPay(row) {
  if (row.job_type === 'bust') return Number(row.bust_rate);
  const rate = Number(row.per_page_rate) - (row.proofreading ? Number(row.proofreading_rate) : 0);
  return Number(row.pages) * rate + Number(row.per_diem) * Number(row.per_diem_multiplier);
}

function parseCSV(text) {
  // Normalise line endings, drop blank lines
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim());
  if (lines.length < 2) return { rows: [], error: 'File appears empty or has no data rows.' };

  // Skip header (line 0)
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const f = parseCSVLine(lines[i]);
    if (f.length < 10) continue; // skip short/blank rows

    // Column indices:
    // 0 Date | 1 Did the Job Go | 2 Pages | 3 Proof? | 4 Rate | 5 Mags Rate
    // 6 Appearance Fees | 7 Fee | 8 Pre Mags Total | 9 Take Home Total

    const job_type  = (f[1] || '').trim().toLowerCase() === 'yes' ? 'normal' : 'bust';
    const pages     = job_type === 'bust' ? 0 : (parseInt((f[2] || '').replace(/[^0-9]/g, ''), 10) || 0);
    const csv_total = parseMoney(f[9]);
    const bust_rate = job_type === 'bust' ? csv_total : 85;

    const row = {
      date:                parseDate(f[0]),
      job_type,
      pages,
      per_page_rate:       parseMoney(f[4]),
      proofreading:        (f[3] || '').trim().toLowerCase() === 'yes',
      proofreading_rate:   parseMoney(f[5]),
      per_diem:            parseMoney(f[7]),
      per_diem_multiplier: Math.max(1, parseInt((f[6] || '1').trim(), 10) || 1),
      bust_rate,
      // validation-only (stripped before insert)
      csv_total,
    };

    row.computed_total = calcPay(row);
    row.match = Math.abs(row.computed_total - csv_total) < 0.005;
    rows.push(row);
  }

  if (rows.length === 0) return { rows: [], error: 'No valid rows found after the header.' };
  return { rows, error: null };
}

// ── Styles ────────────────────────────────────────────────────────────────────

const monoLabel = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.7rem',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color: DIM,
};

const th = {
  ...monoLabel,
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

// ── Main component ────────────────────────────────────────────────────────────

export default function ImportClient() {
  const [rows, setRows]         = useState(null);
  const [parseError, setParseError] = useState('');
  const [imported, setImported] = useState(false);
  const [importCount, setImportCount] = useState(0);
  const [importError, setImportError] = useState('');
  const [pending, startImport]  = useTransition();

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const { rows: parsed, error } = parseCSV(ev.target.result);
      if (error) { setParseError(error); setRows(null); return; }
      setParseError('');
      setRows(parsed);
      setImported(false);
      setImportError('');
    };
    reader.readAsText(file);
  }

  function handleImport() {
    if (!rows?.length) return;
    // Strip validation-only fields before inserting
    const toInsert = rows.map(({ csv_total, computed_total, match, ...rest }) => rest);
    startImport(async () => {
      const result = await importJobs(toInsert);
      if (result?.error) { setImportError(result.error); }
      else { setImported(true); setImportCount(result.count); }
    });
  }

  const matchCount    = rows ? rows.filter(r => r.match).length : 0;
  const mismatchCount = rows ? rows.length - matchCount : 0;

  // ── Success state ────────────────────────────────────────────────────────
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

  // ── Upload state (no rows yet) ────────────────────────────────────────────
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
          transition: 'border-color 0.2s',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem', color: AMBER }}>↑</div>
          <div style={{ fontSize: '1rem', color: TEXT, marginBottom: '0.4rem', fontWeight: 500 }}>
            Choose a CSV file
          </div>
          <div style={{ fontSize: '0.82rem', color: DIM }}>
            Expected columns: Date, Did the Job Go, Pages, Proof?,<br />
            Rate, Mags Rate, Appearance Fees, Fee, Pre Mags Total, Take Home Total
          </div>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFile}
            style={{ display: 'none' }}
          />
        </label>

        {parseError && (
          <p style={{ color: RED, fontSize: '0.85rem', marginTop: '1rem' }}>{parseError}</p>
        )}
      </div>
    );
  }

  // ── Preview state ─────────────────────────────────────────────────────────
  return (
    <div>
      {/* Stats bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        marginBottom: '1.25rem',
        flexWrap: 'wrap',
      }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', color: DIM }}>
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
            onClick={() => setRows(null)}
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
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 860, fontSize: '0.82rem' }}>
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
                <td style={td()}>{row.date || <span style={{ color: RED }}>invalid</span>}</td>
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
                <td style={td({ color: row.job_type === 'bust' ? DIM : TEXT })}>{row.job_type === 'bust' ? '—' : row.pages}</td>
                <td style={td({ color: row.proofreading ? TEXT : DIM })}>{row.proofreading ? 'Yes' : 'No'}</td>
                <td style={td({ color: DIM })}>${row.per_page_rate.toFixed(2)}</td>
                <td style={td({ color: DIM })}>{row.proofreading ? `$${row.proofreading_rate.toFixed(2)}` : '—'}</td>
                <td style={td({ color: DIM })}>{row.per_diem > 0 ? `$${row.per_diem.toFixed(2)}` : '—'}</td>
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
          Red rows will still be imported. Hover the ✗ to see the difference amount.
        </p>
      )}
    </div>
  );
}
