'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Reveal from './Reveal';
import RevealGroup from './RevealGroup';
import Timeline from './Timeline';

const NARRATIVE = [
  'I spent five years in heavy civil construction. Junior estimator first, then estimator, then project engineer. The job was mostly this: count things and figure out what they cost.',
  "Once, a broken formula in a spreadsheet put rebar 40% over. One cell. That's the entire argument for better tools, and I didn't need anyone to explain it to me.",
  'In 2022 I moved to Beck Technology to help contractors get set up on DESTINI Estimator. For three and a half years I built workflows, data standards, templates, and databases with estimating teams across the country, and trained them on how to use any of it. You learn an operation pretty well when you have to encode it.',
  'Starting in late 2024 I split my time between implementation and product — running discovery, writing requirements, working with engineering — while my title still said implementation manager. That ran about fifteen months before it became official in early 2026. I now own roadmap direction for DESTINI Estimator.',
  "I'm new to the title. I'm not new to the problem.",
  'Outside of work I build things. A workout app, a newsletter, a website for a travel baseball program, an operations dashboard I open every morning. Partly to learn faster than reading about it would, partly because I like finishing things.',
];

const TRACK_RECORD = [
  {
    period: '2026 — Present',
    role: 'Product Manager',
    org: 'Beck Technology',
    current: true,
    note: 'Roadmap direction for DESTINI Estimator, preconstruction software used by general contractors nationwide.',
    bullets: [
      'Own roadmap direction and requirements for a mature enterprise product',
      'Work with engineering, design, and customer-facing teams to define and ship against real user needs',
      'Translate field and implementation experience into product decisions',
    ],
  },
  {
    period: '2022 — 2026',
    role: 'Implementation Manager',
    org: 'Beck Technology',
    note: 'Led rollouts and onboarding for contractors across the country.',
    bullets: [
      'Managed implementations across multi-office organizations',
      'Built workflows, data standards, templates, and databases with estimating teams, and trained them on all of it',
      'Split time between implementation and product from late 2024 — discovery, requirements, and roadmap work ahead of the formal title',
    ],
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
    note: 'Priced and bid heavy civil work under deadline.',
  },
  {
    period: 'Prior',
    role: 'Jr. Estimator',
    org: 'Posillico Civil Inc.',
    note: 'Takeoffs, subcontractor outreach, and bid preparation.',
  },
];

const APPROACH = [
  {
    number: '01',
    title: 'Start where the user is',
    body: "I've been on the other side of this software. Before I argue for a feature I try to picture someone using it on a bad day.",
  },
  {
    number: '02',
    title: 'Ship the small version',
    body: "The fastest way to find out if an idea works is to put a rough version in front of someone. I'd rather be corrected in a week than in a quarter.",
  },
  {
    number: '03',
    title: 'Write everything down',
    body: "I keep a running log of decisions, wins, and things I got wrong. It's less about memory and more about noticing patterns.",
  },
  {
    number: '04',
    title: 'Learn out loud',
    body: "I'm early in product. I'd rather say what I'm figuring out than pretend I've already figured it out.",
  },
];

const TOOLKIT = [
  'Product Strategy',
  'Roadmap Planning',
  'User Research',
  'Requirements Definition',
  'Stakeholder Management',
  'Cross-Functional Leadership',
  'Construction Technology',
  'Preconstruction & Estimating',
  'Data Analysis',
  'AI Product Development',
  'Prompt Engineering',
  'Next.js',
  'Supabase',
  'Figma',
];

const OFF_THE_CLOCK = [
  { label: 'New Dad', body: 'Most of my free time is currently spoken for.' },
  { label: 'Mets', body: 'Optimism, annually renewed.' },
  { label: 'Golf', body: 'Halfway decent. Not out enough.' },
  { label: 'Reading', body: 'Sci-fi and fantasy, mostly.' },
];

const STYLE_TAG = `
.about-header-layout {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 6%;
}
.about-header-text {
  flex: 0 0 58%;
  min-width: 0;
}
.about-header-portrait {
  flex: 0 0 36%;
  min-width: 0;
}
.about-work-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}
.about-clock-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
.about-toolkit-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
@media (max-width: 900px) {
  .about-clock-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 760px) {
  .about-header-layout {
    flex-direction: column-reverse;
    gap: 2rem;
  }
  .about-header-text,
  .about-header-portrait {
    flex: 1 1 auto;
    width: 100%;
  }
  .about-work-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 560px) {
  .about-clock-grid {
    grid-template-columns: 1fr;
  }
}
`;

function SectionEyebrow({ label }) {
  return (
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
        {label}
      </span>
    </div>
  );
}

function Portrait() {
  const [hovered, setHovered] = useState(false);

  return (
    <div>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'relative',
          aspectRatio: '4 / 5',
          border: '1px solid var(--steel)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <Image
          src="/ted.jpg"
          alt="Ted Solomon"
          fill
          quality={85}
          priority={false}
          sizes="(max-width: 760px) 100vw, 36vw"
          style={{
            objectFit: 'cover',
            filter: hovered ? 'grayscale(0) contrast(1)' : 'grayscale(1) contrast(1.05)',
            transition: 'filter 0.5s ease',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, var(--void) 0%, transparent 45%)',
            pointerEvents: 'none',
          }}
        />
      </div>
      <div
        style={{
          fontFamily: 'var(--font-jetbrains-mono), monospace',
          fontSize: '10px',
          color: 'var(--muted)',
          marginTop: '10px',
        }}
      >
        Farmingdale, NY
      </div>
    </div>
  );
}

function WorkCard({ item }) {
  return (
    <div
      style={{
        border: '1px solid var(--steel)',
        borderRadius: '2px',
        background: 'color-mix(in srgb, var(--surface) 40%, transparent)',
        padding: '24px',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-jetbrains-mono), monospace',
          fontSize: '11px',
          letterSpacing: '0.1em',
          color: 'var(--accent)',
          opacity: 0.7,
        }}
      >
        {item.number}
      </span>
      <div
        style={{
          fontFamily: 'var(--font-outfit), sans-serif',
          fontSize: '1.05rem',
          fontWeight: 500,
          color: 'var(--bone)',
          marginTop: '10px',
        }}
      >
        {item.title}
      </div>
      <p
        style={{
          fontFamily: 'var(--font-outfit), sans-serif',
          fontSize: '14px',
          lineHeight: 1.65,
          color: 'var(--bone)',
          opacity: 0.58,
          marginTop: '10px',
        }}
      >
        {item.body}
      </p>
    </div>
  );
}

function ToolkitChip({ label }) {
  const [hovered, setHovered] = useState(false);

  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-block',
        fontFamily: 'var(--font-jetbrains-mono), monospace',
        fontSize: '11px',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: hovered ? 'var(--bone)' : 'var(--muted)',
        padding: '5px 11px',
        border: `1px solid ${
          hovered ? 'color-mix(in srgb, var(--accent) 40%, transparent)' : 'var(--steel)'
        }`,
        borderRadius: '2px',
        background: 'transparent',
        transition: 'border-color 0.3s ease, color 0.3s ease',
      }}
    >
      {label}
    </span>
  );
}

function ClockItem({ item }) {
  return (
    <div>
      <div
        style={{
          fontFamily: 'var(--font-jetbrains-mono), monospace',
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          color: 'var(--muted)',
        }}
      >
        {item.label}
      </div>
      <p
        style={{
          fontFamily: 'var(--font-outfit), sans-serif',
          fontSize: '14px',
          lineHeight: 1.6,
          color: 'var(--bone)',
          opacity: 0.58,
          marginTop: '8px',
        }}
      >
        {item.body}
      </p>
    </div>
  );
}

function ContactCta() {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href="/contact"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        marginTop: '1.75rem',
        fontFamily: 'var(--font-jetbrains-mono), monospace',
        fontSize: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: 'var(--accent)',
        textDecoration: 'none',
      }}
    >
      Get in touch
      <span
        aria-hidden="true"
        style={{
          display: 'inline-block',
          transform: hovered ? 'translate(4px, -4px)' : 'translate(0, 0)',
          transition: 'transform 0.3s ease',
        }}
      >
        ↗
      </span>
    </Link>
  );
}

export default function AboutPageContent() {
  return (
    <div>
      <section
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '18vh clamp(1.5rem, 6vw, 4.5rem) 6rem',
          boxSizing: 'border-box',
        }}
      >
        <div className="about-header-layout">
          <div className="about-header-text">
            <Reveal>
              <div>
                <SectionEyebrow label="About" />
                <h1
                  style={{
                    fontFamily: 'var(--font-dm-serif-display), serif',
                    fontWeight: 400,
                    fontSize: 'clamp(2.4rem, 6vw, 4.2rem)',
                    lineHeight: 1.05,
                    color: 'var(--bone)',
                    margin: '1.25rem 0 0',
                  }}
                >
                  I didn&apos;t plan on product.
                </h1>
                <p
                  style={{
                    fontFamily: 'var(--font-outfit), sans-serif',
                    fontSize: '17px',
                    color: 'var(--bone)',
                    opacity: 0.62,
                    maxWidth: '44ch',
                    marginTop: '1.5rem',
                  }}
                >
                  I planned on construction. The detour turned out to be the point.
                </p>
              </div>
            </Reveal>
          </div>

          <div className="about-header-portrait">
            <Reveal delay={0.1}>
              <Portrait />
            </Reveal>
          </div>
        </div>
      </section>

      <section
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '0 clamp(1.5rem, 6vw, 4.5rem)',
          boxSizing: 'border-box',
        }}
      >
        <Reveal>
          <div style={{ maxWidth: '62ch', marginTop: '90px' }}>
            {NARRATIVE.map((paragraph, i) => (
              <p
                key={paragraph.slice(0, 24)}
                style={{
                  fontFamily: 'var(--font-outfit), sans-serif',
                  fontSize: '17px',
                  lineHeight: 1.8,
                  color: 'var(--bone)',
                  opacity: 0.72,
                  marginTop: i === 0 ? 0 : '28px',
                }}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </Reveal>
      </section>

      <section
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '90px clamp(1.5rem, 6vw, 4.5rem) 0',
          boxSizing: 'border-box',
        }}
      >
        <Reveal>
          <div style={{ marginBottom: '48px' }}>
            <SectionEyebrow label="Track Record" />
          </div>
        </Reveal>
        <div style={{ maxWidth: '640px' }}>
          <Timeline entries={TRACK_RECORD} detailed />
        </div>
      </section>

      <section
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '90px clamp(1.5rem, 6vw, 4.5rem) 0',
          boxSizing: 'border-box',
        }}
      >
        <Reveal>
          <div style={{ marginBottom: '32px' }}>
            <SectionEyebrow label="Approach" />
            <h2
              style={{
                fontFamily: 'var(--font-dm-serif-display), serif',
                fontWeight: 400,
                fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
                color: 'var(--bone)',
                margin: '1.25rem 0 0',
              }}
            >
              How I work
            </h2>
          </div>
        </Reveal>
        <RevealGroup className="about-work-grid">
          {APPROACH.map((item) => (
            <WorkCard key={item.number} item={item} />
          ))}
        </RevealGroup>
      </section>

      <section
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '90px clamp(1.5rem, 6vw, 4.5rem) 0',
          boxSizing: 'border-box',
        }}
      >
        <Reveal>
          <div style={{ marginBottom: '32px' }}>
            <SectionEyebrow label="Toolkit" />
          </div>
        </Reveal>
        <RevealGroup className="about-toolkit-wrap">
          {TOOLKIT.map((label) => (
            <ToolkitChip key={label} label={label} />
          ))}
        </RevealGroup>
      </section>

      <section
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '90px clamp(1.5rem, 6vw, 4.5rem) 0',
          boxSizing: 'border-box',
        }}
      >
        <Reveal>
          <div style={{ marginBottom: '32px' }}>
            <SectionEyebrow label="Off The Clock" />
          </div>
        </Reveal>
        <RevealGroup className="about-clock-grid">
          {OFF_THE_CLOCK.map((item) => (
            <ClockItem key={item.label} item={item} />
          ))}
        </RevealGroup>
      </section>

      <section
        style={{
          borderTop: '1px solid var(--steel)',
          marginTop: '90px',
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '70px clamp(1.5rem, 6vw, 4.5rem)',
            boxSizing: 'border-box',
          }}
        >
          <Reveal>
            <div>
              <h2
                style={{
                  fontFamily: 'var(--font-dm-serif-display), serif',
                  fontWeight: 400,
                  fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
                  color: 'var(--bone)',
                  margin: 0,
                }}
              >
                Want to talk?
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-outfit), sans-serif',
                  fontSize: '16px',
                  color: 'var(--bone)',
                  opacity: 0.62,
                  marginTop: '1rem',
                  maxWidth: '48ch',
                }}
              >
                Always up for a conversation about product, construction tech, or something
                you&apos;re building.
              </p>
              <ContactCta />
            </div>
          </Reveal>
        </div>
      </section>

      <style>{STYLE_TAG}</style>
    </div>
  );
}
