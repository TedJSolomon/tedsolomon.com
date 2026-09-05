'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react';

const EXCLUDED_PREFIXES = ['/dashboard', '/login'];

function isExcludedRoute(pathname) {
  return EXCLUDED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export default function ScrollProgressBar() {
  const pathname = usePathname();
  const rawReducedMotion = useReducedMotion();
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(!!rawReducedMotion);
  }, [rawReducedMotion]);

  const { scrollYProgress } = useScroll();
  const springProgress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  const [visible, setVisible] = useState(false);
  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 0);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (isExcludedRoute(pathname)) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '1px',
        background: 'var(--accent)',
        transformOrigin: 'left',
        zIndex: 101,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.2s ease',
        scaleX: reduceMotion ? scrollYProgress : springProgress,
        willChange: 'transform, opacity',
      }}
    />
  );
}
