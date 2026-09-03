'use client';

import { useState } from 'react';

const tags = ['React', 'Vite', 'Web Design', 'Client Work'];

export default function LongIslandEmpireCard() {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href="https://longislandempire.com"
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'var(--bg-card-hover)' : 'var(--bg-card)',
        border: `1px solid ${hovered ? 'var(--border-accent)' : 'var(--border)'}`,
        padding: '2.5rem',
        transition: 'all 0.4s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        position: 'relative',
        overflow: 'hidden',
        textDecoration: 'none',
        display: 'block',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '2px',
          background: 'linear-gradient(90deg, var(--accent), transparent)',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}
      />
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.65rem',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          color: 'var(--accent)',
          marginBottom: '1rem',
        }}
      >
        Client Project
      </div>
      <div
        style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: '1.6rem',
          color: 'var(--text-bright)',
          marginBottom: '0.75rem',
          letterSpacing: '-0.01em',
        }}
      >
        Long Island Empire Baseball
      </div>
      <p
        style={{
          fontSize: '0.95rem',
          color: 'var(--text-dim)',
          lineHeight: 1.7,
          marginBottom: '1.5rem',
        }}
      >
        A website for a player-development-first travel baseball organization — team pages, a
        college-commitment tracker, and online tryout registration.
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {tags.map((tag) => (
          <span
            key={tag}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.6rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              padding: '0.35rem 0.75rem',
              border: '1px solid var(--border)',
              color: 'var(--text-dim)',
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </a>
  );
}
