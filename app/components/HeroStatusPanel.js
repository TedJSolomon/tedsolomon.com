'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';

const EASE = [0.22, 1, 0.36, 1];

const PANEL_STYLE_TAG = `
@keyframes heroStatusPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}
@media (max-width: 900px) {
  .hero-status-panel {
    max-width: none;
  }
}
@media (max-width: 600px) {
  .hero-status-panel {
    display: none;
  }
}
`;

const BADGE_STYLES = {
  LIVE: { color: 'var(--accent)', background: 'rgba(94,200,219,0.10)' },
  SHIPPING: { color: 'var(--chrome)', background: 'rgba(200,210,222,0.08)' },
  LOCKED: { color: 'var(--muted)', background: 'rgba(122,133,149,0.08)' },
};

const PROJECT_ROWS = [
  { name: 'VISION QUEST', type: 'newsletter', status: 'LIVE', href: 'https://visionquest.beehiiv.com', external: true },
  { name: 'CATALYFT', type: 'ios', status: 'SHIPPING', href: '/projects', external: false },
  { name: 'LI EMPIRE', type: 'web', status: 'LIVE', href: 'https://longislandempire.com', external: true },
  { name: 'COMMAND CENTER', type: 'internal', status: 'LOCKED', href: null, external: false },
];

function Badge({ status }) {
  const s = BADGE_STYLES[status];
  return (
    <span
      style={{
        fontSize: '10px',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        padding: '3px 7px',
        borderRadius: '2px',
        color: s.color,
        background: s.background,
        justifySelf: 'end',
      }}
    >
      {status}
    </span>
  );
}

function ProjectRow({ row, isLast, reduceMotion, delay }) {
  const [hovered, setHovered] = useState(false);
  const isLink = !!row.href;

  const rowStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr auto auto',
    alignItems: 'center',
    gap: '14px',
    padding: '10px 0',
    borderBottom: isLast ? 'none' : '1px solid var(--steel)',
    background: isLink && hovered ? 'rgba(232,235,240,0.03)' : 'transparent',
    transition: 'background 0.25s ease',
    textDecoration: 'none',
  };

  const rowContent = (
    <>
      <span
        style={{
          color: isLink && hovered ? 'var(--accent)' : 'var(--bone)',
          transition: 'color 0.25s ease',
        }}
      >
        {row.name}
      </span>
      <span style={{ color: 'var(--muted)', fontSize: '11px', justifySelf: 'end' }}>
        {row.type}
      </span>
      <Badge status={row.status} />
    </>
  );

  const motionProps = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: reduceMotion ? { duration: 0 } : { duration: 0.8, delay, ease: EASE },
  };

  if (!isLink) {
    return (
      <motion.div {...motionProps} style={rowStyle}>
        {rowContent}
      </motion.div>
    );
  }

  if (row.external) {
    return (
      <motion.div {...motionProps}>
        <a
          href={row.href}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={rowStyle}
        >
          {rowContent}
        </a>
      </motion.div>
    );
  }

  return (
    <motion.div {...motionProps}>
      <Link
        href={row.href}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={rowStyle}
      >
        {rowContent}
      </Link>
    </motion.div>
  );
}

export default function HeroStatusPanel({ reduceMotion }) {
  return (
    <motion.div
      className="hero-status-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.8, delay: 0.7, ease: EASE }}
      style={{
        width: '100%',
        maxWidth: '420px',
        background: 'color-mix(in srgb, var(--surface) 55%, transparent)',
        border: '1px solid var(--steel)',
        borderRadius: '2px',
        padding: '22px',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        fontFamily: 'var(--font-jetbrains-mono), monospace',
        boxSizing: 'border-box',
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
        }}
      >
        <span style={{ color: 'var(--muted)' }}>System Status</span>
        <span style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            aria-hidden="true"
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--accent)',
              display: 'inline-block',
              animationName: reduceMotion ? 'none' : 'heroStatusPulse',
              animationDuration: '2.4s',
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
            }}
          />
          Online
        </span>
      </div>

      <div style={{ height: '1px', background: 'var(--steel)', margin: '16px 0' }} />

      {/* Project rows */}
      <div>
        {PROJECT_ROWS.map((row, i) => (
          <ProjectRow
            key={row.name}
            row={row}
            isLast={i === PROJECT_ROWS.length - 1}
            reduceMotion={reduceMotion}
            delay={reduceMotion ? 0 : 0.85 + i * 0.06}
          />
        ))}
      </div>

      {/* Meta block */}
      <div style={{ marginTop: '16px', fontSize: '11px', color: 'var(--muted)' }}>
        <div style={{ display: 'flex', gap: '10px', padding: '3px 0' }}>
          <span style={{ width: '70px', flexShrink: 0, textTransform: 'uppercase' }}>Stack</span>
          <span>next · supabase · vercel</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', padding: '3px 0' }}>
          <span style={{ width: '70px', flexShrink: 0, textTransform: 'uppercase' }}>Location</span>
          <span>40.7326° N, 73.4454° W</span>
        </div>
      </div>

      <style>{PANEL_STYLE_TAG}</style>
    </motion.div>
  );
}
