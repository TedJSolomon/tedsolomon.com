'use client';

import { useState } from 'react';
import Link from 'next/link';
import Reveal from './Reveal';
import Timeline from './Timeline';

const TIMELINE = [
  {
    period: '2026 — Present',
    role: 'Product Manager',
    org: 'Beck Technology',
    note: 'Product strategy and roadmap for DESTINI Estimator, preconstruction software used by general contractors nationwide.',
    current: true,
  },
  {
    period: '2022 — 2026',
    role: 'Implementation Manager',
    org: 'Beck Technology',
    note: 'Led software rollouts for contractors across the country. Configured workflows, drove adoption, and learned what estimators actually need.',
  },
  {
    period: 'Prior',
    role: 'Project Engineer',
    org: 'Posillico Civil Inc.',
    note: 'Supported operations on heavy civil construction projects.',
  },
  {
    period: 'Prior',
    role: 'Estimator',
    org: 'Posillico Civil Inc.',
    note: 'Priced and bid heavy civil construction work.',
  },
  {
    period: 'Prior',
    role: 'Jr. Estimator',
    org: 'Posillico Civil Inc.',
    note: 'Takeoffs, subcontractor outreach, and bid preparation.',
  },
];

const STATS = [
  { number: '8+', label: 'Years in Industry' },
  { number: '2', label: 'Products Shipped on the Side' },
];

const STYLE_TAG = `
.about-layout {
  display: flex;
  gap: 6%;
  align-items: flex-start;
}
.about-left-col {
  flex: 0 0 44%;
  min-width: 0;
  position: sticky;
  top: 18vh;
}
.about-timeline-col {
  flex: 0 0 50%;
  min-width: 0;
}
.about-stats {
  gap: 2rem;
}
@media (max-width: 900px) {
  .about-layout {
    flex-direction: column;
  }
  .about-left-col {
    flex: 1 1 auto;
    position: static;
    top: auto;
  }
  .about-timeline-col {
    flex: 1 1 auto;
    width: 100%;
  }
  .about-stats {
    justify-content: space-between;
    gap: 1.5rem;
  }
}
`;

export default function AboutSection() {
  const [storyHover, setStoryHover] = useState(false);

  return (
    <section
      id="about"
      style={{
        position: 'relative',
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '6rem clamp(1.5rem, 6vw, 4.5rem)',
        boxSizing: 'border-box',
      }}
    >
      <div className="about-layout">
        <div className="about-left-col">
          <Reveal>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: '32px',
                    height: '1px',
                    background: 'var(--steel)',
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-jetbrains-mono), monospace',
                    fontSize: '12px',
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: 'var(--accent)',
                    opacity: 0.7,
                  }}
                >
                  About
                </span>
              </div>

              <h2
                style={{
                  fontFamily: 'var(--font-dm-serif-display), serif',
                  fontWeight: 400,
                  fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
                  color: 'var(--bone)',
                  margin: '1.25rem 0 0',
                }}
              >
                Construction to product.
              </h2>

              <p
                style={{
                  fontFamily: 'var(--font-outfit), sans-serif',
                  fontSize: '16px',
                  lineHeight: 1.7,
                  color: 'var(--bone)',
                  opacity: 0.68,
                  maxWidth: '46ch',
                  marginTop: '1.5rem',
                }}
              >
                I started in heavy civil construction — five years as an estimator and project
                engineer before making the jump to tech. Three and a half years in implementation
                working directly with users, then earned my way into product management.
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-outfit), sans-serif',
                  fontSize: '16px',
                  lineHeight: 1.7,
                  color: 'var(--bone)',
                  opacity: 0.68,
                  maxWidth: '46ch',
                  marginTop: '1.1rem',
                }}
              >
                That path gave me something I carry into every product role: I know how to talk
                to users, understand their problems deeply, and translate that into software that
                solves them. The industry may change — the approach doesn&apos;t.
              </p>

              <Link
                href="/about"
                onMouseEnter={() => setStoryHover(true)}
                onMouseLeave={() => setStoryHover(false)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '1.25rem',
                  fontFamily: 'var(--font-jetbrains-mono), monospace',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  color: 'var(--accent)',
                  textDecoration: 'none',
                }}
              >
                Read the full story
                <span
                  aria-hidden="true"
                  style={{
                    display: 'inline-block',
                    transform: storyHover ? 'translate(4px, -4px)' : 'translate(0, 0)',
                    transition: 'transform 0.3s ease',
                  }}
                >
                  ↗
                </span>
              </Link>

              <div
                className="about-stats"
                style={{ display: 'flex', alignItems: 'flex-start', marginTop: '32px' }}
              >
                {STATS.map((stat, i) => (
                  <div key={stat.label} style={{ display: 'flex', alignItems: 'flex-start' }}>
                    {i > 0 && (
                      <div
                        aria-hidden="true"
                        style={{
                          width: '1px',
                          alignSelf: 'stretch',
                          background: 'var(--steel)',
                          marginRight: '2rem',
                        }}
                      />
                    )}
                    <div>
                      <div
                        style={{
                          fontFamily: 'var(--font-dm-serif-display), serif',
                          fontSize: '2.6rem',
                          color: 'var(--bone)',
                        }}
                      >
                        {stat.number}
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-jetbrains-mono), monospace',
                          fontSize: '10px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.14em',
                          color: 'var(--muted)',
                          maxWidth: '14ch',
                          marginTop: '0.5rem',
                        }}
                      >
                        {stat.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <div className="about-timeline-col">
          <Timeline entries={TIMELINE} detailed={false} />
        </div>
      </div>

      <style>{STYLE_TAG}</style>
    </section>
  );
}
