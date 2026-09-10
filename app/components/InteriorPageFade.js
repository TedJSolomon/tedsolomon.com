'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

const EASE = [0.22, 1, 0.36, 1];

// The only page-level animation on interior pages (/about, /projects,
// /blog, /contact) — a plain opacity fade, no transform. The home page
// doesn't use this; the hero's own entrance (see Hero.js) covers that
// moment there.
export default function InteriorPageFade({ children }) {
  const rawReducedMotion = useReducedMotion();
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(!!rawReducedMotion);
  }, [rawReducedMotion]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.3, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
