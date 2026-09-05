'use client';

import { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';

const EXCLUDED_PREFIXES = ['/dashboard', '/login'];

function isExcludedRoute(pathname) {
  return EXCLUDED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

const LenisContext = createContext(null);

// Returns the active Lenis instance, or null on excluded routes / reduced
// motion / before it has initialized.
export function useLenis() {
  return useContext(LenisContext);
}

// React warns if useLayoutEffect is called during server rendering (Next.js
// still renders 'use client' components server-side for the initial HTML).
// The standard fix is to pick the hook based on environment, not to guard
// inside the effect body — by the time the callback runs it's always
// client-side anyway, so an internal typeof-window check doesn't stop the
// warning; only calling a different hook does.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function SmoothScroll({ children }) {
  const pathname = usePathname();
  const [lenis, setLenis] = useState(null);

  useIsomorphicLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (isExcludedRoute(pathname)) return undefined;

    // Browsers restore the previous scroll position on refresh by default,
    // which fights Lenis's own mount-time state and reads as a jump/hitch.
    // Take manual control and force the top before Lenis (or anything else)
    // has a chance to paint.
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const lenisInstance = new Lenis();
    setLenis(lenisInstance);

    let rafId = requestAnimationFrame(function raf(time) {
      lenisInstance.raf(time);
      rafId = requestAnimationFrame(raf);
    });

    function handleHashLinkClick(e) {
      const link = e.target.closest('a[href*="#"]');
      if (!link) return;

      const url = new URL(link.href, window.location.origin);
      if (url.pathname !== window.location.pathname || !url.hash) return;

      const target = document.querySelector(url.hash);
      if (!target) return;

      e.preventDefault();
      lenisInstance.scrollTo(target);
    }

    document.addEventListener('click', handleHashLinkClick);

    return () => {
      document.removeEventListener('click', handleHashLinkClick);
      cancelAnimationFrame(rafId);
      lenisInstance.destroy();
      setLenis(null);
    };
  }, [pathname]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
