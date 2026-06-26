const { Toast } = window.DelpheeDesignSystem_900988;
const { AppShell, Icon, I, PageHeader, freshness, HomeScreen, EsamiScreen, TasseScreen, LoginScreen } = window;

const STUDENT = { nome: 'Mario Rossi', matricola: '0312844' };

const toastIcon = { ok: I.check, bad: I.search, info: I.refresh, warn: I.calendar };

function Placeholder({ title, route }) {
  return (
    <div data-screen-label={title}>
      <PageHeader title={title} />
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--t-md)', color: 'var(--ink-2)', maxWidth: '50ch', lineHeight: 'var(--lh-prose)' }}>
        Questa sezione fa parte del wrapper ma non è inclusa in questo UI kit dimostrativo.
      </p>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--t-md)', color: 'var(--ink-3)', maxWidth: '50ch', marginTop: 'var(--sp-2)' }}>
        Le schermate complete (Home, Esami, Tasse) mostrano i pattern da replicare per <code style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--t-sm)' }}>{route}</code>.
      </p>
      {freshness('Dati Delphi · sincronizzati 25/06/2026 14:32')}
    </div>
  );
}

function App() {
  const [auth, setAuth] = React.useState(false);
  const [route, setRoute] = React.useState('home');
  const [theme, setTheme] = React.useState(() =>
    localStorage.getItem('dw-theme')
    || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  const [toasts, setToasts] = React.useState([]);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dw-theme', theme);
  }, [theme]);

  const pushToast = (tone, title, body) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, tone, title, body }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };
  const dismiss = (id) => setToasts(t => t.filter(x => x.id !== id));

  if (!auth) return <LoginScreen onLogin={() => { setAuth(true); setRoute('home'); }} />;

  const screen = {
    home: <HomeScreen student={STUDENT} onToast={pushToast} />,
    esami: <EsamiScreen onToast={pushToast} />,
    tasse: <TasseScreen onToast={pushToast} />,
  }[route] || <Placeholder title={cap(route)} route={route} />;

  return (
    <>
      <AppShell route={route} setRoute={setRoute} theme={theme}
        toggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} student={STUDENT}>
        <div key={route} style={{ animation: 'dw-view 180ms cubic-bezier(0.22,1,0.36,1)' }}>{screen}</div>
      </AppShell>

      {/* Toast viewport — bottom-right */}
      <div style={{ position: 'fixed', right: 'var(--sp-5)', bottom: 'var(--sp-5)', zIndex: 50, display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        {toasts.map(t => (
          <Toast key={t.id} tone={t.tone} icon={<Icon d={toastIcon[t.tone]} size={16} />} title={t.title} onDismiss={() => dismiss(t.id)}>{t.body}</Toast>
        ))}
      </div>
      <style>{'@keyframes dw-view{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}'}</style>
    </>
  );
}

function cap(s) { return ({ iscrizione: 'Iscrizione', documenti: 'Documenti', servizi: 'Servizi', appelli: 'Appelli', prenotazioni: 'Prenotazioni' }[s] || s); }

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
