const { Button, Input, Select, DataTable, StatusPill } = window.DelpheeDesignSystem_900988;
const { Icon, I, PageHeader, freshness } = window;

// ── ESAMI ─────────────────────────────────────────────────────────────
function EsamiScreen({ onToast }) {
  const all = [
    { corso: 'Fisica Generale I', ssd: 'FIS/01', cfu: 12, voto: null, lode: true, esito: 'Superato', tone: 'ok', data: '04/02/25' },
    { corso: 'Analisi Matematica I', ssd: 'MAT/05', cfu: 9, voto: 28, esito: 'Superato', tone: 'ok', data: '12/06/25' },
    { corso: 'Architettura degli Elaboratori', ssd: 'INF/01', cfu: 6, voto: 26, esito: 'Superato', tone: 'ok', data: '21/01/25' },
    { corso: 'Algebra Lineare e Geometria', ssd: 'MAT/03', cfu: 9, voto: 24, esito: 'Superato', tone: 'ok', data: '09/09/24' },
    { corso: 'Programmazione', ssd: 'INF/01', cfu: 9, voto: null, esito: 'In corso', tone: 'info', data: '—' },
    { corso: 'Calcolatori Elettronici', ssd: 'ING-INF/05', cfu: 6, voto: null, esito: 'Non superato', tone: 'bad', data: '18/02/25' },
    { corso: 'Lingua Inglese B2', ssd: 'L-LIN/12', cfu: 3, voto: null, esito: 'Idoneo', tone: 'neutral', data: '03/10/24' },
  ];
  const [q, setQ] = React.useState('');
  const [filtro, setFiltro] = React.useState('all');
  const rows = all.filter(r =>
    (filtro === 'all' || (filtro === 'ok' && r.tone === 'ok') || (filtro === 'no' && r.tone === 'bad') || (filtro === 'corso' && r.tone === 'info'))
    && r.corso.toLowerCase().includes(q.toLowerCase()));

  const cols = [
    { key: 'corso', header: 'Insegnamento', render: r => (
      <div><div style={{ color: 'var(--ink)' }}>{r.corso}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--t-2xs)', color: 'var(--ink-3)' }}>{r.ssd}</div></div>) },
    { key: 'cfu', header: 'CFU', align: 'right', mono: true, width: 56 },
    { key: 'voto', header: 'Voto', align: 'right', width: 96, render: r => r.lode
        ? <StatusPill tone="ok" solid>30 e lode</StatusPill>
        : <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>{r.voto ?? '—'}</span> },
    { key: 'esito', header: 'Esito', width: 124, render: r => <StatusPill tone={r.tone}>{r.esito}</StatusPill> },
    { key: 'data', header: 'Data', align: 'right', mono: true, nowrap: true },
  ];

  return (
    <div data-screen-label="Esami">
      <PageHeader title="Esami" subtitle="Libretto completo dei tuoi insegnamenti."
        actions={<Button variant="secondary" icon={<Icon d={I.download} size={16} />} onClick={() => onToast('ok', 'Libretto scaricato', 'libretto.pdf · 84 KB')}>Esporta PDF</Button>} />

      {/* Filter tray */}
      <div style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'flex-end', padding: 'var(--sp-3)', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-card)', marginBottom: 'var(--sp-4)' }}>
        <Input style={{ flex: 1 }} label="Cerca insegnamento" leadingIcon={<Icon d={I.search} size={16} />} placeholder="es. Analisi, INF/01…" value={q} onChange={e => setQ(e.target.value)} />
        <Select label="Esito" style={{ width: 180 }} value={filtro} onChange={e => setFiltro(e.target.value)}
          options={[{value:'all',label:'Tutti'},{value:'ok',label:'Superati'},{value:'corso',label:'In corso'},{value:'no',label:'Non superati'}]} />
      </div>

      <DataTable columns={cols} rows={rows} empty={
        <div><div style={{ color: 'var(--ink-2)' }}>Nessun esame con questo filtro.</div>
          <div style={{ color: 'var(--ink-3)', marginTop: 4 }}>Prova a togliere un filtro o cerca un altro corso.</div></div>} />

      {freshness('Dati Delphi · sincronizzati 25/06/2026 14:32')}
    </div>
  );
}

Object.assign(window, { EsamiScreen });
