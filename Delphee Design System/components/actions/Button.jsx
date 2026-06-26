import React from 'react';

/**
 * Delphee primary action. Solid brand fill with a glossy sheen for the
 * primary variant; quieter secondary/ghost for everything else.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  icon = null,
  iconRight = null,
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  children,
  style,
  ...rest
}) {
  const sizes = {
    sm: { minHeight: 32, padding: '0 var(--sp-3)', fontSize: 'var(--t-sm)', gap: 'var(--sp-1)' },
    md: { minHeight: 40, padding: '0 var(--sp-4)', fontSize: 'var(--t-sm)', gap: 'var(--sp-2)' },
    lg: { minHeight: 48, padding: '0 var(--sp-5)', fontSize: 'var(--t-md)', gap: 'var(--sp-2)' },
  }[size];

  const variants = {
    primary: {
      color: 'var(--on-brand)',
      background: 'linear-gradient(180deg, oklch(0.55 0.137 152), var(--brand))',
      border: '1px solid transparent',
      boxShadow: 'var(--brand-glow), inset 0 1px 0 oklch(1 0 0 / 0.25)',
    },
    secondary: {
      color: 'var(--ink)',
      background: 'var(--surface)',
      border: '1px solid var(--line-strong)',
      boxShadow: 'var(--elev-1)',
    },
    ghost: {
      color: 'var(--ink-2)',
      background: 'transparent',
      border: '1px solid transparent',
      boxShadow: 'none',
    },
  }[variant];

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      data-variant={variant}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: sizes.gap,
        width: fullWidth ? '100%' : undefined,
        minHeight: sizes.minHeight,
        padding: sizes.padding,
        fontFamily: 'var(--font-body)',
        fontSize: sizes.fontSize,
        fontWeight: 'var(--w-bold)',
        lineHeight: 1,
        borderRadius: 'var(--r-ctrl)',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled && !loading ? 0.5 : 1,
        transition: 'background var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out)',
        WebkitTapHighlightColor: 'transparent',
        ...variants,
        ...style,
      }}
      onMouseDown={(e) => { if (!isDisabled) e.currentTarget.style.transform = 'scale(0.985)'; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = ''; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ''; }}
      {...rest}
    >
      {loading && <Spinner />}
      {!loading && icon}
      {children && <span>{children}</span>}
      {!loading && iconRight}
    </button>
  );
}

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"
      style={{ animation: 'dw-spin 0.7s linear infinite' }}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <style>{'@keyframes dw-spin{to{transform:rotate(360deg)}}'}</style>
    </svg>
  );
}
