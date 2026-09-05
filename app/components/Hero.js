'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import HeroStatusPanel from './HeroStatusPanel';

const EASE = [0.22, 1, 0.36, 1];

const KEYFRAMES = `
@keyframes heroSheen {
  0%   { background-position: -80% 0, 0 0; }
  16%  { background-position: 180% 0, 0 0; }
  100% { background-position: 180% 0, 0 0; }
}
@keyframes hero-scroll-dot {
  0% { transform: translateY(0); opacity: 0; }
  15% { opacity: 1; }
  85% { opacity: 1; }
  100% { transform: translateY(40px); opacity: 0; }
}
@supports not (background-clip: text) {
  .hero-name-gold {
    background: none !important;
    color: var(--chrome) !important;
  }
}
@media (max-width: 480px) {
  .hero-cta-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
@media (max-width: 900px) {
  .hero-layout {
    flex-direction: column;
    align-items: stretch;
  }
  .hero-text-col,
  .hero-panel-col {
    flex: 1 1 auto;
  }
}
`;

const SOCIAL_LINKS = [
  {
    key: 'linkedin',
    href: 'https://linkedin.com/in/ted-j-solomon',
    label: 'LinkedIn',
    path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
  {
    key: 'x',
    href: 'https://x.com/tedjsolomon',
    label: 'Twitter / X',
    path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  },
  {
    key: 'instagram',
    href: 'https://www.instagram.com/tedsolomon/',
    label: 'Instagram',
    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.98 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z',
  },
];

const ENTRANCE_DELAYS = {
  eyebrow: 0,
  name: 0.15,
  subline: 0.35,
  buttons: 0.5,
  social: 0.6,
  scrollCue: 0.9,
};

function EnvelopeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="18"
      height="18"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

export default function Hero() {
  const rawReducedMotion = useReducedMotion();
  const [reduceMotion, setReduceMotion] = useState(false);
  const [primaryHover, setPrimaryHover] = useState(false);
  const [ghostHover, setGhostHover] = useState(false);
  const [hoveredIcon, setHoveredIcon] = useState(null);

  useEffect(() => {
    setReduceMotion(!!rawReducedMotion);
  }, [rawReducedMotion]);

  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const contentY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const contentOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const blobY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  // A plain function transformer (rather than an input/output range array)
  // avoids Motion's scroll-linked "accelerate" fast path, which doesn't
  // clamp correctly for a sub-range of scrollYProgress like this one.
  const scrollCueOpacity = useTransform(scrollYProgress, (v) => Math.max(0, 1 - v / 0.2));

  function entranceProps(key) {
    return {
      initial: { opacity: 0, y: 20, filter: 'blur(6px)' },
      animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
      transition: reduceMotion
        ? { duration: 0 }
        : { duration: 0.8, delay: ENTRANCE_DELAYS[key], ease: EASE },
    };
  }

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        minHeight: '100svh',
        overflow: 'hidden',
        background: 'var(--void)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      {/* Ambient blobs — full-size layer so percentage-based blob positions
          stay anchored correctly even once the scroll-linked translateY
          is applied to this wrapper. */}
      <motion.div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          ...(reduceMotion ? {} : { y: blobY }),
        }}
      >
        <motion.div
          initial={false}
          animate={reduceMotion ? undefined : { x: [0, 60, 0], y: [0, 60, 0] }}
          transition={
            reduceMotion
              ? undefined
              : { duration: 20, ease: 'easeInOut', repeat: Infinity }
          }
          style={{
            position: 'absolute',
            top: 'calc(30% - 350px)',
            left: 'calc(58% - 350px)',
            width: '700px',
            height: '700px',
            background:
              'radial-gradient(circle, rgba(94,200,219,0.13) 0%, rgba(94,200,219,0) 70%)',
          }}
        />
        <motion.div
          initial={false}
          animate={reduceMotion ? undefined : { x: [0, -50, 0], y: [0, 45, 0] }}
          transition={
            reduceMotion
              ? undefined
              : { duration: 26, ease: 'easeInOut', repeat: Infinity }
          }
          style={{
            position: 'absolute',
            top: 'calc(55% - 300px)',
            left: 'calc(78% - 300px)',
            width: '600px',
            height: '600px',
            background:
              'radial-gradient(circle, rgba(184,196,212,0.06) 0%, rgba(184,196,212,0) 70%)',
          }}
        />
      </motion.div>

      {/* Background grid — blueprint texture, above the blobs, below the text */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          backgroundImage:
            'linear-gradient(rgba(232,235,240,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(232,235,240,0.028) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage:
            'radial-gradient(ellipse 90% 75% at 50% 45%, #000 40%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 90% 75% at 50% 45%, #000 40%, transparent 100%)',
        }}
      />

      {/* Content */}
      <motion.div
        style={
          reduceMotion
            ? undefined
            : { y: contentY, opacity: contentOpacity, willChange: 'transform, opacity' }
        }
      >
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: '1100px',
            margin: '0 auto',
            paddingLeft: 'clamp(1.5rem, 6vw, 4.5rem)',
            paddingRight: '1.5rem',
            boxSizing: 'border-box',
          }}
        >
          <div
            className="hero-layout"
            style={{ display: 'flex', alignItems: 'center', gap: 'clamp(2rem, 4vw, 4rem)' }}
          >
            <div
              key={reduceMotion ? 'reduced' : 'motion'}
              className="hero-text-col"
              style={{ flex: '1 1 58%', minWidth: 0 }}
            >
              {/* Rule + eyebrow */}
              <motion.div
                {...entranceProps('eyebrow')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  marginBottom: '1.75rem',
                }}
              >
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
                  Product Manager &amp; Builder
                </span>
              </motion.div>

              {/* Name */}
              <motion.h1
                className="hero-name-gold"
                {...entranceProps('name')}
                style={{
                  fontFamily: 'var(--font-dm-serif-display), serif',
                  fontWeight: 400,
                  fontSize: 'clamp(3.5rem, 11vw, 9rem)',
                  lineHeight: 0.95,
                  margin: '0 0 1.5rem',
                  backgroundImage:
                    'linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.95) 50%, transparent 62%), var(--chrome-metal)',
                  backgroundSize: '60% 100%, 100% 100%',
                  backgroundRepeat: 'no-repeat, no-repeat',
                  // Resting position while the animation is delayed (or omitted
                  // entirely under reduced motion) — genuinely off the text
                  // bounds, unlike the keyframes' own -80% start point, which
                  // still clips a sliver of highlight onto this text at this
                  // font/width. -180% clears it with margin.
                  backgroundPosition: '-180% 0, 0 0',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  textShadow: '0 1px 1px rgba(0,0,0,0.7)',
                  ...(reduceMotion
                    ? {}
                    : {
                        animationName: 'heroSheen',
                        animationDuration: '7s',
                        animationTimingFunction: 'ease-in-out',
                        animationIterationCount: 'infinite',
                        animationDelay: '0.95s',
                      }),
                }}
              >
                Ted Solomon
              </motion.h1>

              {/* Subline */}
              <motion.p
                {...entranceProps('subline')}
                style={{
                  fontFamily: 'var(--font-outfit), sans-serif',
                  fontSize: 'clamp(1.05rem, 2vw, 1.4rem)',
                  color: 'var(--bone)',
                  opacity: 0.8,
                  maxWidth: '42ch',
                  lineHeight: 1.6,
                  margin: '0 0 2.5rem',
                }}
              >
                Product Manager who builds things — at work, on the side, and from scratch.
              </motion.p>

              {/* Buttons */}
              <motion.div
                className="hero-cta-row"
                {...entranceProps('buttons')}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  marginBottom: '2.5rem',
                }}
              >
                <Link
                  href="/projects"
                  onMouseEnter={() => setPrimaryHover(true)}
                  onMouseLeave={() => setPrimaryHover(false)}
                  style={{
                    background: 'var(--chrome-metal)',
                    backgroundSize: '200% 100%',
                    backgroundPosition: primaryHover ? '100% 50%' : '0% 50%',
                    color: 'var(--void)',
                    fontFamily: 'var(--font-jetbrains-mono), monospace',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    textDecoration: 'none',
                    padding: '0.95rem 2rem',
                    display: 'inline-block',
                    boxShadow: primaryHover
                      ? 'inset 0 1px 0 rgba(255,255,255,0.65), 0 6px 28px rgba(184,196,212,0.3)'
                      : 'inset 0 1px 0 rgba(255,255,255,0.65), 0 2px 14px rgba(184,196,212,0.15)',
                    transition: 'background-position 0.5s ease, box-shadow 0.3s ease',
                  }}
                >
                  View Projects
                </Link>
                <Link
                  href="/contact"
                  onMouseEnter={() => setGhostHover(true)}
                  onMouseLeave={() => setGhostHover(false)}
                  style={{
                    background: 'transparent',
                    border: `1px solid ${ghostHover ? 'var(--accent)' : 'var(--steel)'}`,
                    color: ghostHover ? 'var(--accent)' : 'var(--bone)',
                    fontFamily: 'var(--font-jetbrains-mono), monospace',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    textDecoration: 'none',
                    padding: '0.95rem 2rem',
                    display: 'inline-block',
                    transition: 'border-color 0.3s ease, color 0.3s ease',
                  }}
                >
                  Get in Touch
                </Link>
              </motion.div>

              {/* Social row */}
              <motion.div
                {...entranceProps('social')}
                style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}
              >
                {SOCIAL_LINKS.map(({ key, href, label, path }) => (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    onMouseEnter={() => setHoveredIcon(key)}
                    onMouseLeave={() => setHoveredIcon(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      color: hoveredIcon === key ? 'var(--accent)' : 'var(--muted)',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      width="18"
                      height="18"
                    >
                      <path d={path} />
                    </svg>
                  </a>
                ))}
                <a
                  href="mailto:tedjsolomon@gmail.com"
                  aria-label="Email"
                  onMouseEnter={() => setHoveredIcon('email')}
                  onMouseLeave={() => setHoveredIcon(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: hoveredIcon === 'email' ? 'var(--accent)' : 'var(--muted)',
                    transition: 'color 0.3s ease',
                  }}
                >
                  <EnvelopeIcon />
                </a>
              </motion.div>
            </div>

            <div className="hero-panel-col" style={{ flex: '1 1 34%', display: 'flex' }}>
              <HeroStatusPanel
                key={reduceMotion ? 'reduced' : 'motion'}
                reduceMotion={reduceMotion}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        key={reduceMotion ? 'reduced' : 'motion'}
        {...entranceProps('scrollCue')}
        style={{
          position: 'absolute',
          left: 'clamp(1.5rem, 6vw, 4.5rem)',
          bottom: '2rem',
          zIndex: 1,
        }}
      >
        <motion.div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            ...(reduceMotion ? {} : { opacity: scrollCueOpacity }),
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-jetbrains-mono), monospace',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: 'var(--muted)',
            }}
          >
            Scroll
          </span>
          <div
            style={{
              position: 'relative',
              width: '1px',
              height: '40px',
              background: 'var(--accent)',
              opacity: 0.7,
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--accent)',
                transform: 'translateX(-50%)',
                animationName: reduceMotion ? 'none' : 'hero-scroll-dot',
                animationDuration: '2.4s',
                animationTimingFunction: 'ease-in-out',
                animationIterationCount: 'infinite',
                opacity: reduceMotion ? 0 : undefined,
              }}
            />
          </div>
        </motion.div>
      </motion.div>

      <style>{KEYFRAMES}</style>
    </section>
  );
}
