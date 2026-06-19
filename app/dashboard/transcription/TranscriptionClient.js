'use client';

import { useState, useActionState, useEffect, useTransition } from 'react';
import { addJob, updateJob, deleteJob } from './actions';

// ── Colors / constants ──────────────────────────────────────────────────────

const AMBER  = '#e8a838';
const BORDER = 'rgba(232, 168, 56, 0.15)';
const BORDER_FOCUS = 'rgba(232, 168, 56, 0.5)';
const TEXT   = '#f5f3ef';
const DIM    = '#7a7870';
const CARD   = 'rgba(19, 22, 29, 0.85)';
const RED    = '#e85858';

// ── Pay calculation (mirrors server lib) ────────────────────────────────────

function calcPay({ job_type, pages, per_page_rate, proofreading, proofreading_rate, rush, rush_rate, per_diem, per_diem_multiplier, bust_rate }) {
  if (job_type === 'bust') return Number(bust_rate);
  const rate = Number(per_page_rate) - (proofreading ? Number(proofreading_rate) : 0) + (rush ? Number(rush_rate) : 0);
  return Number(pages) * rate + Number(per_diem) * Number(per_diem_multiplier);
}

// ── Shared input style (no CSS class) ───────────────────────────────────────

function inputStyle(focused) {
  return {
    width: '100%',
    background: 'rgba(8, 10, 14, 0.7)',
    border: `1px solid ${focused ? BORDER_FOCUS : BORDER}`,
    borderRadius: '6px',
    padding: '0.5rem 0.75rem',
    color: TEXT,
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };
}

function labelStyle() {
  return {
    display: 'block',
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: DIM,
    marginBottom: '0.35rem',
    fontFamily: "'JetBrains Mono', monospace",
  };
}

// ── Focusable input wrapper ──────────────────────────────────────────────────

function FInput({ label, style: extra, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && <label style={labelStyle()}>{label}</label>}
      <input
        {...props}
        style={{ ...inputStyle(focused), ...extra }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}

// ── Toggle / segmented control ───────────────────────────────────────────────

function SegmentToggle({ value, onChange, options }) {
  return (
    <div style={{
      display: 'inline-flex',
      background: 'rgba(8, 10, 14, 0.7)',
      border: `1px solid ${BORDER}`,
      borderRadius: '8px',
      padding: '3px',
      gap: '2px',
    }}>
      {options.map(({ label, val }) => {
        const active = value === val;
        return (
          <button
            key={val}
            type="button"
            onClick={() => onChange(val)}
            style={{
              padding: '0.4rem 1.1rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: active ? 600 : 400,
              fontFamily: 'inherit',
              background: active ? AMBER : 'transparent',
              color: active ? '#0a0b0e' : DIM,
              transition: 'all 0.15s',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ── Boolean toggle ───────────────────────────────────────────────────────────

function BoolToggle({ value, onChange, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
      <button
        type="button"
        onClick={() => onChange(!value)}
        style={{
          width: '40px',
          height: '22px',
          borderRadius: '11px',
          border: 'none',
          cursor: 'pointer',
          background: value ? AMBER : 'rgba(8,10,14,0.7)',
          outline: `1px solid ${value ? AMBER : BORDER}`,
          position: 'relative',
          transition: 'background 0.2s',
          flexShrink: 0,
        }}
        aria-pressed={value}
      >
        <span style={{
          position: 'absolute',
          top: '3px',
          left: value ? '20px' : '3px',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          background: value ? '#0a0b0e' : DIM,
          transition: 'left 0.2s',
        }} />
      </button>
      <span style={{ fontSize: '0.9rem', color: value ? TEXT : DIM }}>{label}</span>
    </div>
  );
}

// ── Live pay display ─────────────────────────────────────────────────────────

function PayDisplay({ total }) {
  return (
    <div style={{
      background: 'rgba(232, 168, 56, 0.07)',
      border: `1px solid ${BORDER}`,
      borderRadius: '8px',
      padding: '0.9rem 1.2rem',
      display: 'flex',
      alignItems: 'baseline',
      gap: '0.5rem',
      marginBottom: '1.25rem',
    }}>
      <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: DIM, fontFamily: "'JetBrains Mono', monospace" }}>
        Est. pay
      </span>
      <span style={{ fontSize: '1.6rem', fontWeight: 700, color: AMBER, letterSpacing: '-0.02em' }}>
        ${total.toFixed(2)}
      </span>
    </div>
  );
}

// ── Job form (shared between Add and Edit) ───────────────────────────────────

function JobForm({ defaults, action, pending, state, onSuccess }) {
  const today = new Date().toLocaleDateString('en-CA');

  const [date, setDate]       = useState(defaults?.date || today);
  const [jobType, setJobType] = useState(defaults?.job_type || 'normal');
  const [pages, setPages]     = useState(String(defaults?.pages ?? 0));
  const [proof, setProof]     = useState(defaults?.proofreading ?? false);
  const [rush, setRush]       = useState(defaults?.rush ?? false);
  const [advanced, setAdvanced] = useState(false);

  const [perPageRate,  setPerPageRate]  = useState(String(defaults?.per_page_rate  ?? 3.40));
  const [proofRate,    setProofRate]    = useState(String(defaults?.proofreading_rate ?? 0.50));
  const [rushRate,     setRushRate]     = useState(String(defaults?.rush_rate ?? 0.60));
  const [perDiem,      setPerDiem]      = useState(String(defaults?.per_diem       ?? 25));
  const [perDiemMult,  setPerDiemMult]  = useState(String(defaults?.per_diem_multiplier ?? 1));
  const [bustRate,     setBustRate]     = useState(String(defaults?.bust_rate      ?? 85));

  const isNew = !defaults?.id;

  useEffect(() => {
    if (state?.success) {
      if (isNew) {
        setDate(today);
        setJobType('normal');
        setPages('0');
        setProof(false);
        setRush(false);
        setPerPageRate('3.40');
        setProofRate('0.50');
        setRushRate('0.60');
        setPerDiem('25');
        setPerDiemMult('1');
        setBustRate('85');
        setAdvanced(false);
      }
      if (onSuccess) onSuccess();
    }
  }, [state]);

  const liveTotal = calcPay({
    job_type: jobType,
    pages: Number(pages) || 0,
    per_page_rate: Number(perPageRate) || 3.40,
    proofreading: proof,
    proofreading_rate: Number(proofRate) || 0.50,
    rush,
    rush_rate: Number(rushRate) || 0.60,
    per_diem: Number(perDiem) || 25,
    per_diem_multiplier: Number(perDiemMult) || 1,
    bust_rate: Number(bustRate) || 85,
  });

  return (
    <form action={action}>
      {/* Hidden fields for all values */}
      <input type="hidden" name="job_type" value={jobType} />
      <input type="hidden" name="proofreading" value={String(proof)} />
      <input type="hidden" name="per_page_rate" value={perPageRate} />
      <input type="hidden" name="proofreading_rate" value={proofRate} />
      <input type="hidden" name="rush" value={String(rush)} />
      <input type="hidden" name="rush_rate" value={rushRate} />
      <input type="hidden" name="per_diem" value={perDiem} />
      <input type="hidden" name="per_diem_multiplier" value={perDiemMult} />
      <input type="hidden" name="bust_rate" value={bustRate} />

      {/* Date */}
      <FInput
        label="Date"
        name="date"
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        required
      />

      {/* Job type toggle */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={labelStyle()}>Job type</div>
        <SegmentToggle
          value={jobType}
          onChange={setJobType}
          options={[
            { label: 'Went', val: 'normal' },
            { label: 'Bust', val: 'bust' },
          ]}
        />
      </div>

      {/* Normal-only fields */}
      {jobType === 'normal' && (
        <>
          <FInput
            label="Pages"
            name="pages"
            type="number"
            min="0"
            value={pages}
            onChange={e => setPages(e.target.value)}
          />
          <BoolToggle
            value={proof}
            onChange={setProof}
            label="Proofreading"
          />
          <BoolToggle
            value={rush}
            onChange={setRush}
            label="Rush"
          />
        </>
      )}

      {/* Live pay estimate */}
      <PayDisplay total={liveTotal} />

      {/* Advanced section */}
      <div style={{ marginBottom: '1.25rem' }}>
        <button
          type="button"
          onClick={() => setAdvanced(v => !v)}
          style={{
            background: 'none',
            border: `1px solid ${BORDER}`,
            borderRadius: '6px',
            color: DIM,
            fontSize: '0.78rem',
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.08em',
            padding: '0.35rem 0.75rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <span style={{ display: 'inline-block', transform: advanced ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}>▶</span>
          Advanced rates
        </button>

        {advanced && (
          <div style={{
            marginTop: '0.75rem',
            padding: '1rem',
            background: 'rgba(8,10,14,0.5)',
            border: `1px solid ${BORDER}`,
            borderRadius: '8px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0 1rem',
          }}>
            <div>
              <div style={labelStyle()}>Per-page rate ($)</div>
              <InputRaw value={perPageRate} onChange={setPerPageRate} type="number" step="0.01" min="0" />
            </div>
            <div>
              <div style={labelStyle()}>Proofreading deduct ($)</div>
              <InputRaw value={proofRate} onChange={setProofRate} type="number" step="0.01" min="0" />
            </div>
            <div>
              <div style={labelStyle()}>Per diem ($)</div>
              <InputRaw value={perDiem} onChange={setPerDiem} type="number" step="0.01" min="0" />
            </div>
            <div>
              <div style={labelStyle()}>Per diem ×</div>
              <SegmentToggle
                value={perDiemMult}
                onChange={setPerDiemMult}
                options={[
                  { label: '1×', val: '1' },
                  { label: '2×', val: '2' },
                ]}
              />
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <div style={labelStyle()}>Rush upcharge ($)</div>
              <InputRaw value={rushRate} onChange={setRushRate} type="number" step="0.01" min="0" />
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <div style={labelStyle()}>Bust rate ($)</div>
              <InputRaw value={bustRate} onChange={setBustRate} type="number" step="0.01" min="0" />
            </div>
          </div>
        )}
      </div>

      {state?.error && (
        <p style={{ color: RED, fontSize: '0.85rem', marginBottom: '0.75rem' }}>{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        style={{
          width: '100%',
          padding: '0.7rem',
          background: AMBER,
          color: '#0a0b0e',
          border: 'none',
          borderRadius: '7px',
          fontWeight: 700,
          fontSize: '0.9rem',
          cursor: pending ? 'not-allowed' : 'pointer',
          opacity: pending ? 0.7 : 1,
          fontFamily: 'inherit',
          letterSpacing: '0.02em',
        }}
      >
        {pending ? 'Saving…' : isNew ? 'Log Job →' : 'Save Changes →'}
      </button>
    </form>
  );
}

function InputRaw({ value, onChange, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ ...inputStyle(focused), marginBottom: '0.5rem' }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

// ── Add-job form wrapper ─────────────────────────────────────────────────────

function AddJobForm() {
  const [state, formAction, pending] = useActionState(addJob, {});
  return (
    <div style={{
      background: CARD,
      border: `1px solid ${BORDER}`,
      borderRadius: '10px',
      padding: '1.5rem',
      marginBottom: '2.5rem',
      boxShadow: '0 0 20px rgba(232, 168, 56, 0.04)',
    }}>
      <div style={{
        fontSize: '0.7rem',
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
        color: AMBER,
        fontFamily: "'JetBrains Mono', monospace",
        marginBottom: '1.25rem',
      }}>
        // Log a job
      </div>
      <JobForm action={formAction} pending={pending} state={state} />
    </div>
  );
}

// ── Job row (list item + inline edit) ───────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

// EditJobForm owns its own useActionState so it always mounts with fresh state {}.
// Previously useActionState lived in JobRow (which stays mounted), so after a
// successful save editState was { success: true }. Re-opening the editor mounted
// JobForm with that stale success state, the useEffect fired immediately and called
// onSuccess() — closing the editor in the same frame it opened.
function EditJobForm({ job, onClose }) {
  const boundUpdate = updateJob.bind(null, job.id);
  const [editState, editAction, editPending] = useActionState(boundUpdate, {});
  return (
    <div style={{
      background: 'rgba(19,22,29,0.97)',
      border: `1px solid ${BORDER}`,
      borderRadius: '8px',
      padding: '1.25rem',
      marginTop: '-0.4rem',
      marginBottom: '0.6rem',
    }}>
      <div style={{ fontSize: '0.7rem', color: DIM, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', marginBottom: '1rem' }}>
        // Editing {formatDate(job.date)}
      </div>
      <JobForm
        defaults={job}
        action={editAction}
        pending={editPending}
        state={editState}
        onSuccess={onClose}
      />
    </div>
  );
}

function JobRow({ job }) {
  const [editing, setEditing] = useState(false);
  const [deletePending, startDelete] = useTransition();

  const total = calcPay(job);

  function handleDelete() {
    if (!confirm('Delete this job? This cannot be undone.')) return;
    startDelete(() => deleteJob(job.id));
  }

  const rowStyle = {
    background: CARD,
    border: `1px solid ${BORDER}`,
    borderRadius: '8px',
    padding: '0.9rem 1.1rem',
    marginBottom: '0.6rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  };

  const chipStyle = (color = DIM) => ({
    display: 'inline-block',
    padding: '0.2rem 0.55rem',
    borderRadius: '4px',
    fontSize: '0.72rem',
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: '0.05em',
    background: color === AMBER ? 'rgba(232,168,56,0.12)' : 'rgba(232, 88, 88, 0.1)',
    color: color,
    border: `1px solid ${color === AMBER ? 'rgba(232,168,56,0.25)' : 'rgba(232,88,88,0.25)'}`,
  });

  return (
    <>
      <div style={rowStyle}>
        <span style={{ color: TEXT, fontSize: '0.9rem', minWidth: '110px' }}>
          {formatDate(job.date)}
        </span>

        <span style={chipStyle(job.job_type === 'bust' ? RED : AMBER)}>
          {job.job_type === 'bust' ? 'Bust' : 'Went'}
        </span>

        {job.job_type === 'normal' && (
          <span style={{ color: DIM, fontSize: '0.85rem' }}>
            {job.pages} pg{job.pages !== 1 ? 's' : ''}
            {job.proofreading && <span style={{ color: '#6a9fd8', marginLeft: '0.4rem', fontSize: '0.75rem' }}>+ proof</span>}
            {job.rush && <span style={{ color: AMBER, marginLeft: '0.4rem', fontSize: '0.75rem' }}>+ rush</span>}
          </span>
        )}

        <span style={{ marginLeft: 'auto', fontWeight: 700, color: AMBER, fontSize: '1rem', letterSpacing: '-0.01em' }}>
          ${total.toFixed(2)}
        </span>

        <button
          type="button"
          onClick={() => setEditing(v => !v)}
          style={{
            background: 'none',
            border: `1px solid ${BORDER}`,
            borderRadius: '5px',
            color: DIM,
            fontSize: '0.78rem',
            padding: '0.25rem 0.65rem',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {editing ? 'Cancel' : 'Edit'}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deletePending}
          style={{
            background: 'none',
            border: `1px solid rgba(232,88,88,0.25)`,
            borderRadius: '5px',
            color: RED,
            fontSize: '0.78rem',
            padding: '0.25rem 0.65rem',
            cursor: deletePending ? 'not-allowed' : 'pointer',
            opacity: deletePending ? 0.6 : 1,
            fontFamily: 'inherit',
          }}
        >
          {deletePending ? '…' : 'Delete'}
        </button>
      </div>

      {editing && (
        <EditJobForm job={job} onClose={() => setEditing(false)} />
      )}
    </>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────

const PAGE_SIZE = 25;

export default function TranscriptionClient({ jobs }) {
  // Distinct years present in the data, most recent first
  const years = [...new Set(jobs.map(j => j.date?.slice(0, 4)).filter(Boolean))].sort((a, b) => b.localeCompare(a));

  const currentYear   = String(new Date().getFullYear());
  const defaultYear   = years.includes(currentYear) ? currentYear : (years[0] ?? currentYear);
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [page, setPage] = useState(1);

  const yearJobs   = jobs.filter(j => j.date?.startsWith(selectedYear));
  const totalPages = Math.max(1, Math.ceil(yearJobs.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const pageJobs   = yearJobs.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function handleYearChange(y) {
    setSelectedYear(y);
    setPage(1);
  }

  const selectStyle = {
    background:   'rgba(8, 10, 14, 0.7)',
    border:       `1px solid ${BORDER}`,
    borderRadius: '6px',
    color:        TEXT,
    padding:      '0.28rem 0.6rem',
    fontSize:     '0.82rem',
    fontFamily:   'inherit',
    cursor:       'pointer',
    outline:      'none',
  };

  const pageBtnStyle = (disabled) => ({
    background:   'none',
    border:       `1px solid ${disabled ? 'rgba(232,168,56,0.1)' : BORDER}`,
    borderRadius: '6px',
    color:        disabled ? 'rgba(122,120,112,0.35)' : DIM,
    fontSize:     '0.8rem',
    fontFamily:   "'JetBrains Mono', monospace",
    padding:      '0.3rem 0.8rem',
    cursor:       disabled ? 'default' : 'pointer',
    letterSpacing:'0.04em',
  });

  return (
    <div>

      <AddJobForm />

      {/* List header: label + year selector */}
      <div style={{
        display:       'flex',
        alignItems:    'center',
        gap:           '0.9rem',
        marginBottom:  '1rem',
        flexWrap:      'wrap',
      }}>
        <div style={{
          fontSize:      '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          color:         DIM,
          fontFamily:    "'JetBrains Mono', monospace',",
        }}>
          // {yearJobs.length} job{yearJobs.length !== 1 ? 's' : ''} in {selectedYear}
        </div>

        {years.length > 0 && (
          <select value={selectedYear} onChange={e => handleYearChange(e.target.value)} style={selectStyle}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        )}
      </div>

      {/* Job list */}
      {yearJobs.length === 0 ? (
        <div style={{
          padding:      '2rem',
          textAlign:    'center',
          color:        DIM,
          background:   CARD,
          border:       `1px solid ${BORDER}`,
          borderRadius: '8px',
          fontSize:     '0.9rem',
        }}>
          {jobs.length === 0
            ? 'No jobs logged yet. Use the form above to add the first one.'
            : `No jobs logged for ${selectedYear}.`}
        </div>
      ) : (
        <>
          <div>
            {pageJobs.map(job => (
              <JobRow key={job.id} job={job} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'space-between',
              marginTop:      '1.25rem',
              padding:        '0.75rem 0',
              borderTop:      `1px solid ${BORDER}`,
            }}>
              <button
                type="button"
                disabled={safePage === 1}
                onClick={() => setPage(p => p - 1)}
                style={pageBtnStyle(safePage === 1)}
              >
                ← Prev
              </button>

              <span style={{
                fontSize:   '0.75rem',
                color:      DIM,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                Page {safePage} of {totalPages}
              </span>

              <button
                type="button"
                disabled={safePage === totalPages}
                onClick={() => setPage(p => p + 1)}
                style={pageBtnStyle(safePage === totalPages)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

    </div>
  );
}
