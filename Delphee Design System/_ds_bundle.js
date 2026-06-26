/* @ds-bundle: {"format":3,"namespace":"DelpheeDesignSystem_900988","components":[{"name":"Button","sourcePath":"components/actions/Button.jsx"},{"name":"IconButton","sourcePath":"components/actions/IconButton.jsx"},{"name":"Card","sourcePath":"components/data/Card.jsx"},{"name":"DataTable","sourcePath":"components/data/DataTable.jsx"},{"name":"StatusPill","sourcePath":"components/data/StatusPill.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"NavItem","sourcePath":"components/navigation/NavItem.jsx"}],"sourceHashes":{"components/actions/Button.jsx":"c578a74fb832","components/actions/IconButton.jsx":"bec88dc795b2","components/data/Card.jsx":"14cefb690f80","components/data/DataTable.jsx":"f610e437c958","components/data/StatusPill.jsx":"72ebfd4baa32","components/feedback/Toast.jsx":"1d39c8396e6e","components/forms/Input.jsx":"bb013cbeb3fa","components/forms/Select.jsx":"cf9578f9021c","components/navigation/NavItem.jsx":"04d0234cb47a","ui_kits/delphi-wrapper/App.jsx":"c025583ffbec","ui_kits/delphi-wrapper/AppShell.jsx":"b911db9d3ff0","ui_kits/delphi-wrapper/EsamiScreen.jsx":"cd56675946d3","ui_kits/delphi-wrapper/HomeScreen.jsx":"811bf337f1ca","ui_kits/delphi-wrapper/LoginScreen.jsx":"e8914799c68f","ui_kits/delphi-wrapper/TasseScreen.jsx":"b90b876d5d06"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.DelpheeDesignSystem_900988 = window.DelpheeDesignSystem_900988 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/actions/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Delphee primary action. Solid brand fill with a glossy sheen for the
 * primary variant; quieter secondary/ghost for everything else.
 */
function Button({
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
    sm: {
      minHeight: 32,
      padding: '0 var(--sp-3)',
      fontSize: 'var(--t-sm)',
      gap: 'var(--sp-1)'
    },
    md: {
      minHeight: 40,
      padding: '0 var(--sp-4)',
      fontSize: 'var(--t-sm)',
      gap: 'var(--sp-2)'
    },
    lg: {
      minHeight: 48,
      padding: '0 var(--sp-5)',
      fontSize: 'var(--t-md)',
      gap: 'var(--sp-2)'
    }
  }[size];
  const variants = {
    primary: {
      color: 'var(--on-brand)',
      background: 'linear-gradient(180deg, oklch(0.55 0.137 152), var(--brand))',
      border: '1px solid transparent',
      boxShadow: 'var(--brand-glow), inset 0 1px 0 oklch(1 0 0 / 0.25)'
    },
    secondary: {
      color: 'var(--ink)',
      background: 'var(--surface)',
      border: '1px solid var(--line-strong)',
      boxShadow: 'var(--elev-1)'
    },
    ghost: {
      color: 'var(--ink-2)',
      background: 'transparent',
      border: '1px solid transparent',
      boxShadow: 'none'
    }
  }[variant];
  const isDisabled = disabled || loading;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    onClick: onClick,
    disabled: isDisabled,
    "aria-busy": loading || undefined,
    "data-variant": variant,
    style: {
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
      ...style
    },
    onMouseDown: e => {
      if (!isDisabled) e.currentTarget.style.transform = 'scale(0.985)';
    },
    onMouseUp: e => {
      e.currentTarget.style.transform = '';
    },
    onMouseLeave: e => {
      e.currentTarget.style.transform = '';
    }
  }, rest), loading && /*#__PURE__*/React.createElement(Spinner, null), !loading && icon, children && /*#__PURE__*/React.createElement("span", null, children), !loading && iconRight);
}
function Spinner() {
  return /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": "true",
    style: {
      animation: 'dw-spin 0.7s linear infinite'
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9",
    stroke: "currentColor",
    strokeOpacity: "0.3",
    strokeWidth: "3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M21 12a9 9 0 0 0-9-9",
    stroke: "currentColor",
    strokeWidth: "3",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("style", null, '@keyframes dw-spin{to{transform:rotate(360deg)}}'));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/Button.jsx", error: String((e && e.message) || e) }); }

// components/actions/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Square, icon-only ghost button (40px default). For header/toolbar
 * actions: theme toggle, logout, copy, refresh, close.
 */
function IconButton({
  size = 'md',
  label,
  disabled = false,
  onClick,
  children,
  style,
  ...rest
}) {
  const dim = {
    sm: 32,
    md: 40,
    lg: 44
  }[size];
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    onClick: onClick,
    disabled: disabled,
    "aria-label": label,
    title: label,
    style: {
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
      ...style
    },
    onMouseEnter: e => {
      if (!disabled) {
        e.currentTarget.style.background = 'var(--surface-2)';
        e.currentTarget.style.color = 'var(--ink)';
      }
    },
    onMouseLeave: e => {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.color = 'var(--ink-2)';
    }
  }, rest), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/data/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Raised tile — the depth language for content that genuinely needs
 * elevation (anagrafica head, tasse rate row, hero lozenge). Sheen
 * gradient fill + elev-1 + lit top edge + hairline rim. Lifts on hover
 * when `interactive`. Most list rows are NOT cards — use a plain row.
 */
function Card({
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
    background: hero ? 'linear-gradient(180deg, var(--brand-soft), var(--surface))' : 'linear-gradient(180deg, var(--sheen-top), var(--sheen-bot))',
    boxShadow: hero ? 'var(--elev-2), var(--edge-hi)' : 'var(--elev-1), var(--edge-hi)',
    transition: 'transform var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)'
  };
  return /*#__PURE__*/React.createElement(El, _extends({
    style: {
      ...base,
      cursor: interactive ? 'pointer' : undefined,
      ...style
    },
    onMouseEnter: interactive ? e => {
      e.currentTarget.style.transform = 'translateY(-1px)';
      e.currentTarget.style.boxShadow = 'var(--elev-2), var(--edge-hi)';
    } : undefined,
    onMouseLeave: interactive ? e => {
      e.currentTarget.style.transform = '';
      e.currentTarget.style.boxShadow = base.boxShadow;
    } : undefined
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Card.jsx", error: String((e && e.message) || e) }); }

// components/data/DataTable.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * The workhorse table (esami, verbali, pendenti, appelli, certificati).
 * White raised-tile container, 14px radius, hairline border, horizontal
 * scroll inside. Header row in surface-2 (sentence case, weight 600).
 * Numeric cells render in mono, tabular, right-aligned.
 *
 * columns: [{ key, header, align?, mono?, width?, render?(row) }]
 */
function DataTable({
  columns = [],
  rows = [],
  rowKey,
  onRowClick,
  empty,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      background: 'linear-gradient(180deg, var(--sheen-top), var(--sheen-bot))',
      border: '1px solid var(--rim)',
      borderRadius: 'var(--r-card)',
      boxShadow: 'var(--elev-1), var(--edge-hi)',
      overflowX: 'auto',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontFamily: 'var(--font-body)'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, columns.map(c => /*#__PURE__*/React.createElement("th", {
    key: c.key,
    scope: "col",
    style: {
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
      whiteSpace: 'nowrap'
    }
  }, c.header)))), /*#__PURE__*/React.createElement("tbody", null, rows.length === 0 && /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: columns.length,
    style: {
      padding: 'var(--sp-6) var(--sp-4)',
      color: 'var(--ink-2)',
      fontSize: 'var(--t-sm)'
    }
  }, empty || 'Nessun dato.')), rows.map((row, i) => /*#__PURE__*/React.createElement("tr", {
    key: rowKey ? row[rowKey] : i,
    onClick: onRowClick ? () => onRowClick(row) : undefined,
    style: {
      cursor: onRowClick ? 'pointer' : undefined,
      transition: 'background var(--dur-fast) var(--ease-out)'
    },
    onMouseEnter: e => {
      e.currentTarget.style.background = 'var(--surface-2)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.background = 'transparent';
    }
  }, columns.map(c => /*#__PURE__*/React.createElement("td", {
    key: c.key,
    style: {
      textAlign: c.align || 'left',
      padding: 'var(--sp-3) var(--sp-4)',
      fontSize: 'var(--t-sm)',
      lineHeight: 'var(--lh-row)',
      color: c.mono ? 'var(--ink-2)' : 'var(--ink)',
      fontFamily: c.mono ? 'var(--font-mono)' : 'var(--font-body)',
      fontVariantNumeric: c.mono ? 'tabular-nums' : undefined,
      borderBottom: i === rows.length - 1 ? 'none' : '1px solid var(--line)',
      whiteSpace: c.nowrap ? 'nowrap' : undefined
    }
  }, c.render ? c.render(row) : row[c.key])))))));
}
Object.assign(__ds_scope, { DataTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/DataTable.jsx", error: String((e && e.message) || e) }); }

// components/data/StatusPill.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Status indicator — a single shape: square 5px-radius pill, Hanken
 * Grotesk t-xs weight 600. Status, not decoration. No dot, no all-caps,
 * no mono. Pick a `tone` or pass `bg`/`color` for a custom pairing.
 */
function StatusPill({
  tone = 'neutral',
  solid = false,
  children,
  style,
  ...rest
}) {
  const tones = {
    brand: {
      bg: 'var(--brand)',
      color: 'var(--on-brand)',
      soft: false
    },
    ok: {
      bg: 'var(--ok-bg)',
      color: 'var(--ok)'
    },
    warn: {
      bg: 'var(--warn-bg)',
      color: 'var(--warn)'
    },
    bad: {
      bg: 'var(--bad-bg)',
      color: 'var(--bad)'
    },
    info: {
      bg: 'var(--info-bg)',
      color: 'var(--info)'
    },
    neutral: {
      bg: 'var(--surface-2)',
      color: 'var(--ink-3)'
    },
    ink: {
      bg: 'var(--ink)',
      color: 'var(--surface)',
      soft: false
    }
  };
  const t = tones[tone] || tones.neutral;
  const filled = solid || t.soft === false;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
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
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { StatusPill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/StatusPill.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Toast — glass surface, semantic icon on the left (no dot, no side
 * stripe), dismissible. Bottom-right on desktop, top on mobile. Pair with
 * your own positioning container (ToastViewport) or place inline.
 */
function Toast({
  tone = 'info',
  icon = null,
  title,
  children,
  onDismiss,
  style,
  ...rest
}) {
  const color = {
    ok: 'var(--ok)',
    warn: 'var(--warn)',
    bad: 'var(--bad)',
    info: 'var(--info)',
    brand: 'var(--brand-text)'
  }[tone] || 'var(--info)';
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "status",
    style: {
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
      ...style
    }
  }, rest), icon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      color,
      flexShrink: 0,
      marginTop: 1
    }
  }, icon), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--t-sm)',
      fontWeight: 'var(--w-bold)',
      color: 'var(--ink)'
    }
  }, title), children && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--t-sm)',
      color: 'var(--ink-2)',
      marginTop: title ? 2 : 0
    }
  }, children)), onDismiss && /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Chiudi",
    onClick: onDismiss,
    style: {
      display: 'inline-flex',
      flexShrink: 0,
      padding: 2,
      marginRight: -4,
      color: 'var(--ink-3)',
      background: 'transparent',
      border: 'none',
      borderRadius: 'var(--r-chip)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 6 6 18M6 6l12 12",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round"
  }))));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Labelled text input. Recessed "well" material, sentence-case label
 * above (Hanken Grotesk, never uppercase/mono), helper or error below.
 */
function Input({
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
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-2)',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: fieldId,
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--t-sm)',
      fontWeight: 'var(--w-medium)',
      color: 'var(--ink-2)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    }
  }, leadingIcon && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: 'var(--sp-3)',
      display: 'inline-flex',
      color: 'var(--ink-3)',
      pointerEvents: 'none'
    }
  }, leadingIcon), /*#__PURE__*/React.createElement("input", _extends({
    id: fieldId,
    type: type,
    value: value,
    defaultValue: defaultValue,
    placeholder: placeholder,
    disabled: disabled,
    "aria-invalid": invalid || undefined,
    "aria-describedby": helper || error ? `${fieldId}-hint` : undefined,
    onChange: onChange,
    style: {
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
      transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)'
    },
    onFocus: e => {
      e.currentTarget.style.borderColor = invalid ? 'var(--bad)' : 'var(--brand)';
      e.currentTarget.style.boxShadow = `var(--well), 0 0 0 2px ${invalid ? 'var(--bad-bg)' : 'var(--brand-soft)'}`;
    },
    onBlur: e => {
      e.currentTarget.style.borderColor = invalid ? 'var(--bad)' : 'var(--line-strong)';
      e.currentTarget.style.boxShadow = 'var(--well)';
    }
  }, rest))), (error || helper) && /*#__PURE__*/React.createElement("span", {
    id: `${fieldId}-hint`,
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--t-sm)',
      color: invalid ? 'var(--bad)' : 'var(--ink-3)'
    }
  }, error || helper));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Labelled native select, styled to match Input (well material, chevron).
 */
function Select({
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
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-2)',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: fieldId,
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--t-sm)',
      fontWeight: 'var(--w-medium)',
      color: 'var(--ink-2)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: fieldId,
    value: value,
    defaultValue: defaultValue,
    disabled: disabled,
    onChange: onChange,
    style: {
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
      transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)'
    },
    onFocus: e => {
      e.currentTarget.style.borderColor = 'var(--brand)';
      e.currentTarget.style.boxShadow = 'var(--well), 0 0 0 2px var(--brand-soft)';
    },
    onBlur: e => {
      e.currentTarget.style.borderColor = 'var(--line-strong)';
      e.currentTarget.style.boxShadow = 'var(--well)';
    }
  }, rest), options.map(o => {
    const opt = typeof o === 'string' ? {
      value: o,
      label: o
    } : o;
    return /*#__PURE__*/React.createElement("option", {
      key: opt.value,
      value: opt.value
    }, opt.label);
  })), /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      right: 'var(--sp-3)',
      color: 'var(--ink-3)',
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "m6 9 6 6 6-6",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/navigation/NavItem.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Sidebar navigation row. ink-2 → ink on hover, brand-text + 2px brand
 * left bar when active (a nav indicator, NOT a card side-stripe). Optional
 * leading icon, optional trailing chevron for expandable sections, optional
 * indent for child rows.
 */
function NavItem({
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
  return /*#__PURE__*/React.createElement(El, _extends({
    href: href,
    onClick: onClick,
    "aria-current": active ? 'page' : undefined,
    style: {
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
      ...style
    },
    onMouseEnter: e => {
      if (!active) {
        e.currentTarget.style.background = 'var(--surface-2)';
        e.currentTarget.style.color = 'var(--ink)';
      }
    },
    onMouseLeave: e => {
      if (!active) {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = 'var(--ink-2)';
      }
    }
  }, rest), active && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      left: 0,
      top: '50%',
      transform: 'translateY(-50%)',
      width: 2,
      height: '60%',
      borderRadius: 2,
      background: 'var(--brand)'
    }
  }), icon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      flexShrink: 0,
      color: 'currentColor'
    }
  }, icon), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, children), badge, expandable && /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": "true",
    style: {
      flexShrink: 0,
      color: 'var(--ink-3)',
      transform: expanded ? 'rotate(90deg)' : 'none',
      transition: 'transform var(--dur-fast) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "m9 18 6-6-6-6",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })));
}
Object.assign(__ds_scope, { NavItem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/NavItem.jsx", error: String((e && e.message) || e) }); }

// ui_kits/delphi-wrapper/App.jsx
try { (() => {
const {
  Toast
} = window.DelpheeDesignSystem_900988;
const {
  AppShell,
  Icon,
  I,
  PageHeader,
  freshness,
  HomeScreen,
  EsamiScreen,
  TasseScreen,
  LoginScreen
} = window;
const STUDENT = {
  nome: 'Mario Rossi',
  matricola: '0312844'
};
const toastIcon = {
  ok: I.check,
  bad: I.search,
  info: I.refresh,
  warn: I.calendar
};
function Placeholder({
  title,
  route
}) {
  return /*#__PURE__*/React.createElement("div", {
    "data-screen-label": title
  }, /*#__PURE__*/React.createElement(PageHeader, {
    title: title
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--t-md)',
      color: 'var(--ink-2)',
      maxWidth: '50ch',
      lineHeight: 'var(--lh-prose)'
    }
  }, "Questa sezione fa parte del wrapper ma non \xE8 inclusa in questo UI kit dimostrativo."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--t-md)',
      color: 'var(--ink-3)',
      maxWidth: '50ch',
      marginTop: 'var(--sp-2)'
    }
  }, "Le schermate complete (Home, Esami, Tasse) mostrano i pattern da replicare per ", /*#__PURE__*/React.createElement("code", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--t-sm)'
    }
  }, route), "."), freshness('Dati Delphi · sincronizzati 25/06/2026 14:32'));
}
function App() {
  const [auth, setAuth] = React.useState(false);
  const [route, setRoute] = React.useState('home');
  const [theme, setTheme] = React.useState(() => localStorage.getItem('dw-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  const [toasts, setToasts] = React.useState([]);
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dw-theme', theme);
  }, [theme]);
  const pushToast = (tone, title, body) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, {
      id,
      tone,
      title,
      body
    }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };
  const dismiss = id => setToasts(t => t.filter(x => x.id !== id));
  if (!auth) return /*#__PURE__*/React.createElement(LoginScreen, {
    onLogin: () => {
      setAuth(true);
      setRoute('home');
    }
  });
  const screen = {
    home: /*#__PURE__*/React.createElement(HomeScreen, {
      student: STUDENT,
      onToast: pushToast
    }),
    esami: /*#__PURE__*/React.createElement(EsamiScreen, {
      onToast: pushToast
    }),
    tasse: /*#__PURE__*/React.createElement(TasseScreen, {
      onToast: pushToast
    })
  }[route] || /*#__PURE__*/React.createElement(Placeholder, {
    title: cap(route),
    route: route
  });
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(AppShell, {
    route: route,
    setRoute: setRoute,
    theme: theme,
    toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    student: STUDENT
  }, /*#__PURE__*/React.createElement("div", {
    key: route,
    style: {
      animation: 'dw-view 180ms cubic-bezier(0.22,1,0.36,1)'
    }
  }, screen)), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      right: 'var(--sp-5)',
      bottom: 'var(--sp-5)',
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-3)'
    }
  }, toasts.map(t => /*#__PURE__*/React.createElement(Toast, {
    key: t.id,
    tone: t.tone,
    icon: /*#__PURE__*/React.createElement(Icon, {
      d: toastIcon[t.tone],
      size: 16
    }),
    title: t.title,
    onDismiss: () => dismiss(t.id)
  }, t.body))), /*#__PURE__*/React.createElement("style", null, '@keyframes dw-view{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}'));
}
function cap(s) {
  return {
    iscrizione: 'Iscrizione',
    documenti: 'Documenti',
    servizi: 'Servizi',
    appelli: 'Appelli',
    prenotazioni: 'Prenotazioni'
  }[s] || s;
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/delphi-wrapper/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/delphi-wrapper/AppShell.jsx
try { (() => {
const {
  Button,
  IconButton,
  NavItem
} = window.DelpheeDesignSystem_900988;

// Lucide-style inline icons (outline, 1.5px) — same set the app uses.
const Icon = ({
  d,
  size = 18
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  "aria-hidden": "true"
}, Array.isArray(d) ? d.map((p, i) => /*#__PURE__*/React.createElement("path", {
  key: i,
  d: p,
  stroke: "currentColor",
  strokeWidth: "1.5",
  strokeLinecap: "round",
  strokeLinejoin: "round"
})) : /*#__PURE__*/React.createElement("path", {
  d: d,
  stroke: "currentColor",
  strokeWidth: "1.5",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}));
const I = {
  home: "M3 10.5 12 3l9 7.5 M5 9v11h14V9",
  cap: ["M22 10 12 5 2 10l10 5 10-5Z", "M6 12v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"],
  edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z",
  euro: ["M14 21a8 8 0 1 1 0-16", "M4 11h9", "M4 15h7"],
  file: ["M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z", "M14 3v6h6"],
  grid: ["M3 3h7v7H3z", "M14 3h7v7h-7z", "M14 14h7v7h-7z", "M3 14h7v7H3z"],
  sun: ["M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z", "M12 1v2 M12 21v2 M4.2 4.2l1.4 1.4 M18.4 18.4l1.4 1.4 M1 12h2 M21 12h2 M4.2 19.8l1.4-1.4 M18.4 5.6l1.4-1.4"],
  moon: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z",
  logout: ["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "M16 17l5-5-5-5", "M21 12H9"],
  search: ["M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z", "M20 20l-3.5-3.5"],
  download: ["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M7 10l5 5 5-5", "M12 15V3"],
  copy: ["M9 9h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V11a2 2 0 0 1 2-2Z", "M5 15H4a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1"],
  refresh: ["M21 2v6h-6", "M3 12a9 9 0 0 1 15-6.7L21 8", "M3 22v-6h6", "M21 12a9 9 0 0 1-15 6.7L3 16"],
  calendar: ["M3 5h18v16H3z", "M16 3v4 M8 3v4 M3 9h18"],
  external: ["M15 3h6v6", "M10 14 21 3", "M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"],
  check: "M20 6 9 17l-5-5",
  arrowLeft: ["M19 12H5", "M12 19l-7-7 7-7"],
  chevronRight: "m9 18 6-6-6-6"
};

/**
 * The Delphi Wrapper app shell: 240px glass sidebar (desktop), main column
 * capped at 880px. Logo + nav + session block + theme/logout.
 */
function AppShell({
  route,
  setRoute,
  theme,
  toggleTheme,
  student,
  children
}) {
  const nav = [{
    id: 'home',
    label: 'Home',
    icon: I.home
  }, {
    id: 'esami',
    label: 'Esami',
    icon: I.cap,
    expandable: true,
    children: [{
      id: 'appelli',
      label: 'Appelli'
    }, {
      id: 'prenotazioni',
      label: 'Prenotazioni'
    }]
  }, {
    id: 'iscrizione',
    label: 'Iscrizione',
    icon: I.edit,
    expandable: true
  }, {
    id: 'tasse',
    label: 'Tasse',
    icon: I.euro
  }, {
    id: 'documenti',
    label: 'Documenti',
    icon: I.file,
    expandable: true
  }, {
    id: 'servizi',
    label: 'Servizi',
    icon: I.grid
  }];
  const [open, setOpen] = React.useState('esami');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      minHeight: '100vh',
      background: 'var(--bg)'
    }
  }, /*#__PURE__*/React.createElement("aside", {
    style: {
      position: 'sticky',
      top: 0,
      alignSelf: 'flex-start',
      width: 'var(--sidebar-w)',
      height: '100vh',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      padding: 'var(--sp-4) var(--sp-3)',
      background: 'var(--glass)',
      backdropFilter: 'var(--glass-blur)',
      WebkitBackdropFilter: 'var(--glass-blur)',
      borderRight: '1px solid var(--line)',
      boxShadow: 'var(--edge-hi)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--sp-3)',
      padding: 'var(--sp-2) var(--sp-2) var(--sp-5)'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: window.__resources && window.__resources.logo || "../../assets/delphee-mark.svg",
    alt: "",
    width: "28",
    height: "28"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontVariationSettings: "'opsz' 24",
      fontWeight: 600,
      fontSize: 'var(--t-md)',
      color: 'var(--ink)',
      lineHeight: 1.1
    }
  }, "Delphee"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--t-xs)',
      color: 'var(--ink-3)'
    }
  }, "Tor Vergata"))), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      flex: 1
    }
  }, nav.map(n => /*#__PURE__*/React.createElement(React.Fragment, {
    key: n.id
  }, /*#__PURE__*/React.createElement(NavItem, {
    icon: /*#__PURE__*/React.createElement(Icon, {
      d: n.icon
    }),
    active: route === n.id,
    expandable: n.expandable,
    expanded: open === n.id,
    onClick: () => {
      n.expandable ? setOpen(open === n.id ? '' : n.id) : null;
      setRoute(n.id);
    }
  }, n.label), n.expandable && open === n.id && n.children && n.children.map(c => /*#__PURE__*/React.createElement(NavItem, {
    key: c.id,
    indent: true,
    active: route === c.id,
    onClick: () => setRoute(c.id)
  }, c.label))))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid var(--line)',
      paddingTop: 'var(--sp-4)',
      marginTop: 'var(--sp-4)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 'var(--sp-2)',
      padding: '0 var(--sp-2)',
      marginBottom: 'var(--sp-3)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: 'var(--brand)',
      marginTop: 6,
      flexShrink: 0,
      boxShadow: '0 0 0 3px var(--brand-soft)'
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--t-2xs)',
      color: 'var(--ink-3)'
    }
  }, "Sessione attiva"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--t-sm)',
      fontWeight: 500,
      color: 'var(--ink)'
    }
  }, student.nome), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--t-xs)',
      color: 'var(--ink-2)'
    }
  }, student.matricola))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--sp-1)',
      padding: '0 var(--sp-1)'
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    label: "Cambia tema",
    onClick: toggleTheme
  }, /*#__PURE__*/React.createElement(Icon, {
    d: theme === 'dark' ? I.sun : I.moon
  })), /*#__PURE__*/React.createElement(IconButton, {
    label: "Esci"
  }, /*#__PURE__*/React.createElement(Icon, {
    d: I.logout
  }))))), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      minWidth: 0,
      padding: 'var(--sp-7) var(--sp-7)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--content-max)',
      margin: '0 auto'
    }
  }, children)));
}
Object.assign(window, {
  AppShell,
  Icon,
  I
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/delphi-wrapper/AppShell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/delphi-wrapper/EsamiScreen.jsx
try { (() => {
const {
  Button,
  Input,
  Select,
  DataTable,
  StatusPill
} = window.DelpheeDesignSystem_900988;
const {
  Icon,
  I,
  PageHeader,
  freshness
} = window;

// ── ESAMI ─────────────────────────────────────────────────────────────
function EsamiScreen({
  onToast
}) {
  const all = [{
    corso: 'Fisica Generale I',
    ssd: 'FIS/01',
    cfu: 12,
    voto: null,
    lode: true,
    esito: 'Superato',
    tone: 'ok',
    data: '04/02/25'
  }, {
    corso: 'Analisi Matematica I',
    ssd: 'MAT/05',
    cfu: 9,
    voto: 28,
    esito: 'Superato',
    tone: 'ok',
    data: '12/06/25'
  }, {
    corso: 'Architettura degli Elaboratori',
    ssd: 'INF/01',
    cfu: 6,
    voto: 26,
    esito: 'Superato',
    tone: 'ok',
    data: '21/01/25'
  }, {
    corso: 'Algebra Lineare e Geometria',
    ssd: 'MAT/03',
    cfu: 9,
    voto: 24,
    esito: 'Superato',
    tone: 'ok',
    data: '09/09/24'
  }, {
    corso: 'Programmazione',
    ssd: 'INF/01',
    cfu: 9,
    voto: null,
    esito: 'In corso',
    tone: 'info',
    data: '—'
  }, {
    corso: 'Calcolatori Elettronici',
    ssd: 'ING-INF/05',
    cfu: 6,
    voto: null,
    esito: 'Non superato',
    tone: 'bad',
    data: '18/02/25'
  }, {
    corso: 'Lingua Inglese B2',
    ssd: 'L-LIN/12',
    cfu: 3,
    voto: null,
    esito: 'Idoneo',
    tone: 'neutral',
    data: '03/10/24'
  }];
  const [q, setQ] = React.useState('');
  const [filtro, setFiltro] = React.useState('all');
  const rows = all.filter(r => (filtro === 'all' || filtro === 'ok' && r.tone === 'ok' || filtro === 'no' && r.tone === 'bad' || filtro === 'corso' && r.tone === 'info') && r.corso.toLowerCase().includes(q.toLowerCase()));
  const cols = [{
    key: 'corso',
    header: 'Insegnamento',
    render: r => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        color: 'var(--ink)'
      }
    }, r.corso), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--t-2xs)',
        color: 'var(--ink-3)'
      }
    }, r.ssd))
  }, {
    key: 'cfu',
    header: 'CFU',
    align: 'right',
    mono: true,
    width: 56
  }, {
    key: 'voto',
    header: 'Voto',
    align: 'right',
    width: 96,
    render: r => r.lode ? /*#__PURE__*/React.createElement(StatusPill, {
      tone: "ok",
      solid: true
    }, "30 e lode") : /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        color: 'var(--ink)'
      }
    }, r.voto ?? '—')
  }, {
    key: 'esito',
    header: 'Esito',
    width: 124,
    render: r => /*#__PURE__*/React.createElement(StatusPill, {
      tone: r.tone
    }, r.esito)
  }, {
    key: 'data',
    header: 'Data',
    align: 'right',
    mono: true,
    nowrap: true
  }];
  return /*#__PURE__*/React.createElement("div", {
    "data-screen-label": "Esami"
  }, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Esami",
    subtitle: "Libretto completo dei tuoi insegnamenti.",
    actions: /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      icon: /*#__PURE__*/React.createElement(Icon, {
        d: I.download,
        size: 16
      }),
      onClick: () => onToast('ok', 'Libretto scaricato', 'libretto.pdf · 84 KB')
    }, "Esporta PDF")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--sp-3)',
      alignItems: 'flex-end',
      padding: 'var(--sp-3)',
      background: 'var(--surface-2)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--r-card)',
      marginBottom: 'var(--sp-4)'
    }
  }, /*#__PURE__*/React.createElement(Input, {
    style: {
      flex: 1
    },
    label: "Cerca insegnamento",
    leadingIcon: /*#__PURE__*/React.createElement(Icon, {
      d: I.search,
      size: 16
    }),
    placeholder: "es. Analisi, INF/01\u2026",
    value: q,
    onChange: e => setQ(e.target.value)
  }), /*#__PURE__*/React.createElement(Select, {
    label: "Esito",
    style: {
      width: 180
    },
    value: filtro,
    onChange: e => setFiltro(e.target.value),
    options: [{
      value: 'all',
      label: 'Tutti'
    }, {
      value: 'ok',
      label: 'Superati'
    }, {
      value: 'corso',
      label: 'In corso'
    }, {
      value: 'no',
      label: 'Non superati'
    }]
  })), /*#__PURE__*/React.createElement(DataTable, {
    columns: cols,
    rows: rows,
    empty: /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        color: 'var(--ink-2)'
      }
    }, "Nessun esame con questo filtro."), /*#__PURE__*/React.createElement("div", {
      style: {
        color: 'var(--ink-3)',
        marginTop: 4
      }
    }, "Prova a togliere un filtro o cerca un altro corso."))
  }), freshness('Dati Delphi · sincronizzati 25/06/2026 14:32'));
}
Object.assign(window, {
  EsamiScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/delphi-wrapper/EsamiScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/delphi-wrapper/HomeScreen.jsx
try { (() => {
const {
  Button,
  Card,
  DataTable,
  StatusPill
} = window.DelpheeDesignSystem_900988;
const {
  Icon,
  I
} = window;

// ── Shared page header ────────────────────────────────────────────────
function PageHeader({
  title,
  subtitle,
  actions
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 'var(--sp-4)',
      marginBottom: 'var(--sp-6)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-display)',
      fontVariationSettings: "'opsz' 144",
      fontWeight: 400,
      fontSize: 'var(--t-2xl)',
      color: 'var(--ink)',
      lineHeight: 1.15,
      letterSpacing: '-0.01em',
      textWrap: 'balance'
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--t-sm)',
      color: 'var(--ink-2)',
      marginTop: 'var(--sp-2)'
    }
  }, subtitle)), actions && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--sp-2)',
      flexShrink: 0
    }
  }, actions));
}
function SubLabel({
  children,
  right
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      borderBottom: '1px solid var(--line)',
      paddingBottom: 'var(--sp-2)',
      margin: 'var(--sp-6) 0 var(--sp-4)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--t-md)',
      fontWeight: 600,
      color: 'var(--ink)'
    }
  }, children), right);
}
function freshness(t) {
  return /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--t-xs)',
      color: 'var(--ink-3)',
      marginTop: 'var(--sp-7)'
    }
  }, t);
}

// ── Count-up hook (riepilogo numbers) ─────────────────────────────────
function useCountUp(target, dur = 600) {
  const [v, setV] = React.useState(0);
  React.useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setV(target);
      return;
    }
    let raf, start;
    const tick = ts => {
      start ??= ts;
      const p = Math.min((ts - start) / dur, 1);
      setV(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return v;
}

// ── HOME / Riepilogo ──────────────────────────────────────────────────
function HomeScreen({
  student,
  onToast
}) {
  const cfu = useCountUp(168);
  const media = useCountUp(27.4);
  const ultimi = [{
    corso: 'Fisica Generale I',
    cfu: 12,
    lode: true,
    esito: 'Superato',
    tone: 'ok',
    data: '04/02/25'
  }, {
    corso: 'Analisi Matematica I',
    cfu: 9,
    voto: 28,
    esito: 'Superato',
    tone: 'ok',
    data: '12/06/25'
  }, {
    corso: 'Architettura degli Elaboratori',
    cfu: 6,
    voto: 26,
    esito: 'Superato',
    tone: 'ok',
    data: '21/01/25'
  }, {
    corso: 'Programmazione',
    cfu: 9,
    voto: '—',
    esito: 'In corso',
    tone: 'info',
    data: '—'
  }];
  const cols = [{
    key: 'corso',
    header: 'Insegnamento'
  }, {
    key: 'cfu',
    header: 'CFU',
    align: 'right',
    mono: true,
    width: 56
  }, {
    key: 'voto',
    header: 'Voto',
    align: 'right',
    width: 92,
    render: r => r.lode ? /*#__PURE__*/React.createElement(StatusPill, {
      tone: "ok",
      solid: true
    }, "30 e lode") : /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        color: 'var(--ink)'
      }
    }, r.voto)
  }, {
    key: 'esito',
    header: 'Esito',
    width: 116,
    render: r => /*#__PURE__*/React.createElement(StatusPill, {
      tone: r.tone
    }, r.esito)
  }, {
    key: 'data',
    header: 'Data',
    align: 'right',
    mono: true,
    nowrap: true
  }];
  return /*#__PURE__*/React.createElement("div", {
    "data-screen-label": "Home"
  }, /*#__PURE__*/React.createElement(PageHeader, {
    title: /*#__PURE__*/React.createElement(React.Fragment, null, "Bentornato, ", /*#__PURE__*/React.createElement("em", {
      style: {
        fontStyle: 'italic',
        color: 'var(--brand-text)'
      }
    }, student.nome.split(' ')[0])),
    subtitle: "Ecco com'\xE8 messa la tua carriera oggi.",
    actions: /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      icon: /*#__PURE__*/React.createElement(Icon, {
        d: I.refresh,
        size: 16
      }),
      onClick: () => onToast('ok', 'Dati aggiornati', 'Ultimo aggiornamento alle 14:32.')
    }, "Aggiorna")
  }), /*#__PURE__*/React.createElement(Card, {
    hero: true,
    padding: "var(--sp-5) var(--sp-6)"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--sp-7)'
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    big: true,
    label: "CFU acquisiti",
    value: `${Math.round(cfu)}`,
    sub: "/ 180"
  }), /*#__PURE__*/React.createElement(Stat, {
    big: true,
    label: "Media ponderata",
    value: media.toFixed(1),
    sub: "su 30"
  }), /*#__PURE__*/React.createElement(Stat, {
    big: true,
    label: "Esami sostenuti",
    value: "19",
    sub: "su 26"
  }))), /*#__PURE__*/React.createElement(SubLabel, {
    right: /*#__PURE__*/React.createElement("a", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--t-sm)',
        color: 'var(--brand-text)'
      },
      href: "#"
    }, "Vedi tutti")
  }, "Ultimi esami"), /*#__PURE__*/React.createElement(DataTable, {
    columns: cols,
    rows: ultimi,
    empty: "Non hai ancora sostenuto esami."
  }), freshness('Dati Delphi · sincronizzati 25/06/2026 14:32'));
}
function Stat({
  label,
  value,
  sub
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--t-sm)',
      color: 'var(--ink-2)',
      marginBottom: 'var(--sp-1)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 'var(--sp-2)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontVariationSettings: "'opsz' 144",
      fontWeight: 400,
      fontSize: 'var(--t-3xl)',
      color: 'var(--ink)',
      letterSpacing: '-0.015em',
      lineHeight: 1
    }
  }, value), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--t-md)',
      color: 'var(--ink-3)'
    }
  }, sub)));
}
Object.assign(window, {
  PageHeader,
  SubLabel,
  freshness,
  HomeScreen,
  Stat
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/delphi-wrapper/HomeScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/delphi-wrapper/LoginScreen.jsx
try { (() => {
const {
  Button,
  Input
} = window.DelpheeDesignSystem_900988;

// ── LOGIN ─────────────────────────────────────────────────────────────
// The whole page IS the login. No card, no illustration. Just type.
function LoginScreen({
  onLogin
}) {
  const [loading, setLoading] = React.useState(false);
  const submit = e => {
    e.preventDefault();
    setLoading(true);
    setTimeout(onLogin, 700);
  };
  return /*#__PURE__*/React.createElement("div", {
    "data-screen-label": "Login",
    style: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      padding: 'var(--sp-6)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 0,
      pointerEvents: 'none',
      background: 'var(--ambient)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: 360,
      maxWidth: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      marginBottom: 'var(--sp-7)'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: window.__resources && window.__resources.logo || "../../assets/delphee-mark.svg",
    alt: "Delphee",
    width: "44",
    height: "44"
  }), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-display)',
      fontVariationSettings: "'opsz' 144",
      fontWeight: 400,
      fontSize: 'var(--t-2xl)',
      color: 'var(--ink)',
      letterSpacing: '-0.015em',
      marginTop: 'var(--sp-4)'
    }
  }, "Delphee"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--t-md)',
      color: 'var(--ink-2)',
      marginTop: 'var(--sp-1)'
    }
  }, "Il tuo portale")), /*#__PURE__*/React.createElement("form", {
    onSubmit: submit,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-4)'
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Matricola",
    placeholder: "0312844",
    defaultValue: "0312844",
    inputMode: "numeric"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Password",
    type: "password",
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
    defaultValue: "password"
  }), /*#__PURE__*/React.createElement(Button, {
    type: "submit",
    variant: "primary",
    fullWidth: true,
    loading: loading,
    style: {
      marginTop: 'var(--sp-1)'
    }
  }, loading ? 'Accesso…' : 'Accedi')), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--t-sm)',
      color: 'var(--ink-3)',
      textAlign: 'center',
      marginTop: 'var(--sp-5)',
      textWrap: 'pretty'
    }
  }, "Solo per studenti dell'Universit\xE0 di Roma Tor Vergata.")));
}
Object.assign(window, {
  LoginScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/delphi-wrapper/LoginScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/delphi-wrapper/TasseScreen.jsx
try { (() => {
const {
  Button,
  Card,
  StatusPill,
  IconButton
} = window.DelpheeDesignSystem_900988;
const {
  Icon,
  I,
  PageHeader,
  SubLabel,
  freshness
} = window;

// ── TASSE ─────────────────────────────────────────────────────────────
function TasseScreen({
  onToast
}) {
  const rate = [{
    label: 'I rata · Tassa regionale + bollo',
    importo: '156,00',
    scad: '31/10/2025',
    stato: 'Pagata',
    tone: 'ok',
    iuv: 'RF7320041558'
  }, {
    label: 'II rata · Contributo onnicomprensivo',
    importo: '642,00',
    scad: '31/03/2026',
    stato: 'Da pagare',
    tone: 'warn',
    iuv: 'RF1980552310'
  }, {
    label: 'Mora · II rata',
    importo: '52,00',
    scad: '15/04/2026',
    stato: 'Scaduta',
    tone: 'bad',
    iuv: 'RF4471209983'
  }];
  const copy = iuv => {
    navigator.clipboard?.writeText(iuv);
    onToast('ok', 'Codice IUV copiato', iuv);
  };
  return /*#__PURE__*/React.createElement("div", {
    "data-screen-label": "Tasse"
  }, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Tasse",
    subtitle: "Rate, scadenze e codici di pagamento pagoPA."
  }), /*#__PURE__*/React.createElement(Card, {
    padding: "var(--sp-5)"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      flexWrap: 'wrap',
      gap: 'var(--sp-3)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--t-sm)',
      color: 'var(--ink-2)'
    }
  }, "Totale dovuto"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontVariationSettings: "'opsz' 144",
      fontWeight: 400,
      fontSize: 'var(--t-2xl)',
      color: 'var(--ink)',
      letterSpacing: '-0.015em'
    }
  }, "\u20AC 694,00")), /*#__PURE__*/React.createElement(StatusPill, {
    tone: "warn"
  }, "2 rate aperte"))), /*#__PURE__*/React.createElement(SubLabel, null, "Rate"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-3)'
    }
  }, rate.map(r => /*#__PURE__*/React.createElement(Card, {
    key: r.iuv,
    interactive: true,
    padding: "var(--sp-4) var(--sp-5)"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--sp-4)',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 200
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--t-md)',
      color: 'var(--ink)',
      fontWeight: 500
    }
  }, r.label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--sp-2)',
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--t-xs)',
      color: 'var(--ink-3)'
    }
  }, "IUV ", r.iuv), /*#__PURE__*/React.createElement(IconButton, {
    label: "Copia IUV",
    size: "sm",
    onClick: () => copy(r.iuv)
  }, /*#__PURE__*/React.createElement(Icon, {
    d: I.copy,
    size: 14
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontVariantNumeric: 'tabular-nums',
      fontSize: 'var(--t-lg)',
      color: 'var(--ink)'
    }
  }, "\u20AC ", r.importo), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--t-xs)',
      color: 'var(--ink-3)'
    }
  }, "Scade ", r.scad)), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 110,
      display: 'flex',
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement(StatusPill, {
    tone: r.tone
  }, r.stato)), r.tone !== 'ok' ? /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    onClick: () => onToast('info', 'Apertura pagoPA', 'Verrai reindirizzato al portale dei pagamenti.')
  }, "Paga") : /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "ghost",
    icon: /*#__PURE__*/React.createElement(Icon, {
      d: I.download,
      size: 14
    }),
    onClick: () => onToast('ok', 'Ricevuta scaricata', 'ricevuta.pdf')
  }, "Ricevuta"))))), freshness('Importi pagoPA · aggiornati 25/06/2026 14:32'));
}
Object.assign(window, {
  TasseScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/delphi-wrapper/TasseScreen.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.DataTable = __ds_scope.DataTable;

__ds_ns.StatusPill = __ds_scope.StatusPill;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.NavItem = __ds_scope.NavItem;

})();
