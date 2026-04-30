'use client';
import { useState } from 'react';
import { card, cardHover } from './styles';

/**
 * Wrapper for every bento card on the overview page.
 * - className: grid-positioning class only (bento-news, bento-weather, …)
 * - style: per-card overrides (e.g. justifyContent for the quote card)
 * Inline styles guarantee the card appearance on every refresh.
 */
export default function BentoCard({ children, className, style }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className={className}
      style={{ ...(hovered ? cardHover : card), ...style }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </div>
  );
}
