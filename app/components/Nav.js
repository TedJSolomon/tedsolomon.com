'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react';
import { useLenis } from './SmoothScroll';

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

const EXCLUDED_PREFIXES = ['/dashboard', '/login'];

function isExcludedRoute(pathname) {
  return EXCLUDED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

// Same reasoning as SmoothScroll.js / PageTransition.js: avoids the
// "useLayoutEffect does nothing on the server" warning by picking the hook
// per-environment rather than guarding inside the callback.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const EASE = [0.22, 1, 0.36, 1];

const STYLE_TAG = `
.nav-links-desktop {
  display: flex;
}
.nav-toggle-btn {
  display: none;
}
@media (max-width: 820px) {
  .nav-links-desktop {
    display: none;
  }
  .nav-toggle-btn {
    display: flex;
  }
}
`;

export default function Nav() {
  const pathname = usePathname();
  const lenis = useLenis();
  const rawReducedMotion = useReducedMotion();
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(!!rawReducedMotion);
  }, [rawReducedMotion]);

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 80);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const [menuOpen, setMenuOpen] = useState(false);
  const [logoHover, setLogoHover] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);

  // Exactly one underline element exists in the tree at all times — its
  // position is measured off whichever link is currently active, rather
  // than the underline itself being conditionally mounted/unmounted inside
  // the active link. That conditional-per-link approach is what let the
  // shared layoutId animation glitch (flash / double-render) during a
  // route change, since the old and new instances aren't guaranteed to
  // overlap cleanly for Motion's FLIP measurement.
  const linkRefs = useRef({});
  const [underlineRect, setUnderlineRect] = useState({ left: 0, width: 0, opacity: 0 });

  useIsomorphicLayoutEffect(() => {
    const activeLink = linkRefs.current[pathname];
    if (activeLink) {
      setUnderlineRect({ left: activeLink.offsetLeft, width: activeLink.offsetWidth, opacity: 1 });
    } else {
      setUnderlineRect((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [pathname]);

  // Lock body scroll and pause Lenis while the mobile overlay is open.
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      lenis?.stop();
    } else {
      document.body.style.overflow = '';
      lenis?.start();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen, lenis]);

  // Close on Escape.
  useEffect(() => {
    if (!menuOpen) return undefined;
    function onKeyDown(e) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  // Close whenever the route actually changes (covers link taps too).
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  if (isExcludedRoute(pathname)) {
    return null;
  }

  return (
    <LayoutGroup>
      <nav
        className="site-nav"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 100,
          height: scrolled ? '58px' : '68px',
          padding: '0 clamp(1.5rem, 6vw, 4.5rem)',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: scrolled ? 'rgba(7,9,12,0.72)' : 'transparent',
          backdropFilter: scrolled ? 'blur(14px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(14px)' : 'none',
          borderBottom: `1px solid ${scrolled ? 'var(--steel)' : 'transparent'}`,
          transition:
            'height 0.35s ease, background 0.35s ease, backdrop-filter 0.35s ease, border-color 0.35s ease',
        }}
      >
        <Link
          href="/"
          onMouseEnter={() => setLogoHover(true)}
          onMouseLeave={() => setLogoHover(false)}
          style={{
            fontFamily: 'var(--font-dm-serif-display), serif',
            fontSize: '1.35rem',
            color: 'var(--bone)',
            textDecoration: 'none',
            letterSpacing: '-0.02em',
          }}
        >
          ted
          <span
            style={{
              color: 'var(--accent)',
              filter: logoHover ? 'brightness(1.5)' : 'brightness(1)',
              transition: 'filter 0.25s ease',
            }}
          >
            .
          </span>
        </Link>

        <div
          className="nav-links-desktop"
          style={{ alignItems: 'center', gap: '28px', position: 'relative' }}
        >
          {NAV_ITEMS.map(({ href, label }) => {
            const isActive = pathname === href;
            const isHovered = hoveredLink === href;
            return (
              <Link
                key={href}
                href={href}
                ref={(el) => {
                  linkRefs.current[href] = el;
                }}
                onMouseEnter={() => setHoveredLink(href)}
                onMouseLeave={() => setHoveredLink(null)}
                style={{
                  position: 'relative',
                  fontFamily: 'var(--font-jetbrains-mono), monospace',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.16em',
                  color: isActive || isHovered ? 'var(--bone)' : 'var(--muted)',
                  textDecoration: 'none',
                  paddingBottom: '8px',
                  transition: 'color 0.25s ease',
                }}
              >
                {label}
              </Link>
            );
          })}
          <motion.div
            // Omitting layoutId entirely under reduced motion (rather than
            // just zeroing the transition duration) — Motion's FLIP-based
            // layout animation doesn't respect duration: 0 the way a
            // normal animate transition does, so the shared-layout slide
            // still played. With no layoutId, the underline just appears
            // at its position, no animation possible.
            layoutId={reduceMotion ? undefined : 'nav-active-underline'}
            style={{
              position: 'absolute',
              bottom: '4px',
              height: '1px',
              background: 'var(--accent)',
              willChange: 'transform',
              left: underlineRect.left,
              width: underlineRect.width,
              opacity: underlineRect.opacity,
            }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          />
        </div>

        <button
          type="button"
          className="nav-toggle-btn"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            position: 'relative',
          }}
        >
          <span
            style={{
              position: 'absolute',
              width: '20px',
              height: '1px',
              background: 'var(--bone)',
              transition: 'transform 0.3s ease',
              transform: menuOpen ? 'translateY(0) rotate(45deg)' : 'translateY(-3px) rotate(0deg)',
            }}
          />
          <span
            style={{
              position: 'absolute',
              width: '20px',
              height: '1px',
              background: 'var(--bone)',
              transition: 'transform 0.3s ease',
              transform: menuOpen ? 'translateY(0) rotate(-45deg)' : 'translateY(3px) rotate(0deg)',
            }}
          />
        </button>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.3, ease: EASE }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99,
              background: 'rgba(7,9,12,0.97)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '28px',
            }}
          >
            {NAV_ITEMS.map(({ href, label }, i) => (
              <motion.div
                key={href}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: 0.4, delay: i * 0.06, ease: EASE }
                }
              >
                <Link
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    fontFamily: 'var(--font-dm-serif-display), serif',
                    fontSize: '2rem',
                    color: 'var(--bone)',
                    textDecoration: 'none',
                  }}
                >
                  {label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{STYLE_TAG}</style>
    </LayoutGroup>
  );
}
