Labelled text input. 44px target, recessed well material, sentence-case label above, helper or error below. Focus shows a 2px brand ring.

```jsx
<Input label="Matricola" placeholder="0123456" />
<Input label="Password" type="password" helper="Le stesse credenziali di Delphi." />
<Input label="Email" error="Indirizzo non valido." defaultValue="mario@" />
<Input leadingIcon={<Search size={16} />} placeholder="Cerca un corso…" />
```

Props: `label`, `helper`, `error`, `leadingIcon`, plus all native input attrs. Labels are never uppercase or mono.
