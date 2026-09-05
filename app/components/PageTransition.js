'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useLenis } from './SmoothScroll';

const EXCLUDED_PREFIXES = ['/dashboard', '/login'];

function isExcludedRoute(pathname) {
  return EXCLUDED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

// Same reasoning as SmoothScroll.js: avoids the "useLayoutEffect does
// nothing on the server" warning by picking the hook per-environment
// rather than guarding inside the callback.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const ENTER_EASE = [0.22, 1, 0.36, 1];
const EXIT_EASE = [0.4, 0, 1, 1];
const STOP_FALLBACK_MS = 600;

export default function PageTransition({ children }) {
  const pathname = usePathname();
  const lenis = useLenis();
  const rawReducedMotion = useReducedMotion();
  const [reduceMotion, setReduceMotion] = useState(false);
  const fallbackTimerRef = useRef(null);

  useEffect(() => {
    setReduceMotion(!!rawReducedMotion);
  }, [rawReducedMotion]);

  // The exit animation begins the instant the route (key) changes, so this
  // is where Lenis gets paused — otherwise it keeps tracking/interpolating
  // scroll against content that's mid-transition. The setTimeout is a hard
  // safety net: if onAnimationComplete never fires (an interrupted
  // animation, a fast double-navigation, etc.) the page can still never be
  // left permanently unscrollable.
  useEffect(() => {
    if (!lenis) return undefined;

    lenis.stop();
    fallbackTimerRef.current = setTimeout(() => {
      lenis.start();
    }, STOP_FALLBACK_MS);

    return () => {
      clearTimeout(fallbackTimerRef.current);
    };
  }, [pathname, lenis]);

  // Keep Lenis's measured scroll bounds in sync with the new route's
  // content height as soon as it's laid out (a page shorter or taller than
  // the last one otherwise leaves Lenis measuring the wrong document).
  useIsomorphicLayoutEffect(() => {
    lenis?.resize();
  }, [pathname, lenis]);

  if (isExcludedRoute(pathname)) {
    return children;
  }

  function handleExitComplete() {
    if (lenis) {
      // Lenis is stopped at this point (see above), so force: true is
      // required or this scrollTo is a no-op.
      lenis.scrollTo(0, { immediate: true, force: true });
      lenis.resize();
    } else {
      window.scrollTo(0, 0);
    }
  }

  function handleAnimationComplete(definition) {
    // motion.div's onAnimationComplete fires for both the enter (animate)
    // and exit targets since it's the same prop on the same element across
    // both phases. Exit is already handled by onExitComplete above, so only
    // react here when it's the enter side that just finished.
    if (definition.opacity !== 1) return;

    clearTimeout(fallbackTimerRef.current);
    lenis?.start();
    lenis?.resize();
  }

  return (
    // initial={false} tells AnimatePresence to skip the enter animation for
    // whatever is present on its very first render (page load) — the
    // hero's own entrance stagger already owns that moment. Subsequent
    // route changes (a new key showing up later) still animate normally.
    <AnimatePresence mode="wait" initial={false} onExitComplete={handleExitComplete}>
      <motion.div
        key={pathname}
        onAnimationComplete={handleAnimationComplete}
        style={{ position: 'relative', width: '100%' }}
        initial={{ opacity: 0, y: 14 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: reduceMotion ? { duration: 0 } : { duration: 0.45, ease: ENTER_EASE },
        }}
        exit={{
          opacity: 0,
          y: -12,
          transition: reduceMotion ? { duration: 0 } : { duration: 0.28, ease: EXIT_EASE },
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
