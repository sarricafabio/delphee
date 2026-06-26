import React from 'react';

/**
 * Square, icon-only ghost button (40px default). For header/toolbar
 * actions: theme toggle, logout, copy, refresh, close.
 */
export function IconButton({
  size = 'md',
  label,
  disabled = false,
  onClick,
  children,
  style,
  ...rest
}) {
  const dim = { sm: 32, md: 40, lg: 44 }[size];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: dim,
        height: dim,
        color: 'var(--ink-2)',
        background: 'transparent',
        border: '1px solid transparent',
        borderRadius: 'var(--r-ctrl)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)',
        WebkitTapHighlightColor: 'transparent',
        ...style,
      }}
      onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--ink)'; } }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-2)'; }}
      {...rest}
    >
      {children}
    </button>
  );
}
