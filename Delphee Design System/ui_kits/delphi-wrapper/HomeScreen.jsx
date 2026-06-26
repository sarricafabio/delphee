const { Button, Card, DataTable, StatusPill } = window.DelpheeDesignSystem_900988;
const { Icon, I } = window;

// ── Shared page header ────────────────────────────────────────────────
function PageHeader({ title, subtitle, actions }) {
  return (
    <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontVariationSettings: "'opsz' 144", fontWeight: 400, fontSize: 'var(--t-2xl)', color: 'var(--ink)', lineHeight: 1.15, letterSpacing: '-0.01em', textWrap: 'balance' }}>{title}</h1>
        {subtitle && <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--t-sm)', color: 'var(--ink-2)', marginTop: 'var(--sp-2)' }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 'var(--sp-2)', flexShrink: 0 }}>{actions}</div>}
    </header>
  );
}

function SubLabel({ children, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: 'var(--sp-2)', margin: 'var(--sp-6) 0 var(--sp-4)' }}>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--t-md)', fontWeight: 600, color: 'var(--ink)' }}>{children}</span>
      {right}
    </div>
  );
}

function freshness(t) {
  return <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--t-xs)', color: 'var(--ink-3)', marginTop: 'var(--sp-7)' }}>{t}</p>;
}

// ── Count-up hook (riepilogo numbers) ─────────────────────────────────
function useCountUp(target, dur = 600) {
  const [v, setV] = React.useState(0);
  React.useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setV(target); return; }
    let raf, start;
    const tick = (ts) => { start ??= ts; const p = Math.min((ts - start) / dur, 1);
      setV(target * (1 - Math.pow(1 - p, 3))); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return v;
}

// ── HOME / Riepilogo ──────────────────────────────────────────────────
function HomeScreen({ student, onToast }) {
  const cfu = useCountUp(168);
  const media = useCountUp(27.4);
  const ultimi = [
    { corso: 'Fisica Generale I', cfu: 12, lode: true, esito: 'Superato', tone: 'ok', data: '04/02/25' },
    { corso: 'Analisi Matematica I', cfu: 9, voto: 28, esito: 'Superato', tone: 'ok', data: '12/06/25' },
    { corso: 'Architettura degli Elaboratori', cfu: 6, voto: 26, esito: 'Superato', tone: 'ok', data: '21/01/25' },
    { corso: 'Programmazione', cfu: 9, voto: '—', esito: 'In corso', tone: 'info', data: '—' },
  ];
  const cols = [
    { key: 'corso', header: 'Insegnamento' },
    { key: 'cfu', header: 'CFU', align: 'right', mono: true, width: 56 },
    { key: 'voto', header: 'Voto', align: 'right', width: 92, render: r => r.lode
        ? <StatusPill tone="ok" solid>30 e lode</StatusPill>
        : <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>{r.voto}</span> },
    { key: 'esito', header: 'Esito', width: 116, render: r => <StatusPill tone={r.tone}>{r.esito}</StatusPill> },
    { key: 'data', header: 'Data', align: 'right', mono: true, nowrap: true },
  ];

  return (
    <div data-screen-label="Home">
      <PageHeader
        title={<>Bentornato, <em style={{ fontStyle: 'italic', color: 'var(--brand-text)' }}>{student.nome.split(' ')[0]}</em></>}
        subtitle="Ecco com'è messa la tua carriera oggi."
        actions={<Button variant="secondary" icon={<Icon d={I.refresh} size={16} />} onClick={() => onToast('ok', 'Dati aggiornati', 'Ultimo aggiornamento alle 14:32.')}>Aggiorna</Button>}
      />

      {/* Hero lozenge */}
      <Card hero padding="var(--sp-5) var(--sp-6)">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-7)' }}>
          <Stat big label="CFU acquisiti" value={`${Math.round(cfu)}`} sub="/ 180" />
          <Stat big label="Media ponderata" value={media.toFixed(1)} sub="su 30" />
          <Stat big label="Esami sostenuti" value="19" sub="su 26" />
        </div>
      </Card>

      <SubLabel right={<a style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--t-sm)', color: 'var(--brand-text)' }} href="#">Vedi tutti</a>}>Ultimi esami</SubLabel>
      <DataTable columns={cols} rows={ultimi} empty="Non hai ancora sostenuto esami." />

      {freshness('Dati Delphi · sincronizzati 25/06/2026 14:32')}
    </div>
  );
}

function Stat({ label, value, sub }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--t-sm)', color: 'var(--ink-2)', marginBottom: 'var(--sp-1)' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--sp-2)' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontVariationSettings: "'opsz' 144", fontWeight: 400, fontSize: 'var(--t-3xl)', color: 'var(--ink)', letterSpacing: '-0.015em', lineHeight: 1 }}>{value}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--t-md)', color: 'var(--ink-3)' }}>{sub}</span>
      </div>
    </div>
  );
}

Object.assign(window, { PageHeader, SubLabel, freshness, HomeScreen, Stat });
