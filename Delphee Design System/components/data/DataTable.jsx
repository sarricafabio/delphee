import React from 'react';

/**
 * The workhorse table (esami, verbali, pendenti, appelli, certificati).
 * White raised-tile container, 14px radius, hairline border, horizontal
 * scroll inside. Header row in surface-2 (sentence case, weight 600).
 * Numeric cells render in mono, tabular, right-aligned.
 *
 * columns: [{ key, header, align?, mono?, width?, render?(row) }]
 */
export function DataTable({ columns = [], rows = [], rowKey, onRowClick, empty, style, ...rest }) {
  return (
    <div
      style={{
        background: 'linear-gradient(180deg, var(--sheen-top), var(--sheen-bot))',
        border: '1px solid var(--rim)',
        borderRadius: 'var(--r-card)',
        boxShadow: 'var(--elev-1), var(--edge-hi)',
        overflowX: 'auto',
        ...style,
      }}
      {...rest}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)' }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                style={{
                  position: 'sticky',
                  top: 0,
                  textAlign: c.align || 'left',
                  padding: 'var(--sp-3) var(--sp-4)',
                  fontSize: 'var(--t-xs)',
                  fontWeight: 'var(--w-bold)',
                  color: 'var(--ink-2)',
                  textTransform: 'none',
                  background: 'var(--surface-2)',
                  borderBottom: '1px solid var(--line)',
                  width: c.width,
                  whiteSpace: 'nowrap',
                }}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} style={{ padding: 'var(--sp-6) var(--sp-4)', color: 'var(--ink-2)', fontSize: 'var(--t-sm)' }}>
                {empty || 'Nessun dato.'}
              </td>
            </tr>
          )}
          {rows.map((row, i) => (
            <tr
              key={rowKey ? row[rowKey] : i}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              style={{
                cursor: onRowClick ? 'pointer' : undefined,
                transition: 'background var(--dur-fast) var(--ease-out)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  style={{
                    textAlign: c.align || 'left',
                    padding: 'var(--sp-3) var(--sp-4)',
                    fontSize: 'var(--t-sm)',
                    lineHeight: 'var(--lh-row)',
                    color: c.mono ? 'var(--ink-2)' : 'var(--ink)',
                    fontFamily: c.mono ? 'var(--font-mono)' : 'var(--font-body)',
                    fontVariantNumeric: c.mono ? 'tabular-nums' : undefined,
                    borderBottom: i === rows.length - 1 ? 'none' : '1px solid var(--line)',
                    whiteSpace: c.nowrap ? 'nowrap' : undefined,
                  }}
                >
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
