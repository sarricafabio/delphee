import React from 'react';

/**
 * Raised tile — the depth language for content that genuinely needs
 * elevation (anagrafica head, tasse rate row, hero lozenge). Sheen
 * gradient fill + elev-1 + lit top edge + hairline rim. Lifts on hover
 * when `interactive`. Most list rows are NOT cards — use a plain row.
 */
export function Card({
  interactive = false,
  hero = false,
  padding = 'var(--sp-5)',
  as = 'div',
  children,
  style,
  ...rest
}) {
  const El = as;
  const base = {
    position: 'relative',
    padding,
    borderRadius: 'var(--r-card)',
    border: '1px solid var(--rim)',
    background: hero
      ? 'linear-gradient(180deg, var(--brand-soft), var(--surface))'
      : 'linear-gradient(180deg, var(--sheen-top), var(--sheen-bot))',
    boxShadow: hero ? 'var(--elev-2), var(--edge-hi)' : 'var(--elev-1), var(--edge-hi)',
    transition: 'transform var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
  };
  return (
    <El
      style={{ ...base, cursor: interactive ? 'pointer' : undefined, ...style }}
      onMouseEnter={interactive ? (e) => {
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = 'var(--elev-2), var(--edge-hi)';
      } : undefined}
      onMouseLeave={interactive ? (e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = base.boxShadow;
      } : undefined}
      {...rest}
    >
      {children}
    </El>
  );
}
