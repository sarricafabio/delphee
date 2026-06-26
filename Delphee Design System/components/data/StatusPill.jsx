import React from 'react';

/**
 * Status indicator — a single shape: square 5px-radius pill, Hanken
 * Grotesk t-xs weight 600. Status, not decoration. No dot, no all-caps,
 * no mono. Pick a `tone` or pass `bg`/`color` for a custom pairing.
 */
export function StatusPill({ tone = 'neutral', solid = false, children, style, ...rest }) {
  const tones = {
    brand:   { bg: 'var(--brand)',   color: 'var(--on-brand)', soft: false },
    ok:      { bg: 'var(--ok-bg)',   color: 'var(--ok)' },
    warn:    { bg: 'var(--warn-bg)', color: 'var(--warn)' },
    bad:     { bg: 'var(--bad-bg)',  color: 'var(--bad)' },
    info:    { bg: 'var(--info-bg)', color: 'var(--info)' },
    neutral: { bg: 'var(--surface-2)', color: 'var(--ink-3)' },
    ink:     { bg: 'var(--ink)',     color: 'var(--surface)', soft: false },
  };
  const t = tones[tone] || tones.neutral;
  const filled = solid || t.soft === false;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px var(--sp-2)',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--t-xs)',
        fontWeight: 'var(--w-bold)',
        lineHeight: 1.5,
        letterSpacing: 0,
        color: filled ? t.color : t.color,
        background: t.bg,
        borderRadius: 'var(--r-chip)',
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
