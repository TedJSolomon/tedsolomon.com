'use client';

import { useState, useEffect, useRef } from 'react';

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
const SESSION_KEY = 'hud-booted';

/**
 * Renders a number that counts from 0 → value during the boot sequence.
 * On non-boot renders it shows the final value immediately.
 *
 * Props:
 *   value    – final numeric value
 *   duration – animation length in ms (default 700)
 *   delay    – seconds after the hud-boot event to start (default 0)
 *   prefix   – string prepended to the display value (e.g. '$')
 *   suffix   – string appended (e.g. '°')
 */
export default function CountUp({ value, duration = 700, delay = 0, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState(0);
  const animatedRef = useRef(false);
  const rafRef = useRef(null);

  useEffect(() => {
    let active = true;

    function runAnimation() {
      if (animatedRef.current) return;
      animatedRef.current = true;

      const delayMs = delay * 1000;
      const startAt = performance.now() + delayMs;

      function tick(now) {
        if (!active) return;
        if (now < startAt) { rafRef.current = requestAnimationFrame(tick); return; }
        const t = Math.min((now - startAt) / duration, 1);
        setDisplay(Math.round(easeOutCubic(t) * value));
        if (t < 1) rafRef.current = requestAnimationFrame(tick);
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    // Listen for the boot event
    document.addEventListener('hud-boot', runAnimation, { once: true });

    // Fallback: if no boot event within 300 ms (non-boot navigation or already booted),
    // show the final value immediately without animation
    const fallbackId = setTimeout(() => {
      if (!animatedRef.current) {
        active = false;
        document.removeEventListener('hud-boot', runAnimation);
        setDisplay(value);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(fallbackId);
      document.removeEventListener('hud-boot', runAnimation);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []); // intentionally empty — only wire up once on mount

  // Keep final value in sync if the underlying data changes after animation
  useEffect(() => {
    if (animatedRef.current) setDisplay(value);
  }, [value]);

  return <>{prefix}{display}{suffix}</>;
}
