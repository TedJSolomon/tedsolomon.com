'use client';

import { Children, useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function RevealGroup({ children, once = true, className }) {
  const prefersReducedMotion = useReducedMotion();
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(!!prefersReducedMotion);
  }, [prefersReducedMotion]);

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.25 }}
      variants={containerVariants}
    >
      {Children.map(children, (child) => (
        <motion.div
          variants={itemVariants}
          animate={reduceMotion ? 'visible' : undefined}
          transition={reduceMotion ? { duration: 0 } : undefined}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
