Primary action control — use `primary` (glossy brand fill) for the single most important action in a view; `secondary` and `ghost` for everything else.

```jsx
<Button variant="primary" onClick={save}>Salva</Button>
<Button variant="secondary" icon={<Download size={16} />}>Scarica PDF</Button>
<Button variant="ghost" size="sm">Annulla</Button>
<Button variant="primary" loading>Carico…</Button>
```

Variants: `primary` · `secondary` · `ghost`. Sizes: `sm` (32) · `md` (40) · `lg` (48). Props: `icon`, `iconRight`, `loading`, `disabled`, `fullWidth`. Never put two primary buttons side by side.
