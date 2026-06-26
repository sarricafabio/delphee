const { Button, Input } = window.DelpheeDesignSystem_900988;

// ── LOGIN ─────────────────────────────────────────────────────────────
// The whole page IS the login. No card, no illustration. Just type.
function LoginScreen({ onLogin }) {
  const [loading, setLoading] = React.useState(false);
  const submit = (e) => { e.preventDefault(); setLoading(true); setTimeout(onLogin, 700); };

  return (
    <div data-screen-label="Login" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 'var(--sp-6)' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: 'var(--ambient)' }} />
      <div style={{ position: 'relative', width: 360, maxWidth: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 'var(--sp-7)' }}>
          <img src={(window.__resources && window.__resources.logo) || "../../assets/delphee-mark.svg"} alt="Delphee" width="44" height="44" />
          <h1 style={{ fontFamily: 'var(--font-display)', fontVariationSettings: "'opsz' 144", fontWeight: 400, fontSize: 'var(--t-2xl)', color: 'var(--ink)', letterSpacing: '-0.015em', marginTop: 'var(--sp-4)' }}>Delphee</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--t-md)', color: 'var(--ink-2)', marginTop: 'var(--sp-1)' }}>Il tuo portale</p>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <Input label="Matricola" placeholder="0312844" defaultValue="0312844" inputMode="numeric" />
          <Input label="Password" type="password" placeholder="••••••••" defaultValue="password" />
          <Button type="submit" variant="primary" fullWidth loading={loading} style={{ marginTop: 'var(--sp-1)' }}>
            {loading ? 'Accesso…' : 'Accedi'}
          </Button>
        </form>

        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--t-sm)', color: 'var(--ink-3)', textAlign: 'center', marginTop: 'var(--sp-5)', textWrap: 'pretty' }}>
          Solo per studenti dell'Università di Roma Tor Vergata.
        </p>
      </div>
    </div>
  );
}

Object.assign(window, { LoginScreen });
