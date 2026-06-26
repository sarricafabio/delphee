Glass toast notification — semantic icon left, optional title + body, optional × dismiss. Position it yourself (bottom-right desktop / top mobile); auto-dismiss after ~4s in your own timer.

```jsx
<Toast tone="ok" icon={<Check size={16} />} title="Codice IUV copiato" onDismiss={close} />
<Toast tone="bad" icon={<AlertTriangle size={16} />}>Sessione scaduta. Accedi di nuovo.</Toast>
```

Tones: `ok` · `warn` · `bad` · `info` · `brand`. No dot, no side stripe.
