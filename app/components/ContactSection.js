'use client';

import { useState } from 'react';
import Reveal from './Reveal';
import RevealGroup from './RevealGroup';

const CHANNELS = [
  {
    label: 'Email',
    value: 'tedjsolomon@gmail.com',
    href: 'mailto:tedjsolomon@gmail.com',
    external: false,
  },
  {
    label: 'LinkedIn',
    value: '/in/ted-j-solomon',
    href: 'https://linkedin.com/in/ted-j-solomon',
    external: true,
  },
  {
    label: 'X',
    value: '@tedjsolomon',
    href: 'https://x.com/tedjsolomon',
    external: true,
  },
  {
    label: 'Instagram',
    value: '@tedsolomon',
    href: 'https://www.instagram.com/tedsolomon/',
    external: true,
  },
];

function ChannelRow({ channel }) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={channel.href}
      {...(channel.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '130px 1fr auto',
        alignItems: 'center',
        columnGap: '16px',
        padding: '22px 0',
        borderBottom: `1px solid ${
          hovered ? 'color-mix(in srgb, var(--accent) 35%, transparent)' : 'var(--steel)'
        }`,
        background: hovered ? 'rgba(232,235,240,0.022)' : 'transparent',
        textDecoration: 'none',
        transition: 'background 0.3s ease, border-color 0.3s ease',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-jetbrains-mono), monospace',
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          color: 'var(--muted)',
        }}
      >
        {channel.label}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-outfit), sans-serif',
          fontSize: '16px',
          color: hovered ? 'var(--accent)' : 'var(--bone)',
          transition: 'color 0.3s ease',
        }}
      >
        {channel.value}
      </span>
      <span
        aria-hidden="true"
        style={{
          fontSize: '16px',
          color: 'var(--muted)',
          transform: hovered ? 'translate(4px, -4px)' : 'translate(0, 0)',
          transition: 'transform 0.3s ease',
        }}
      >
        ↗
      </span>
    </a>
  );
}

export default function ContactSection() {
  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1100px',
          margin: '0 auto',
          paddingLeft: 'clamp(1.5rem, 6vw, 4.5rem)',
          paddingRight: '1.5rem',
          paddingTop: '6rem',
          paddingBottom: '6rem',
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
                Contact
              </span>
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-dm-serif-display), serif',
                fontWeight: 400,
                fontSize: 'clamp(2.4rem, 6vw, 4rem)',
                color: 'var(--bone)',
                margin: '1.25rem 0 0',
              }}
            >
              Let&apos;s talk.
            </h1>

            <p
              style={{
                fontFamily: 'var(--font-outfit), sans-serif',
                fontSize: '17px',
                lineHeight: 1.7,
                color: 'var(--bone)',
                opacity: 0.68,
                maxWidth: '48ch',
                marginTop: '1.5rem',
              }}
            >
              Interested in product management, building something cool, or just want to
              connect — I&apos;m always up for a conversation.
            </p>
          </div>
        </Reveal>

        <div style={{ marginTop: '44px', maxWidth: '620px' }}>
          <RevealGroup>
            {CHANNELS.map((channel) => (
              <ChannelRow key={channel.label} channel={channel} />
            ))}
          </RevealGroup>
        </div>

        <div
          style={{
            marginTop: '36px',
            fontFamily: 'var(--font-jetbrains-mono), monospace',
            fontSize: '11px',
            color: 'var(--muted)',
          }}
        >
          Based in Farmingdale, NY · Usually reply within a day
        </div>
      </div>
    </section>
  );
}
