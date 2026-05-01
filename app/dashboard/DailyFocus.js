'use client';

import { useState, useRef } from 'react';
import { saveDailyFocus } from './actions';

const PLACEHOLDERS = [
  "What's your #1 priority today?",
  'Second most important thing?',
  'Third priority for today?',
];

export default function DailyFocus({ initialData }) {
  const [values, setValues] = useState([
    initialData?.priority_1 || '',
    initialData?.priority_2 || '',
    initialData?.priority_3 || '',
  ]);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef(null);

  function handleChange(i, val) {
    const next = [...values];
    next[i] = val;
    setValues(next);
    setSaved(false);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        await saveDailyFocus(next[0], next[1], next[2]);
        setSaved(true);
        setTimeout(() => setSaved(false), 1800);
      } catch { /* non-fatal */ }
    }, 600);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontSize: '0.68rem',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: '#7a7870',
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 600,
        }}>
          Today's Focus
        </span>
        <span style={{
          fontSize: '0.62rem',
          color: '#e8a838',
          fontFamily: "'JetBrains Mono', monospace",
          opacity: saved ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}>
          ✓ saved
        </span>
      </div>

      {values.map((val, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span style={{
            fontSize: '0.68rem',
            color: val ? '#e8a838' : '#4a4840',
            fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
            width: '0.9rem',
            textAlign: 'center',
            flexShrink: 0,
            transition: 'color 0.2s',
          }}>
            {i + 1}
          </span>
          <input
            type="text"
            value={val}
            placeholder={PLACEHOLDERS[i]}
            onChange={(e) => handleChange(i, e.target.value)}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(232,168,56,0.15)',
              borderRadius: '5px',
              padding: '0.5rem 0.75rem',
              color: '#f5f3ef',
              fontSize: '0.85rem',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(232,168,56,0.5)';
              e.target.style.boxShadow = '0 0 0 2px rgba(232,168,56,0.07)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(232,168,56,0.15)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
      ))}
    </div>
  );
}
