/**
 * Dashboard inline style objects.
 *
 * Applied directly via style={{}} props so card appearance is guaranteed
 * on every render — zero dependency on CSS file load order.
 *
 * Layout/grid classes (bento-news, bento-weather, etc.) still live in
 * dashboard.css because they never caused refresh issues.
 */

export const card = {
  background: 'rgba(19, 22, 29, 0.85)',
  border: '1px solid rgba(232, 168, 56, 0.12)',
  boxShadow: '0 0 12px rgba(232, 168, 56, 0.04)',
  padding: '1.5rem',
  borderRadius: '8px',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.9rem',
  height: '100%',
  overflow: 'hidden',
  backdropFilter: 'none',
  WebkitBackdropFilter: 'none',
  transition: 'box-shadow 0.3s ease',
};

// Border stays identical — only the glow intensifies on hover.
export const cardHover = {
  ...card,
  boxShadow: '0 0 20px rgba(232, 168, 56, 0.1)',
};
