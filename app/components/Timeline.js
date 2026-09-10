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

const EASE = [0.22, 1, 0.36, 1];

const STYLE_TAG = `
.timeline-track {
  --timeline-offset: 40px;
}
@media (max-width: 900px) {
  .timeline-track {
    --timeline-offset: 26px;
  }
}
`;

function TimelineBullets({ bullets }) {
  if (!bullets || bullets.length === 0) return null;

  return (
    <ul
      style={{
        listStyle: 'none',
        margin: '14px 0 0',
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {bullets.map((bullet) => (
        <li key={bullet} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <span
            aria-hidden="true"
            style={{
              flexShrink: 0,
              width: '4px',
              height: '4px',
              marginTop: '7px',
              background: 'var(--steel)',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-outfit), sans-serif',
              fontSize: '14px',
              lineHeight: 1.6,
              color: 'var(--bone)',
              opacity: 0.52,
            }}
          >
            {bullet}
          </span>
        </li>
      ))}
    </ul>
  );
}

function TimelineEntry({ entry, reduceMotion, detailed }) {
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
        {detailed && <TimelineBullets bullets={entry.bullets} />}
      </motion.div>
    </div>
  );
}

export default function Timeline({ entries, detailed = false }) {
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
    <div
      ref={timelineRef}
      className="timeline-track"
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
        {entries.map((entry) => (
          <TimelineEntry
            key={`${entry.role}-${entry.org}`}
            entry={entry}
            reduceMotion={reduceMotion}
            detailed={detailed}
          />
        ))}
      </div>

      <style>{STYLE_TAG}</style>
    </div>
  );
}
