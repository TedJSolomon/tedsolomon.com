'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const EASE = [0.22, 1, 0.36, 1];
const FINAL_STATE = { opacity: 1, y: 0 };

export default function Reveal({ children, delay = 0, y = 24, once = true }) {
  const ref = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const [reduceMotion, setReduceMotion] = useState(false);
  const [alreadyInView, setAlreadyInView] = useState(false);

  useEffect(() => {
    setReduceMotion(!!prefersReducedMotion);
  }, [prefersReducedMotion]);

  // Content that's already inside the viewport at mount (e.g. above-the-fold
  // sections on the page the user just landed on) shouldn't play its
  // entrance animation on top of whatever got it there — only content the
  // user actually scrolls to should animate. Measuring in a layout effect
  // (before paint) avoids a flash of the animated-in (opacity: 0) state.
  //
  // getBoundingClientRect().top is relative to the CURRENT scroll position,
  // but on a route change this effect can run before the ancestor
  // PageTransition's own layout effect has reset scroll back to 0 (child
  // effects fire before parent effects) — so rect.top here may still be
  // relative to the previous page's scroll offset. Adding window.scrollY
  // back converts it to a position relative to the top of the document,
  // which is scroll-position-independent and correct either way, since the
  // page is always at scroll 0 by the time the user actually sees it.
  useIsomorphicLayoutEffect(() => {
    if (!ref.current) return;
    const absoluteTop = ref.current.getBoundingClientRect().top + window.scrollY;
    setAlreadyInView(absoluteTop < window.innerHeight);
  }, []);

  const skipAnimation = reduceMotion || alreadyInView;

  return (
    <motion.div
      ref={ref}
      initial={skipAnimation ? FINAL_STATE : { opacity: 0, y }}
      whileInView={skipAnimation ? undefined : FINAL_STATE}
      viewport={{ once, amount: 0.25 }}
      transition={{ duration: 0.6, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
