'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
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

const STOP_FALLBACK_MS = 600;

// Route changes swap instantly now — no page-level opacity/transform
// animation — so there's no "exit complete" / "enter complete" moment to
// sequence off of anymore. The scroll reset and Lenis resync that used to
// run off those AnimatePresence callbacks now happen synchronously here,
// in a layout effect keyed on pathname, before the browser paints the new
// route.
export default function PageTransition({ children }) {
  const pathname = usePathname();
  const lenis = useLenis();
  const fallbackTimerRef = useRef(null);

  useIsomorphicLayoutEffect(() => {
    if (isExcludedRoute(pathname)) return undefined;

    if (!lenis) {
      window.scrollTo(0, 0);
      return undefined;
    }

    // Stopping Lenis around the forced scrollTo keeps its own
    // interpolation from fighting the instant reset. The fallback timer is
    // a hard safety net: if the synchronous start() below is ever skipped
    // (an interrupted navigation, etc.) the page can still never be left
    // permanently unscrollable.
    lenis.stop();
    fallbackTimerRef.current = setTimeout(() => {
      lenis.start();
    }, STOP_FALLBACK_MS);

    // Lenis is stopped at this point, so force: true is required or this
    // scrollTo is a no-op.
    lenis.scrollTo(0, { immediate: true, force: true });
    lenis.resize();
    lenis.start();
    lenis.resize();
    clearTimeout(fallbackTimerRef.current);

    return () => {
      clearTimeout(fallbackTimerRef.current);
    };
  }, [pathname, lenis]);

  return children;
}
