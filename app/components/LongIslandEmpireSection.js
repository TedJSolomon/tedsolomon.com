'use client';

import { useEffect, useState } from 'react';

const tags = ['React', 'Vite', 'Web Design', 'Client Work'];

export default function LongIslandEmpireSection() {
  const [isMobile, setIsMobile] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <section
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: isMobile ? '3rem 1.5rem' : '5rem 3rem',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '200px 1fr',
        gap: isMobile ? '1.5rem' : '4rem',
        alignItems: 'start',
        borderTop: '1px solid var(--border)',
      }}
    >
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          color: 'var(--text-dim)',
          paddingTop: '0.5rem',
        }}
      >
        Client Project
      </div>
      <div>
        <h2
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 'clamp(2rem, 4vw, 2.8rem)',
            color: 'var(--text-bright)',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            marginBottom: '1.5rem',
          }}
        >
          Long Island Empire Baseball
        </h2>
        <p
          style={{
            fontSize: '1.05rem',
            lineHeight: 1.85,
            color: 'var(--text)',
            maxWidth: '600px',
            marginBottom: '1.75rem',
          }}
        >
          A marketing and information site for a Long Island youth travel baseball organization,
          built to give families one clear place to explore teams, understand the development
          pathway, and sign up for tryouts.
        </p>
        <p
          style={{
            fontSize: '1.05rem',
            lineHeight: 1.85,
            color: 'var(--text)',
            maxWidth: '600px',
            marginBottom: '1.75rem',
          }}
        >
          The site spans 10 teams across every age bracket (9U–17U), a player-development section
          laying out training tracks and the age-based pathway, a searchable tracker of the
          program&apos;s college commitments, and a tryout page with a working registration form
          that validates entries and submits directly to the org&apos;s roster. Built as a fast,
          hand-rolled single-page app with real URL routing, so deep links, refreshes, and
          back-forward navigation all behave like a normal multi-page site.
        </p>
        <p
          style={{
            fontSize: '1.05rem',
            lineHeight: 1.85,
            color: 'var(--text)',
            maxWidth: '600px',
            marginBottom: '1.75rem',
          }}
        >
          One design decision I&apos;m proud of: a feature-flag rollout system. Sections like
          championships, staff bios, and a team shop are fully built but hidden behind build-time
          flags — so the org can launch with a focused site now and flip on new sections as
          content becomes ready, without a redeploy of new code. Build it now, turn it on later.
        </p>
        <p
          style={{
            fontSize: '1.05rem',
            lineHeight: 1.85,
            color: 'var(--text)',
            maxWidth: '600px',
            marginBottom: '1.75rem',
          }}
        >
          Built with React and Vite, styled from scratch with no CSS framework, deployed on
          Netlify.
        </p>
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            marginBottom: '2rem',
          }}
        >
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
        <a
          href="https://longislandempire.com"
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            padding: '0.9rem 2rem',
            background: 'transparent',
            color: btnHovered ? 'var(--accent)' : 'var(--text)',
            border: `1px solid ${btnHovered ? 'var(--accent)' : 'var(--border)'}`,
            cursor: 'pointer',
            textDecoration: 'none',
            fontWeight: 400,
            transition: 'all 0.3s ease',
            display: 'inline-block',
          }}
        >
          Visit Long Island Empire Baseball →
        </a>
      </div>
    </section>
  );
}
