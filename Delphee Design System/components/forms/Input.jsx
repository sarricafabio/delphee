import React from 'react';

/**
 * Labelled text input. Recessed "well" material, sentence-case label
 * above (Hanken Grotesk, never uppercase/mono), helper or error below.
 */
export function Input({
  label,
  type = 'text',
  value,
  defaultValue,
  placeholder,
  helper,
  error,
  disabled = false,
  leadingIcon = null,
  id,
  onChange,
  style,
  ...rest
}) {
  const reactId = React.useId();
  const fieldId = id || reactId;
  const invalid = Boolean(error);

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
        {leadingIcon && (
          <span style={{
            position: 'absolute', left: 'var(--sp-3)', display: 'inline-flex',
            color: 'var(--ink-3)', pointerEvents: 'none',
          }}>{leadingIcon}</span>
        )}
        <input
          id={fieldId}
          type={type}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={helper || error ? `${fieldId}-hint` : undefined}
          onChange={onChange}
          style={{
            width: '100%',
            minHeight: 44,
            padding: leadingIcon ? '0 var(--sp-3) 0 calc(var(--sp-3) * 2 + 16px)' : '0 var(--sp-3)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--t-md)',
            fontWeight: 'var(--w-body)',
            color: 'var(--ink)',
            background: 'var(--surface)',
            border: `1px solid ${invalid ? 'var(--bad)' : 'var(--line-strong)'}`,
            borderRadius: 'var(--r-ctrl)',
            boxShadow: 'var(--well)',
            outline: 'none',
            transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = invalid ? 'var(--bad)' : 'var(--brand)';
            e.currentTarget.style.boxShadow = `var(--well), 0 0 0 2px ${invalid ? 'var(--bad-bg)' : 'var(--brand-soft)'}`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = invalid ? 'var(--bad)' : 'var(--line-strong)';
            e.currentTarget.style.boxShadow = 'var(--well)';
          }}
          {...rest}
        />
      </div>
      {(error || helper) && (
        <span id={`${fieldId}-hint`} style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--t-sm)',
          color: invalid ? 'var(--bad)' : 'var(--ink-3)',
        }}>{error || helper}</span>
      )}
    </div>
  );
}
