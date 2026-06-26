const { Button, IconButton, NavItem } = window.DelpheeDesignSystem_900988;

// Lucide-style inline icons (outline, 1.5px) — same set the app uses.
const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />)
      : <path d={d} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />}
  </svg>
);
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
  chevronRight: "m9 18 6-6-6-6",
};

/**
 * The Delphi Wrapper app shell: 240px glass sidebar (desktop), main column
 * capped at 880px. Logo + nav + session block + theme/logout.
 */
function AppShell({ route, setRoute, theme, toggleTheme, student, children }) {
  const nav = [
    { id: 'home', label: 'Home', icon: I.home },
    { id: 'esami', label: 'Esami', icon: I.cap, expandable: true, children: [
      { id: 'appelli', label: 'Appelli' }, { id: 'prenotazioni', label: 'Prenotazioni' }] },
    { id: 'iscrizione', label: 'Iscrizione', icon: I.edit, expandable: true },
    { id: 'tasse', label: 'Tasse', icon: I.euro },
    { id: 'documenti', label: 'Documenti', icon: I.file, expandable: true },
    { id: 'servizi', label: 'Servizi', icon: I.grid },
  ];
  const [open, setOpen] = React.useState('esami');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside style={{
        position: 'sticky', top: 0, alignSelf: 'flex-start',
        width: 'var(--sidebar-w)', height: '100vh', flexShrink: 0,
        display: 'flex', flexDirection: 'column',
        padding: 'var(--sp-4) var(--sp-3)',
        background: 'var(--glass)', backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
        borderRight: '1px solid var(--line)', boxShadow: 'var(--edge-hi)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', padding: 'var(--sp-2) var(--sp-2) var(--sp-5)' }}>
          <img src={(window.__resources && window.__resources.logo) || "../../assets/delphee-mark.svg"} alt="" width="28" height="28" />
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontVariationSettings: "'opsz' 24", fontWeight: 600, fontSize: 'var(--t-md)', color: 'var(--ink)', lineHeight: 1.1 }}>Delphee</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--t-xs)', color: 'var(--ink-3)' }}>Tor Vergata</div>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          {nav.map((n) => (
            <React.Fragment key={n.id}>
              <NavItem icon={<Icon d={n.icon} />} active={route === n.id}
                expandable={n.expandable} expanded={open === n.id}
                onClick={() => { n.expandable ? setOpen(open === n.id ? '' : n.id) : null; setRoute(n.id); }}>
                {n.label}
              </NavItem>
              {n.expandable && open === n.id && n.children && n.children.map((c) => (
                <NavItem key={c.id} indent active={route === c.id} onClick={() => setRoute(c.id)}>{c.label}</NavItem>
              ))}
            </React.Fragment>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid var(--line)', paddingTop: 'var(--sp-4)', marginTop: 'var(--sp-4)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-2)', padding: '0 var(--sp-2)', marginBottom: 'var(--sp-3)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand)', marginTop: 6, flexShrink: 0, boxShadow: '0 0 0 3px var(--brand-soft)' }} />
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--t-2xs)', color: 'var(--ink-3)' }}>Sessione attiva</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--t-sm)', fontWeight: 500, color: 'var(--ink)' }}>{student.nome}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--t-xs)', color: 'var(--ink-2)' }}>{student.matricola}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--sp-1)', padding: '0 var(--sp-1)' }}>
            <IconButton label="Cambia tema" onClick={toggleTheme}><Icon d={theme === 'dark' ? I.sun : I.moon} /></IconButton>
            <IconButton label="Esci"><Icon d={I.logout} /></IconButton>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0, padding: 'var(--sp-7) var(--sp-7)' }}>
        <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto' }}>{children}</div>
      </main>
    </div>
  );
}

Object.assign(window, { AppShell, Icon, I });
