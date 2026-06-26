import React from 'react';

/**
 * Labelled native select, styled to match Input (well material, chevron).
 */
export function Select({
  label,
  value,
  defaultValue,
  options = [],
  disabled = false,
  id,
  onChange,
  style,
  ...rest
}) {
  const reactId = React.useId();
  const fieldId = id || reactId;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', ...style }}>
      {label && (
        <label htmlFor={fieldId} style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--t-sm)',
          fontWeight: 'var(--w-medium)',
          color: 'var(--ink-2)',
        }}>{label}</label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <select
          id={fieldId}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          onChange={onChange}
          style={{
            width: '100%',
            minHeight: 44,
            padding: '0 calc(var(--sp-3) * 2 + 8px) 0 var(--sp-3)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--t-md)',
            color: 'var(--ink)',
            background: 'var(--surface)',
            border: '1px solid var(--line-strong)',
            borderRadius: 'var(--r-ctrl)',
            boxShadow: 'var(--well)',
            appearance: 'none',
            WebkitAppearance: 'none',
            outline: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--brand)';
            e.currentTarget.style.boxShadow = 'var(--well), 0 0 0 2px var(--brand-soft)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--line-strong)';
            e.currentTarget.style.boxShadow = 'var(--well)';
          }}
          {...rest}
        >
          {options.map((o) => {
            const opt = typeof o === 'string' ? { value: o, label: o } : o;
            return <option key={opt.value} value={opt.value}>{opt.label}</option>;
          })}
        </select>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"
          style={{ position: 'absolute', right: 'var(--sp-3)', color: 'var(--ink-3)', pointerEvents: 'none' }}>
          <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
