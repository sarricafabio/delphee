Sidebar navigation row. Active row gets brand text, soft-green fill, and a 2px brand left bar (a nav indicator — not a card side-stripe). Expandable parents show a chevron; children indent.

```jsx
<NavItem icon={<Home size={18} />} active>Home</NavItem>
<NavItem icon={<GraduationCap size={18} />} expandable expanded>Esami</NavItem>
<NavItem indent>Appelli</NavItem>
<NavItem indent>Prenotazioni</NavItem>
<NavItem icon={<FileText size={18} />}>Documenti</NavItem>
```

Props: `icon`, `active`, `expandable`, `expanded`, `indent`, `badge`, `href`/`onClick`.
