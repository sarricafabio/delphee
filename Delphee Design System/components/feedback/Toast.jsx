import React from 'react';

/**
 * Toast — glass surface, semantic icon on the left (no dot, no side
 * stripe), dismissible. Bottom-right on desktop, top on mobile. Pair with
 * your own positioning container (ToastViewport) or place inline.
 */
export function Toast({ tone = 'info', icon = null, title, children, onDismiss, style, ...rest }) {
  const color = {
    ok: 'var(--ok)', warn: 'var(--warn)', bad: 'var(--bad)', info: 'var(--info)', brand: 'var(--brand-text)',
  }[tone] || 'var(--info)';

  return (
    <div
      role="status"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--sp-3)',
        minWidth: 280,
        maxWidth: 420,
        padding: 'var(--sp-3) var(--sp-4)',
        background: 'var(--glass)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--rim)',
        borderRadius: 'var(--r-card)',
        boxShadow: 'var(--elev-2), var(--edge-hi)',
        ...style,
      }}
      {...rest}
    >
      {icon && <span style={{ display: 'inline-flex', color, flexShrink: 0, marginTop: 1 }}>{icon}</span>}
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <div style={{
            fontFamily: 'var(--font-body)', fontSize: 'var(--t-sm)',
            fontWeight: 'var(--w-bold)', color: 'var(--ink)',
          }}>{title}</div>
        )}
        {children && (
          <div style={{
            fontFamily: 'var(--font-body)', fontSize: 'var(--t-sm)',
            color: 'var(--ink-2)', marginTop: title ? 2 : 0,
          }}>{children}</div>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          aria-label="Chiudi"
          onClick={onDismiss}
          style={{
            display: 'inline-flex', flexShrink: 0, padding: 2, marginRight: -4,
            color: 'var(--ink-3)', background: 'transparent', border: 'none',
            borderRadius: 'var(--r-chip)', cursor: 'pointer',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
