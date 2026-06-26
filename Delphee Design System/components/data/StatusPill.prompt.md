Status indicator — one shape for every state. Always has text; never colour-only. No dot, no all-caps, no mono.

```jsx
<StatusPill tone="brand">Attiva</StatusPill>
<StatusPill tone="ok">Superato</StatusPill>
<StatusPill tone="bad">Non superato</StatusPill>
<StatusPill tone="warn">Scaduta</StatusPill>
<StatusPill tone="info">In corso</StatusPill>
<StatusPill tone="neutral">Assente</StatusPill>
<StatusPill tone="ok" solid>30 e lode</StatusPill>
```

Tones: `brand` (solid green), `ok`/`warn`/`bad`/`info` (soft tint), `neutral`, `ink`. Numeric voti 18–30 are plain mono text, NOT pills — numbers are data, not status.
