# Delphee Design System

> **Delphee** — *il Delphi che ci meritavamo.* A REST-API wrapper that makes the
> ageing **Delphi** career-management interface of **Università di Roma Tor Vergata**
> actually usable. This design system clothes that wrapper's SPA: a friendly,
> polished, accessible student portal — "real product" (Satispay / Revolut / your
> bank's app), not a developer console and not a 2010s university portal.

The one surface today is the **Delphi Wrapper** student SPA: login, riepilogo
carriera (home), esami (libretto), tasse & pagamenti pagoPA, plus the routes
that hang off them (appelli, prenotazioni, iscrizione, documenti, servizi).

---

## Sources

- **Codebase:** `delphee/` (mounted, read-only). At capture time the mount
  contained a single, exhaustive spec file: **`delphee/DESIGN.md`** — the rewrite
  of the product's design language (color, type, spacing, material, components,
  motion, a11y). This design system is the faithful build-out of that spec.
- The spec references the live SPA at `src/server/static/` and an asset
  `unilogo.svg` (the Tor Vergata mark) which were **not present** in the mount —
  see Caveats at the bottom.

---

## Index — what's in this project

**Foundations** (`tokens/`, linked from root `styles.css`)
- `tokens/colors.css` — brand greens, neutrals, surfaces, semantic + dark peer
- `tokens/typography.css` — families, size scale, weights, line-heights
- `tokens/spacing.css` — 4px scale, radius, layout dims, z-index
- `tokens/material.css` — the "liquid-glass" depth tokens (tiles, wells, glass)
- `tokens/motion.css` — durations, easing, reduced-motion reset
- `tokens/base.css` — body reset + ambient light field
- `tokens/fonts.css` — Fraunces · Hanken Grotesk · Spline Sans Mono (Google Fonts)

**Components** (`components/<group>/`) — React primitives, namespace `window.DelpheeDesignSystem_900988`
- `actions/` — **Button**, **IconButton**
- `forms/` — **Input**, **Select**
- `data/` — **StatusPill**, **Card**, **DataTable**
- `feedback/` — **Toast**
- `navigation/` — **NavItem**

**UI kit** (`ui_kits/delphi-wrapper/`) — the product, recreated
- `index.html` — interactive: login → home · esami · tasse, dark toggle, toasts
- `LoginScreen` · `AppShell` (sidebar) · `HomeScreen` · `EsamiScreen` · `TasseScreen`

**Foundation cards** (`guidelines/`) — the specimen cards on the Design System tab.

**Assets** (`assets/`) — `delphee-mark.svg` (product mark, see Caveats).

---

## Content fundamentals

**Language: Italian, always.** Italian copy for an Italian audience in an Italian
academic context. No English UI strings.

**Tone: warm, plain, student-to-student — never bureaucratic, never marketing.**
The product talks like a helpful classmate, not a registrar's office and not a
landing page.
- Greeting is personal and first-name: *"Bentornato, **Mario**"* (Fraunces, the
  name optionally italic for a small flourish).
- Sub-labels are sentence-case nouns: *"La tua carriera"*, *"Ultimi esami"*,
  *"Rate"* — no eyebrows, no ALL-CAPS, no kicker on every section.
- Helper text is a plain reassurance: *"Le stesse credenziali di Delphi."*,
  *"Solo per studenti dell'Università di Roma Tor Vergata."*
- **You vs I:** address the student as *tu* implicitly via possessives —
  *"la **tua** carriera"*, *"i **tuoi** insegnamenti"*. The app never says "I".

**Empty states tell the truth, then hint** — two short lines, no apology, no
centered card: *"Nessun esame con questo filtro."* / *"Prova a togliere un filtro
o cerca un altro corso."*

**Casing:** sentence case everywhere — labels, buttons (*"Accedi"*, *"Esporta
PDF"*, *"Paga"*), table headers (*"Insegnamento"*, *"Voto"*, *"Esito"*). The only
ALL-CAPS allowed are real codes (SSD `INF/01`, IUV `RF73…`).

**Numbers are data, not decoration.** Voti 18–30 render as plain mono figures; a
*pill* is reserved for genuine status (`30 e lode`, `Superato`, `Scaduta`). No
invented stats, no 4-up metric grids.

**Emoji: never.** Icons are Lucide outline glyphs (see Iconography). No emoji in
UI, copy, or status.

---

## Visual foundations

**Color — restrained, with one committed moment.** Neutral surfaces carry the
whole interface; **Tor Vergata green (`#007d34`, `--brand`)** appears on fewer than
1 in 12 surfaces — primary actions, the session-active dot, success/esito states,
the current nav row. Anywhere else it's a mistake. Everything is **OKLCH**;
neutrals carry a `0.002–0.006` chroma toward the brand hue (152) for quiet
consistency, never enough to read as "greenish gray".

**Backgrounds:** the page is a **barely-warm off-white** (`--bg`, chroma `0.003`
toward hue 90 — "white, slightly softer than pure white", explicitly *not* cream
or sand). Cards float on it as **pure white** (`--surface`). A fixed, faint
**ambient light field** (`body::before`, `--ambient`) sits behind everything — a
cool key light from above + a whisper of brand green from the far corner — so the
glass has something to refract. No photographic backgrounds, no decorative
gradients on content.

**Ink:** near-black with a hint of cool warmth (`--ink` = `oklch(0.22 0.015 250)`)
— reads as black, never blue, never brown. Body text ≥ 7:1; secondary/labels ≥
4.5:1.

**Type:** three families, three jobs. **Fraunces** (variable serif, opsz 9–144,
SOFT 0) for display — hero greeting, page titles, big numbers, with `-0.015em` at
hero size. **Hanken Grotesk** for everything body — prose, labels, nav, buttons,
table headers, dead-legible at 14px. **Spline Sans Mono** (tnum, `-0.005em`) for
data — matricola, IUV, CFU, SSD, importi, numeric table cells. The serif ×
grotesque × mono triple deliberately avoids the Inter / JetBrains-Mono AI-default.
Fixed rem scale, no clamps.

**Spacing & radius:** 4px base scale; *vary the steps* — never pad every block by
the same amount. Radius softened toward squircle for the glass material: 5
(chips) · 10 (buttons/inputs) · 14 (cards) · 20 (modals) · full (avatars).

**Material — "Liquid Glass":** dimensional but minimal. Three roles:
1. **Glass chrome** (`--glass` + `backdrop-filter: saturate(180%) blur(20px)` +
   `--edge-hi` specular top edge) — **only** on chrome content passes under:
   sidebar, mobile top bar, drawer, toast. Content surfaces are *not* glass.
2. **Raised tile** (`--sheen-top`→`--sheen-bot` gradient + `--elev-1`/`--elev-2`
   ambient+contact shadow + `--edge-hi` lit edge + `--rim` hairline) — cards,
   tables, list containers, the hero lozenge.
3. **Recessed well** (`--well` inset) — inputs, the filter tray, inline code
   chips read as pressed *into* the glass.
   Body text never gets the material; WCAG contrast is unchanged from a flat
   system.

**Borders:** hairline `--line` divides sections (no rounded section-wrapper
boxes); `--line-strong` on input borders; `--rim` on tiles. **No side-stripe
accent borders on cards** — the only left bar is the 2px brand nav indicator on
the active row, which is a navigation semantic.

**Shadows / elevation:** carried by the material set, not flat drops. Hover lifts
(`translateY(-1px)`, deeper shadow); press sinks. The glossy primary button has a
vertical sheen + `--brand-glow` + inset top light; sinks to an inset on press.

**Hover / press states:** buttons darken (`--brand` → `--brand-strong`) and lift;
active scales to `0.985`. Ghost/icon buttons fill with `--surface-2` and darken
ink. Nav rows go ink-2 → ink on hover, brand + soft-green fill when active. Rows
hover to `--surface-2` (no zebra striping).

**Transparency & blur:** reserved for glass chrome and toasts only — never on
reading surfaces.

**Imagery vibe:** there is essentially none — this is a data product. Warmth comes
from typography and the green accent, not photography. If imagery is ever added,
keep it cool, calm, and out of the way of data.

**Motion:** state-driven, fast, no orchestration. View switch fades + 6px upward
settle (180ms, `cubic-bezier(0.22,1,0.36,1)`). Button/input transitions 120ms.
Toast slides up 8px + fades. Stagger is used in exactly one place (riepilogo's
"Ultimi esami", 40ms step) and numbers count up once on load. Everything resolves
instantly under `prefers-reduced-motion`.

**Dark mode** is a first-class peer — applied via `[data-theme="dark"]` on
`<html>` (a single registered theme scope, every dark value a proper token). The
explicit toggle is stored in `localStorage` as `dw-theme`; the OS preference is
honored by seeding the initial value from `prefers-color-scheme` in a tiny boot
script:

```html
<script>
  document.documentElement.dataset.theme =
    localStorage.getItem('dw-theme')
    || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
</script>
```

---

## Iconography

**Lucide**, outline, **1.5px stroke**, 16–20px, `currentColor`. One library, one
stroke weight, everywhere. No filled, no duotone, no decorative illustrations, no
emoji, no unicode glyphs as icons.

The app's working set: `arrow-left`, `refresh-cw`, `copy`, `external-link`,
`download`, `sun`/`moon`, `log-out`, `calendar`, `graduation-cap`, `search`, `x`,
`chevron-right`, `home`, `file-text`, `euro`/`grid` (servizi), `inbox` (empty),
`check`, `alert-triangle`.

**In this project**, icons are inlined as small Lucide-pathed SVGs (see
`ui_kits/delphi-wrapper/AppShell.jsx`'s `I` map and the component cards) rather
than pulled from a runtime dependency, so the bundled components stay
self-contained. To use the real package in production, add `lucide-react` and
pass `<Icon size={…} />` nodes into the components' `icon` / `leadingIcon` props.

---

## Logo

The product mark is **`assets/delphee-mark.svg`** — an original Delphee *delta*
glyph (Δ, for Delphi) on a brand-green rounded square. Sizes: 24px (sidebar),
28px (mobile header), 40–44px (login). On dark surfaces it sits as-is; to tint it
to the theme's brand value, mask-paint it (`mask-image` on a span with
`background: var(--brand)`).

> The Tor Vergata institutional crest (`unilogo.svg` in the spec) is **not**
> included — see Caveats.

---

## Using the system

Consumers link one file:

```html
<link rel="stylesheet" href="styles.css" />
```

…then read components off the global namespace after loading the compiled bundle:

```html
<script src="_ds_bundle.js"></script>
<script type="text/babel">
  const { Button, DataTable, StatusPill } = window.DelpheeDesignSystem_900988;
</script>
```

Each component has a `.prompt.md` next to it with a one-line "what & when" and a
usage example. The compiler regenerates `_ds_bundle.js`, `_ds_manifest.json` and
the adherence config automatically — don't hand-edit those.

---

## Caveats

- **No live SPA source.** The mount held only `delphee/DESIGN.md`; `src/server/
  static/` (the real screens) wasn't present. The UI kit is built faithfully from
  the spec's component/screen descriptions and app-shell diagram, not from the
  production code. If you can re-attach the full repo, the kit can be aligned
  pixel-for-pixel.
- **No official Tor Vergata logo.** `unilogo.svg` wasn't in the mount, and the
  institutional crest is a protected mark — so an original Delphee delta mark
  stands in its place. **Please drop the real `unilogo.svg` into `assets/`** if
  you want it used.
- **Fonts via Google Fonts.** Fraunces, Hanken Grotesk and Spline Sans Mono load
  through a Google Fonts `@import` rather than self-hosted `@font-face` binaries
  (so the compiler lists 0 fonts). If you need self-hosted webfonts, add the
  `.woff2` files to `tokens/` and swap the `@import` for `@font-face` rules.
