'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function TranscriptionWidget({ projected, monthTotal, monthName, style }) {
  const [hovered, setHovered] = useState(false);

  const cardStyle = {
    // Card base — mirrors styles.js `card` object exactly
    background:           'rgba(19, 22, 29, 0.85)',
    border:               `1px solid rgba(232, 168, 56, ${hovered ? '0.28' : '0.12'})`,
    boxShadow:            `0 0 ${hovered ? '20px rgba(232, 168, 56, 0.10)' : '12px rgba(232, 168, 56, 0.04)'}`,
    padding:              '1.5rem',
    borderRadius:         '8px',
    display:              'flex',
    flexDirection:        'column',
    gap:                  '0.2rem',
    overflow:             'hidden',
    backdropFilter:       'none',
    WebkitBackdropFilter: 'none',
    transition:           'box-shadow 0.3s ease, border-color 0.3s ease',
    // Link-specific resets
    textDecoration: 'none',
    cursor:         'pointer',
    // Grid placement or any overrides from parent
    ...style,
  };

  return (
    <Link
      href="/dashboard/transcription"
      style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Card label */}
      <div style={{
        fontSize:      '0.62rem',
        fontWeight:    700,
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        color:         '#7a7870',
        fontFamily:    "'JetBrains Mono', monospace",
        marginBottom:  '0.55rem',
      }}>
        Jana's Work
      </div>

      {/* Headline — projected yearly income */}
      <div style={{
        fontSize:      projected != null ? '1.85rem' : '1.5rem',
        fontWeight:    700,
        color:         '#e8a838',
        letterSpacing: '-0.02em',
        lineHeight:    1,
      }}>
        {projected != null ? `$${projected.toLocaleString()}` : '—'}
      </div>

      <div style={{
        fontSize:      '0.64rem',
        color:         '#4a4840',
        fontFamily:    "'JetBrains Mono', monospace",
        letterSpacing: '0.06em',
        marginBottom:  '0.5rem',
      }}>
        projected this year
      </div>

      {/* Secondary — this month's total */}
      {monthTotal != null && (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
          <span style={{ fontSize: '1rem', fontWeight: 600, color: '#c0b9aa' }}>
            ${monthTotal.toLocaleString()}
          </span>
          <span style={{
            fontSize:   '0.68rem',
            color:      '#5a5850',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {monthName ?? 'this month'}
          </span>
        </div>
      )}

      {projected == null && (
        <div style={{ fontSize: '0.75rem', color: '#5a5850', marginTop: '0.25rem' }}>
          No jobs yet this year
        </div>
      )}

      {/* Footer hint */}
      <div style={{
        marginTop:  'auto',
        paddingTop: '0.75rem',
        fontSize:   '0.65rem',
        color:      hovered ? '#7a7870' : '#3a3830',
        fontFamily: "'JetBrains Mono', monospace",
        transition: 'color 0.2s ease',
      }}>
        View tracker →
      </div>
    </Link>
  );
}
