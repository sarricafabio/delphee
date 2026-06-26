import React from 'react';

/**
 * Sidebar navigation row. ink-2 → ink on hover, brand-text + 2px brand
 * left bar when active (a nav indicator, NOT a card side-stripe). Optional
 * leading icon, optional trailing chevron for expandable sections, optional
 * indent for child rows.
 */
export function NavItem({
  icon = null,
  active = false,
  expandable = false,
  expanded = false,
  indent = false,
  badge = null,
  href,
  onClick,
  children,
  style,
  ...rest
}) {
  const El = href ? 'a' : 'button';
  return (
    <El
      href={href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--sp-3)',
        width: '100%',
        textAlign: 'left',
        padding: indent ? '8px var(--sp-3) 8px calc(var(--sp-5) + 20px)' : '8px var(--sp-3) 8px var(--sp-3)',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--t-md)',
        fontWeight: active ? 'var(--w-bold)' : 'var(--w-medium)',
        color: active ? 'var(--brand-text)' : 'var(--ink-2)',
        background: active ? 'var(--brand-soft)' : 'transparent',
        border: 'none',
        borderRadius: 'var(--r-ctrl)',
        cursor: 'pointer',
        textDecoration: 'none',
        transition: 'background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)',
        ...style,
      }}
      onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--ink)'; } }}
      onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-2)'; } }}
      {...rest}
    >
      {active && (
        <span aria-hidden="true" style={{
          position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
          width: 2, height: '60%', borderRadius: 2, background: 'var(--brand)',
        }} />
      )}
      {icon && <span style={{ display: 'inline-flex', flexShrink: 0, color: 'currentColor' }}>{icon}</span>}
      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{children}</span>
      {badge}
      {expandable && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"
          style={{ flexShrink: 0, color: 'var(--ink-3)', transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform var(--dur-fast) var(--ease-out)' }}>
          <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </El>
  );
}
