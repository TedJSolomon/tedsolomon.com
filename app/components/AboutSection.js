'use client';

import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import Reveal from './Reveal';

const EASE = [0.22, 1, 0.36, 1];

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
.about-timeline {
  --timeline-offset: 40px;
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
  .about-timeline {
    --timeline-offset: 26px;
  }
  .about-stats {
    justify-content: space-between;
    gap: 1.5rem;
  }
}
`;

function TimelineEntry({ entry, reduceMotion }) {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: '0px 0px -45% 0px', once: true });
  const activated = reduceMotion || inView;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 'calc(-1 * var(--timeline-offset) - 4.5px)',
          top: '4px',
          width: '9px',
          height: '9px',
          borderRadius: '50%',
          background: 'var(--void)',
          border: `2px solid ${activated ? 'var(--accent)' : 'var(--steel)'}`,
          boxShadow: activated ? '0 0 12px rgba(94,200,219,0.5)' : 'none',
          transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
        }}
      />
      <motion.div
        initial={{ opacity: 0.4, x: 12 }}
        animate={{ opacity: activated ? 1 : 0.4, x: activated ? 0 : 12 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.5, ease: EASE }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontFamily: 'var(--font-jetbrains-mono), monospace',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: 'var(--muted)',
          }}
        >
          {entry.period}
          {entry.current && (
            <span
              style={{
                fontFamily: 'var(--font-jetbrains-mono), monospace',
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--accent)',
                background: 'rgba(94,200,219,0.10)',
                padding: '3px 7px',
                borderRadius: '2px',
              }}
            >
              Current
            </span>
          )}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-outfit), sans-serif',
            fontSize: '1.15rem',
            fontWeight: 500,
            color: 'var(--bone)',
            marginTop: '6px',
          }}
        >
          {entry.role}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-jetbrains-mono), monospace',
            fontSize: '12px',
            color: 'var(--muted)',
            marginTop: '4px',
          }}
        >
          {entry.org}
        </div>
        <p
          style={{
            fontFamily: 'var(--font-outfit), sans-serif',
            fontSize: '14px',
            lineHeight: 1.6,
            color: 'var(--bone)',
            opacity: 0.55,
            maxWidth: '44ch',
            marginTop: '10px',
          }}
        >
          {entry.note}
        </p>
      </motion.div>
    </div>
  );
}

export default function AboutSection() {
  const rawReducedMotion = useReducedMotion();
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(!!rawReducedMotion);
  }, [rawReducedMotion]);

  const timelineRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start 0.75', 'end 0.35'],
  });
  const rawScaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const scaleY = useSpring(rawScaleY, { stiffness: 100, damping: 30 });

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
          <div
            ref={timelineRef}
            className="about-timeline"
            style={{ position: 'relative', marginLeft: 'var(--timeline-offset)' }}
          >
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: 'calc(-1 * var(--timeline-offset))',
                top: 0,
                bottom: 0,
                width: '1px',
                background: 'var(--steel)',
              }}
            />
            <motion.div
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: 'calc(-1 * var(--timeline-offset))',
                top: 0,
                bottom: 0,
                width: '1px',
                background: 'var(--accent)',
                transformOrigin: 'top',
                willChange: 'transform, opacity',
                ...(reduceMotion ? { scaleY: 1 } : { scaleY }),
              }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '56px' }}>
              {TIMELINE.map((entry) => (
                <TimelineEntry key={`${entry.role}-${entry.org}`} entry={entry} reduceMotion={reduceMotion} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{STYLE_TAG}</style>
    </section>
  );
}
