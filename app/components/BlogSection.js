'use client';

import Reveal from './Reveal';

export default function BlogSection() {
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
                Writing
              </span>
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-dm-serif-display), serif',
                fontWeight: 400,
                fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
                color: 'var(--bone)',
                margin: '1.25rem 0 0',
              }}
            >
              Nothing published yet.
            </h1>

            <p
              style={{
                fontFamily: 'var(--font-outfit), sans-serif',
                fontSize: '17px',
                lineHeight: 1.7,
                color: 'var(--bone)',
                opacity: 0.68,
                maxWidth: '50ch',
                marginTop: '1.5rem',
              }}
            >
              I&apos;m about a year into product management and still figuring a lot of it
              out. When I have something worth saying about the transition, I&apos;ll write it
              here.
            </p>

            <div
              style={{
                width: '100%',
                maxWidth: '420px',
                marginTop: '36px',
                background: 'color-mix(in srgb, var(--surface) 55%, transparent)',
                border: '1px solid var(--steel)',
                borderRadius: '2px',
                padding: '20px',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                fontFamily: 'var(--font-jetbrains-mono), monospace',
                boxSizing: 'border-box',
              }}
            >
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
                <span style={{ color: 'var(--muted)' }}>Status</span>
                <span
                  style={{
                    color: 'var(--muted)',
                    background: 'rgba(122,133,149,0.08)',
                    padding: '3px 7px',
                    borderRadius: '2px',
                    fontSize: '10px',
                  }}
                >
                  Drafting
                </span>
              </div>

              <div style={{ height: '1px', background: 'var(--steel)', margin: '16px 0' }} />

              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                <div style={{ display: 'flex', gap: '10px', padding: '3px 0' }}>
                  <span style={{ width: '90px', flexShrink: 0, textTransform: 'uppercase' }}>
                    Topics
                  </span>
                  <span>construction → product · learning in public</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', padding: '3px 0' }}>
                  <span style={{ width: '90px', flexShrink: 0, textTransform: 'uppercase' }}>
                    Cadence
                  </span>
                  <span>when there&apos;s something to say</span>
                </div>
              </div>
            </div>

            <p
              style={{
                fontFamily: 'var(--font-outfit), sans-serif',
                fontSize: '15px',
                color: 'var(--bone)',
                opacity: 0.68,
                marginTop: '28px',
              }}
            >
              In the meantime, I write a weekly tech newsletter with a friend.{' '}
              <a
                href="https://visionquest.beehiiv.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--accent)', textDecoration: 'none' }}
              >
                Vision Quest ↗
              </a>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
