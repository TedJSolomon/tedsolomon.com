'use client';

import { useState } from 'react';
import Link from 'next/link';
import Reveal from './Reveal';
import RevealGroup from './RevealGroup';

const PROJECTS = [
  {
    index: '01',
    name: 'Vision Quest',
    type: 'Newsletter',
    status: 'LIVE',
    description:
      'A weekly tech newsletter breaking down AI, hardware, and emerging tech for people who want to stay informed without the jargon. Co-founded it and handle the product side — reader analytics, content strategy, growth.',
    stack: ['Beehiiv', 'Product Strategy', 'Growth'],
    href: 'https://visionquest.beehiiv.com',
    external: true,
  },
  {
    index: '02',
    name: 'Catalyft',
    type: 'iOS App',
    status: 'SHIPPING',
    description:
      'A mobile workout tracking app built for weightlifting. Logging sets, tracking progress, and planning workouts, made fast. Built from scratch as a side project — currently heading to the App Store.',
    stack: ['iOS', 'React Native', 'Product Design'],
    href: '/projects',
    external: false,
  },
  {
    index: '03',
    name: 'Long Island Empire Baseball',
    type: 'Client Work',
    status: 'LIVE',
    description:
      'A site for a player-development-first travel baseball organization — team pages, a college-commitment tracker, and online tryout registration.',
    stack: ['React', 'Vite', 'Web Design'],
    href: 'https://longislandempire.com',
    external: true,
  },
  {
    index: '04',
    name: 'Command Center',
    type: 'Internal',
    status: 'LOCKED',
    description:
      'A private operations dashboard — calendar, goals, wins tracking, and daily briefings. Built for an audience of one.',
    stack: ['Next.js', 'Supabase', 'Vercel'],
    href: null,
    external: false,
  },
];

const BADGE_STYLES = {
  LIVE: { color: 'var(--accent)', background: 'rgba(94,200,219,0.10)' },
  SHIPPING: { color: 'var(--chrome)', background: 'rgba(200,210,222,0.08)' },
  LOCKED: { color: 'var(--muted)', background: 'rgba(122,133,149,0.08)' },
};

const STYLE_TAG = `
@keyframes heroSheen {
  0%   { background-position: -80% 0, 0 0; }
  16%  { background-position: 180% 0, 0 0; }
  100% { background-position: 180% 0, 0 0; }
}
.proj-row-grid {
  display: grid;
  grid-template-columns: 72px 1fr 140px;
  column-gap: 24px;
  align-items: start;
}
.proj-right-col {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 20px;
}
.proj-index-mobile {
  display: none;
}
@media (max-width: 720px) {
  .proj-row-grid {
    grid-template-columns: 1fr;
    row-gap: 12px;
  }
  .proj-index-desktop {
    display: none;
  }
  .proj-index-mobile {
    display: block;
  }
  .proj-right-col {
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 12px;
  }
  .proj-desc {
    max-width: 100% !important;
  }
}
`;

function Badge({ status }) {
  const s = BADGE_STYLES[status];
  return (
    <span
      style={{
        fontFamily: 'var(--font-jetbrains-mono), monospace',
        fontSize: '10px',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        padding: '3px 7px',
        borderRadius: '2px',
        color: s.color,
        background: s.background,
      }}
    >
      {status}
    </span>
  );
}

function IndexNumber({ index, hovered, className }) {
  return (
    <span
      className={className}
      style={{
        fontFamily: 'var(--font-jetbrains-mono), monospace',
        fontSize: '13px',
        letterSpacing: '0.1em',
        color: hovered ? 'transparent' : 'var(--muted)',
        ...(hovered
          ? {
              backgroundImage: 'var(--chrome-metal)',
              backgroundSize: '300% 100%',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              animationName: 'heroSheen',
              animationDuration: '1s',
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 1,
              animationFillMode: 'forwards',
            }
          : {}),
      }}
    >
      {index}
    </span>
  );
}

function StackChips({ stack }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
      {stack.map((item) => (
        <span
          key={item}
          style={{
            fontFamily: 'var(--font-jetbrains-mono), monospace',
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--muted)',
            padding: '4px 9px',
            border: '1px solid var(--steel)',
            borderRadius: '2px',
            background: 'transparent',
          }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function ProjectRow({ project }) {
  const [hovered, setHovered] = useState(false);
  const isLink = !!project.href;
  const isLocked = project.status === 'LOCKED';

  const rowStyle = {
    display: 'block',
    padding: '32px 0',
    borderBottom: `1px solid ${hovered ? 'rgba(94,200,219,0.35)' : 'var(--steel)'}`,
    background: hovered ? 'rgba(232,235,240,0.022)' : 'transparent',
    transition: 'background 0.3s ease, border-color 0.3s ease',
    textDecoration: 'none',
    opacity: isLocked ? 0.55 : 1,
  };

  const rowContent = (
    <div className="proj-row-grid">
      <IndexNumber index={project.index} hovered={hovered} className="proj-index-desktop" />

      <div>
        <IndexNumber index={project.index} hovered={hovered} className="proj-index-mobile" />
        <div
          style={{
            fontFamily: 'var(--font-dm-serif-display), serif',
            fontSize: 'clamp(1.5rem, 3vw, 2.1rem)',
            color: hovered ? 'var(--accent)' : 'var(--bone)',
            transition: 'color 0.3s ease',
          }}
        >
          {project.name}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-jetbrains-mono), monospace',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: 'var(--muted)',
            marginTop: '6px',
          }}
        >
          {project.type}
        </div>
        <p
          className="proj-desc"
          style={{
            fontFamily: 'var(--font-outfit), sans-serif',
            fontSize: '15px',
            lineHeight: 1.6,
            color: 'var(--bone)',
            opacity: 0.62,
            maxWidth: '58ch',
            marginTop: '14px',
          }}
        >
          {project.description}
        </p>
        <StackChips stack={project.stack} />
      </div>

      <div className="proj-right-col">
        <Badge status={project.status} />
        {!isLocked && (
          <span
            aria-hidden="true"
            style={{
              display: 'inline-block',
              fontSize: '18px',
              lineHeight: 1,
              color: hovered ? 'var(--accent)' : 'var(--muted)',
              transform: hovered ? 'translate(4px, -4px)' : 'translate(0, 0)',
              transition: 'transform 0.3s ease, color 0.3s ease',
            }}
          >
            ↗
          </span>
        )}
      </div>
    </div>
  );

  if (!isLink) {
    return <div style={rowStyle}>{rowContent}</div>;
  }

  const hoverHandlers = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  };

  if (project.external) {
    return (
      <a
        href={project.href}
        target="_blank"
        rel="noopener noreferrer"
        style={rowStyle}
        {...hoverHandlers}
      >
        {rowContent}
      </a>
    );
  }

  return (
    <Link href={project.href} style={rowStyle} {...hoverHandlers}>
      {rowContent}
    </Link>
  );
}

export default function ProjectsSection() {
  return (
    <section
      id="projects"
      style={{
        position: 'relative',
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '6rem clamp(1.5rem, 6vw, 4.5rem) 6rem clamp(1.5rem, 6vw, 4.5rem)',
        boxSizing: 'border-box',
      }}
    >
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
              Portfolio
            </span>
            <span
              style={{
                fontFamily: 'var(--font-jetbrains-mono), monospace',
                fontSize: '12px',
                color: 'var(--muted)',
              }}
            >
              ·
            </span>
            <span
              style={{
                fontFamily: 'var(--font-jetbrains-mono), monospace',
                fontSize: '12px',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
              }}
            >
              {String(PROJECTS.length).padStart(2, '0')} Entries
            </span>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-dm-serif-display), serif',
              fontWeight: 400,
              fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
              color: 'var(--bone)',
              margin: '1.25rem 0 0',
            }}
          >
            Things I&apos;ve Built
          </h2>

          <div style={{ height: '1px', background: 'var(--steel)', margin: '40px 0' }} />
        </div>
      </Reveal>

      <RevealGroup>
        {PROJECTS.map((project) => (
          <ProjectRow key={project.index} project={project} />
        ))}
      </RevealGroup>

      <style>{STYLE_TAG}</style>
    </section>
  );
}
