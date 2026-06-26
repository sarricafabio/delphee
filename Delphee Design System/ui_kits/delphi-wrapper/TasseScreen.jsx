const { Button, Card, StatusPill, IconButton } = window.DelpheeDesignSystem_900988;
const { Icon, I, PageHeader, SubLabel, freshness } = window;

// ── TASSE ─────────────────────────────────────────────────────────────
function TasseScreen({ onToast }) {
  const rate = [
    { label: 'I rata · Tassa regionale + bollo', importo: '156,00', scad: '31/10/2025', stato: 'Pagata', tone: 'ok', iuv: 'RF7320041558' },
    { label: 'II rata · Contributo onnicomprensivo', importo: '642,00', scad: '31/03/2026', stato: 'Da pagare', tone: 'warn', iuv: 'RF1980552310' },
    { label: 'Mora · II rata', importo: '52,00', scad: '15/04/2026', stato: 'Scaduta', tone: 'bad', iuv: 'RF4471209983' },
  ];
  const copy = (iuv) => { navigator.clipboard?.writeText(iuv); onToast('ok', 'Codice IUV copiato', iuv); };

  return (
    <div data-screen-label="Tasse">
      <PageHeader title="Tasse" subtitle="Rate, scadenze e codici di pagamento pagoPA." />

      <Card padding="var(--sp-5)">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--t-sm)', color: 'var(--ink-2)' }}>Totale dovuto</div>
            <div style={{ fontFamily: 'var(--font-display)', fontVariationSettings: "'opsz' 144", fontWeight: 400, fontSize: 'var(--t-2xl)', color: 'var(--ink)', letterSpacing: '-0.015em' }}>€ 694,00</div>
          </div>
          <StatusPill tone="warn">2 rate aperte</StatusPill>
        </div>
      </Card>

      <SubLabel>Rate</SubLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        {rate.map((r) => (
          <Card key={r.iuv} interactive padding="var(--sp-4) var(--sp-5)">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--t-md)', color: 'var(--ink)', fontWeight: 500 }}>{r.label}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginTop: 4 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--t-xs)', color: 'var(--ink-3)' }}>IUV {r.iuv}</span>
                  <IconButton label="Copia IUV" size="sm" onClick={() => copy(r.iuv)}><Icon d={I.copy} size={14} /></IconButton>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', fontSize: 'var(--t-lg)', color: 'var(--ink)' }}>€ {r.importo}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--t-xs)', color: 'var(--ink-3)' }}>Scade {r.scad}</div>
              </div>
              <div style={{ width: 110, display: 'flex', justifyContent: 'flex-end' }}>
                <StatusPill tone={r.tone}>{r.stato}</StatusPill>
              </div>
              {r.tone !== 'ok'
                ? <Button size="sm" onClick={() => onToast('info', 'Apertura pagoPA', 'Verrai reindirizzato al portale dei pagamenti.')}>Paga</Button>
                : <Button size="sm" variant="ghost" icon={<Icon d={I.download} size={14} />} onClick={() => onToast('ok', 'Ricevuta scaricata', 'ricevuta.pdf')}>Ricevuta</Button>}
            </div>
          </Card>
        ))}
      </div>

      {freshness('Importi pagoPA · aggiornati 25/06/2026 14:32')}
    </div>
  );
}

Object.assign(window, { TasseScreen });
