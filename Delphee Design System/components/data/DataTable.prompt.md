The product workhorse — esami, verbali, appelli, tasse. Header in surface-2 (sentence case), numeric/code columns in mono + tabular figures, right-aligned. No zebra striping; row hover tints to surface-2.

```jsx
<DataTable
  columns={[
    { key: 'corso', header: 'Insegnamento' },
    { key: 'cfu', header: 'CFU', align: 'right', mono: true, width: 64 },
    { key: 'voto', header: 'Voto', align: 'right', render: r => r.voto },
    { key: 'data', header: 'Data', align: 'right', mono: true, nowrap: true },
  ]}
  rows={esami}
  empty="Non hai esami con questo filtro."
/>
```

Each column: `{ key, header, align?, mono?, nowrap?, width?, render? }`. Pass `onRowClick` for clickable rows. Compose `StatusPill` inside `render` for esito/voto cells.
