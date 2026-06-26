# Design

> The previous DESIGN.md (registrar console / mono-everywhere / 4-col stat band / top-stripe cards) read as **AI slop** — green-on-white, hero-metric template, identical card grids, kicker-on-everything. The product is a student's day-to-day academic companion, not a backend console. This file is the rewrite.

> **Source of truth.** The canonical tokens, components, and reference screens live in `Delphee Design System/` (tokens in `Delphee Design System/tokens/`, primitives in `Delphee Design System/components/`, recreated screens in `Delphee Design System/ui_kits/delphi-wrapper/`). This file is the prose rationale — *why* the choices land where they do. When the two disagree, the design system wins; the spec is updated to match.

## Brief

A friendly, polished, accessible student portal for Tor Vergata students, distributed as a REST-API wrapper around the ageing "Delphi" career-management portal. The product is **Delphee** (an original brand mark built on the Delphi delta, not the Tor Vergata institutional crest — see [Logo](#logo)). **Wide appeal** — a 19-year-old checking their grade after an exam and a 28-year-old mature student downloading a ricevuta should both feel at home. The bar is "real product" — Satispay / Revolut / your bank's app — not a developer console and not a 2010s university portal.

**Surface**: the SPA in `src/server/static/` (the only UI in this repo). Debugging hand-tool is fine; production-grade polish is the goal.

**Tensions to resolve**:
- The data is dense (matricola, voti, CFU, SSD, IUV, codici). Density is good — but friendly density, not bureaucratic density.
- The brand color (Tor Vergata green, `#007d34`) is institutional. It earns its place in status, primary actions, and current selection — never as the page's spine.
- Italian copy + Italian audience + Italian context. Warmth comes from typography and tone, not from cream backgrounds.

**Non-goals**: no marketing language, no hero illustration, no LLM chat, no "AI features", no dashboard tropes (4-col stat grids, top-stripe cards, identical card grids, "kicker on every section" eyebrows).

---

## Theme & color

**Color strategy: Restrained, with one committed moment.** Neutral surfaces carry the whole interface; Tor Vergata green appears on fewer than 1 in 12 surfaces — primary actions, the session-active marker, success states, current tab. Anywhere else it's a mistake.

**Default: light.** Dark mode is a first-class peer (toggle in header, system default honored, `localStorage` override), not an afterthought.

**Body background: a true off-white, not cream.** Tinted with `0.003` chroma toward `hue 90` (a barely-perceptible warmth, well below the AI-cream band of C ≥ 0.06 / hue 40–100). The page should not read as "warm paper" or "sand" — it should read as "white, slightly softer than pure white." Cards float on it as pure white.

**Ink: near-black, with a hint of cool warmth.** `oklch(0.22 0.015 250)` — readable as black, never feels blue, never feels brown.

**Accent: Tor Vergata green, used sparingly.** `#007d34` for fill (primary buttons, success chips, session-active dot). A lighter green for text on dark surfaces (links, active labels) and a faint green for selected-row tints.

OKLCH throughout. Neutrals carry a `0.002–0.006` chroma toward the brand hue (152) for subtle consistency — never enough to read as "greenish gray."

```css
:root {
  /* Brand */
  --brand:        oklch(0.50 0.137 152);   /* #007d34, primary fill */
  --brand-strong: oklch(0.43 0.137 152);   /* hover / pressed */
  --brand-text:   oklch(0.46 0.130 152);   /* links, active labels */
  --brand-soft:   oklch(0.94 0.045 152);   /* chip bg, hover tint */

  /* Neutrals — light */
  --bg:        oklch(0.985 0.003 90);      /* almost-white, barely warm */
  --surface:   oklch(1 0 0);               /* cards, panels, modals */
  --ink:       oklch(0.22 0.015 250);      /* primary text */
  --ink-2:     oklch(0.45 0.012 250);      /* secondary */
  --ink-3:     oklch(0.60 0.010 250);      /* labels, hints */
  --line:      oklch(0.91 0.005 250);      /* hairline rules */
  --line-strong: oklch(0.82 0.006 250);    /* input borders */

  /* Semantic */
  --ok:     oklch(0.50 0.137 152);          /* = brand */
  --ok-bg:  oklch(0.94 0.045 152);
  --warn:   oklch(0.62 0.13 65);
  --warn-bg: oklch(0.96 0.04 80);
  --bad:    oklch(0.52 0.18 27);
  --bad-bg: oklch(0.96 0.03 27);
  --info:   oklch(0.52 0.12 250);
  --info-bg: oklch(0.96 0.03 250);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --brand-strong: oklch(0.58 0.14 152);
    --brand-text:   oklch(0.74 0.14 152);
    --brand-soft:   oklch(0.28 0.05 152);

    --bg:        oklch(0.16 0.012 250);
    --surface:   oklch(0.20 0.013 250);
    --ink:       oklch(0.95 0.005 250);
    --ink-2:     oklch(0.72 0.010 250);
    --ink-3:     oklch(0.58 0.010 250);
    --line:      oklch(0.30 0.010 250);
    --line-strong: oklch(0.40 0.012 250);

    --ok-bg:  oklch(0.28 0.05 152);
    --warn:   oklch(0.78 0.12 65);
    --warn-bg: oklch(0.30 0.05 75);
    --bad:    oklch(0.72 0.16 27);
    --bad-bg: oklch(0.30 0.07 27);
    --info:   oklch(0.72 0.12 250);
    --info-bg: oklch(0.30 0.05 250);
  }
}
:root[data-theme="dark"] { /* same dark token block */ }
```

**Contrast** (non-negotiable): body text on `--surface` or `--bg` ≥ 7:1; `--ink-2` ≥ 4.5:1; `--ink-3` ≥ 4.5:1 against its own surface (placeholders, labels); `--on-brand` on `--brand` ≥ 4.5:1.

---

## Typography

Three families, three jobs. Italian warmth from the display serif; friendly workhorse from the body sans; clear figures from the data mono.

| Voice | Family | Use |
|---|---|---|
| **Display** | Fraunces (variable, optical sizing, 300–700) | Hero greeting, page titles, big numbers in riepilogo |
| **Body** | Hanken Grotesk (variable, 400–600) | All prose, labels, navigation, button text, table headers, descriptions |
| **Data** | Spline Sans Mono (variable, 400–600) | Codes (matricola, IUV, CFU, SSD, importi), dl values, code blocks, table cells with structured data |

**Pairing logic**: serif + grotesque + mono is the strongest non-AI-default triple, and deliberately avoids the Inter / JetBrains-Mono pairing that now reads as AI-default. The display serif carries warmth and humanity (Italian craft); Hanken Grotesk is a warm grotesque that stays a dead-legible workhorse at 14px in dense tables; Spline Sans Mono makes data scannable without the default code-font reflex. The contrast axes hold: humanist serif (display) × grotesque (body) × mono (data) — Fraunces' soft forms sit against Hanken's tighter grotesque structure rather than echoing it.

**Fraunces specifics**:
- Variable axis on `wght` (300–700) and `opsz` (9–144). Use `opsz=144` for the hero greeting (display optical size), `opsz=24` for `t-xl` headings.
- `SOFT=0` for warmth, not at full hard.
- Italic for emphasis where useful (e.g., "Bentornato, *nome*" optional flourish). Optional, not mandatory.

**Fixed rem scale, no clamps** (this is a product UI, viewed at consistent DPI):

| Token | Size | Use |
|---|---|---|
| `--t-2xs` | 0.6875rem (11px) | micro labels, code subscripts |
| `--t-xs`  | 0.75rem (12px)   | chip labels, captions |
| `--t-sm`  | 0.875rem (14px)  | dense table cells, helper text |
| `--t-md`  | 1rem (16px)      | body, inputs, default cell |
| `--t-lg`  | 1.125rem (18px)  | panel titles |
| `--t-xl`  | 1.5rem (24px)    | page titles |
| `--t-2xl` | 2rem (32px)      | large page titles, hero greeting |
| `--t-3xl` | 3rem (48px)      | hero greeting (Fraunces display optical) |

**Weight**: 400 body, 500 nav/active, 600 buttons/headings, 700 reserved for the very rare emphasis. **Serif (Fraunces) is one step heavier than the rest of the system** — the display font reads thin at the same weights that work for Hanken Grotesk, so: hero text (page titles, stat values, profile name, login name, tasse total) is **500**; serif headings (sidebar title, mobile top bar title, tasse anno title) are **700**. The serif's 500-at-hero mirrors Hanken's 500-at-table-density: presence without weight theatrics.

**Line-height**: 1.55 prose, 1.3 headings, 1.45 table rows. **Letter-spacing**: 0 everywhere except Fraunces display (negative `0.015em` at hero size only) and Spline Sans Mono (`-0.005em` for tabular figures). **Text-wrap**: `balance` on h1–h2, `pretty` on prose.

**No all-caps tracked eyebrows.** No mono labels with `letter-spacing: 0.06em` on every section. Labels are sentence case in Hanken Grotesk, period.

---

## Spacing & layout

**4px base scale**: `--sp-1`=4 · `--sp-2`=8 · `--sp-3`=12 · `--sp-4`=16 · `--sp-5`=24 · `--sp-6`=32 · `--sp-7`=48 · `--sp-8`=64 · `--sp-9`=96.

Vary the steps. Never pad every block by the same amount.

**Radius** (softened toward squircle for the glass material): 5px (chips, badges) · 10px (buttons, inputs) · 14px (cards, panels) · 20px (modals) · 9999px (avatars, round icons).

**Elevation**: `--shadow-1` / `--shadow-2` remain for legacy callers, but elevation is now carried by the material system below (`--elev-1`, `--elev-2`, `--edge-hi`, `--well`), which layers an ambient + contact shadow with a specular top edge rather than a single flat drop shadow.

**Z-index**: `--z-sticky: 10` (header, tab bar) · `--z-dropdown: 20` · `--z-overlay: 30` (modal backdrop) · `--z-modal: 40` · `--z-toast: 50` · `--z-tooltip: 60`.

---

## Material & depth — "Liquid Glass"

> A deliberate departure from the original flat / hairline-only system, toward an Apple-style **liquid-glass** material: dimensional but still minimal. The parent design discipline treats glassmorphism as an AI-default tell — this is the considered exception, not the reflex: glass is confined to chrome, depth is carried by a coherent token set, and **body text never gets the material** (readability and WCAG contrast are unchanged from the flat system).

Three material roles, each a token group in `styles.css`:

1. **Ambient field** (`body::before`): a fixed, faint light environment — a cool key light from above, a whisper of brand green from the far corner — so the glass has something to refract. Faint by rule (reads as soft light, never a coloured background). Brighter, luminous variant in dark mode.

2. **Glass chrome** (`--glass`, `--glass-blur`, `--edge-hi`): translucent + `backdrop-filter: saturate(180%) blur(20px)` + a specular top edge. Applied **only** to chrome that content passes under: sidebar, mobile top bar, drawer, toast. Light = translucent white; dark = translucent ink. Content surfaces are *not* glass.

3. **Tiles & wells** — the depth language for containers and controls:
   - **Raised tile** (`--elev-1` / `--elev-2` + `--edge-hi`, vertical `--sheen-top`→`--sheen-bot` gradient, `--rim` hairline): cards, tables, list containers, skeletons. Layered ambient + contact shadow with a lit top edge. Hover lifts (`translateY(-1px)`, shadow grows); press sinks.
   - **Recessed well** (`--well` inset shadow): inputs, the filter tray, inline code chips — they read as pressed *into* the glass, the inverse of raised tiles.
   - **Glossy primary**: brand button with a vertical sheen, `--brand-glow`, inset top light; lifts on hover, sinks to an inset on press.
   - **Hero tile**: the riepilogo media lozenge is the page's one focal moment — a raised brand-glass tile that floats.

Motion: lifts/sinks use `--ease-out` at `--dur-fast`; under `prefers-reduced-motion` they resolve instantly (the global duration override applies — the depth stays, the animation doesn't).

### App shell

```
┌─────────────────────────────────────────────────────────┐
│  SIDEBAR (240px)        │   MAIN                         │
│                         │                                │
│  ▲ Delphee              │   ┌─────────────────────────┐  │
│    Tor Vergata          │   │  page title + actions   │  │
│                         │   │                          │  │
│  Home                   │   │  content                 │  │
│  Esami              ▸   │   │                          │  │
│  Iscrizione         ▸   │   │  max-width 880px         │  │
│  Tasse                  │   │  (tables may exceed)     │  │
│  Documenti          ▸   │   │                          │  │
│  Servizi                │   │                          │  │
│                         │   │                          │  │
│  ───                    │   │                          │  │
│  ● Sessione attiva      │   │                          │  │
│    <STUDENT_NAME>       │   │                          │  │
│    <MATRICOLA>          │   │                          │  │
│                         │   │                          │  │
│  ☾  ↗  Esci             │   │                          │  │
└─────────────────────────────────────────────────────────┘
```

- **Sidebar on desktop (≥ 900px)**: 240px fixed, full-height, glass chrome (`--glass` + `backdrop-filter: blur(20px) saturate(180%)`). Logo + product name at top. Section nav (Home, Esami, Iscrizione, Tasse, Documenti, Servizi). Sections that expand show children indented. Bottom: session status block + theme toggle + logout.
- **Mobile (< 900px)**: no bottom tab bar. The sidebar is replaced by a hamburger drawer that slides in from the left (same nav, same session block). The drawer is the single source of navigation truth on mobile.
- **Content column**: max-width **880px** on the main panel, centered. Tables may exceed 880 and scroll horizontally inside their own container.
- **No cards-as-section-wrapper.** A section is a heading + content. Hairline `--line` rules divide, no rounded boxes.

**What this fixes**:
- Replaces the 10-tab horizontal scroller (a developer pattern) with a navigation that real students get.
- Replaces the "every section is a card" pattern with a flowing document.

### Section structure

A page on the SPA looks like:

```
[page title — Fraunces t-2xl (32px), weight 500, opsz 144, balance]
[optional page subtitle — Hanken Grotesk t-sm (14px), ink-2]
─
[primary content]
[optional secondary content, separated by hairline]
[footer: data freshness line, mono]
```

**The page title is the only heading on the page.** Sub-sections use:
- Hanken Grotesk `t-md` weight 600 for sub-section labels (e.g. "La tua carriera", "Ultimi esami"), with a 1px `--line` rule below.
- No `<h3>` for the riepilogo. The page is one document; sub-labels are inline section dividers.

**Empty states are inline** — no centered card, no "Nothing here" apology. A short paragraph + a one-line hint, e.g.:

> _Non hai appelli aperti per questo insegnamento._
> Prova un altro codice o torna più tardi.

---

## Components

**Every component has: default · hover · focus-visible · active · disabled · loading · error.** No half states.

### Header / sidebar

- 56px height (sticky on mobile, fixed-position on desktop sidebar).
- Logo (delphee mark, mask-painted to `--brand`) + product name in Fraunces weight 700, `t-md`, `opsz 24`.
- Right side on mobile: theme toggle + logout (icon buttons, ghost).
- Section nav rows: Hanken Grotesk `t-md`, weight 500, ink-2 default → ink on hover, brand-text on active, `2px` solid `--brand` left bar on the active row (NOT a side-stripe on a card; a nav indicator, which is its semantic).

### Buttons

- **Primary**: solid `--brand` fill, white text, weight **600** (the design system uses bold weights — 500 reads as default, 600 reads as a committed action), `--sp-2/--sp-4` padding, **10px** radius, 40px min-height. Hover `--brand-strong`; active scale `0.985`; focus-visible 2px brand ring at 2px offset.
- **Secondary**: white fill, `--line-strong` border, ink text, weight 600, 10px radius, `var(--elev-1)` shadow. Hover surface-2 + lift.
- **Ghost**: transparent, ink-2 → ink on hover.
- **Icon-only**: 40px square, ghost, ink-2.
- **Loading**: inline 14px spinner + label, `aria-busy`, disabled.
- **Disabled**: 50% opacity, `not-allowed`.

### Inputs

- 44px target, **10px** radius (`--r-ctrl`), white fill, `--line-strong` border, `t-md` Hanken Grotesk, weight 400.
- Placeholder ink-3 at 4.5:1.
- Focus: 2px brand-soft ring at 2px offset, border switches to brand.
- Error: `--bad` border, helper text in `--bad` below the field.
- Labels above the field in Hanken Grotesk `t-sm` ink-2, weight 500. **No uppercase, no mono, no letter-spacing.**
- Optional **leading icon** (16px, ink-3) absolutely positioned in the well — used on the esami filter's "Cerca" input and the appelli search. The input is padded to clear the icon.

### Filter bar

- Soft surface-2 fill, `--sp-3` padding, **14px** radius (`--r-card`), hairline border.
- Inputs are **38px** tall (slightly shorter than form inputs, to read as a tray not a form).
- "Filtra" is a primary button on the right.
- On small screens it stacks vertically with full-width controls.

### Tables

- The workhorse (esami, verbali, pendenti, appelli, certificati, altri bollettini).
- White surface container, **14px** radius (`--r-card`), 1px `--rim` border, `overflow-x: auto` inside.
- Header row: surface-2 fill, Hanken Grotesk `t-xs` weight 600, ink-2, `text-transform: none` (no uppercase), `text-align: left`, sticky on vertical scroll.
- Cells: Hanken Grotesk `t-sm`, ink, `text-align: left`. Right-aligned numerics (CFU, voto, importo, data) in Spline Sans Mono, `tnum`, ink-2.
- Row hover: surface-2.
- No zebra striping.
- Row-in stagger on mount (40ms step, up to 14 rows) — the only stagger the design system allows; it stays because tabular data is dense and a slow cascade reads as celebration, not load.

### Status indicators (status, not decoration)

A single shape: a square **5px-radius** pill with **Hanken Grotesk `t-xs` weight 600** text. **No dot, no all-caps, no mono.** Examples:
- `Attiva` → brand fill, white text
- `Scaduta` → warn fill, warn text
- `Assente` → ink-3 text on surface-2
- `Superato` → ok-bg fill, ok text
- `Non superato` → bad-bg fill, bad text
- `In corso` → info-bg fill, info text

Voto badges for special cases:
- `30 e lode` → ok fill (green), white text
- `Idoneo` / `Ottimo` / `Buono` → ink fill on neutral bg, slightly emphasized
- numeric `18–30` → plain text in mono, no badge (numbers are data, not status)

### Cards (used **only** for content that genuinely needs elevation)

- Anagrafica head (photo + name + key data) is one card.
- Tasse rate row is one card.
- Servizi cert row is NOT a card — it's a list row.
- Certificati row is NOT a card — it's a list row.
- 14px radius, `--rim` border, raised tile: sheen gradient fill + `--elev-1` + `--edge-hi` (see Material & depth).

### Empty states

- No card, no centered icon, no "Nothing here".
- A two-line sentence in Hanken Grotesk, ink-2, max-width 50ch. First line is the truth ("Non hai esami con questo filtro"); second is a hint ("Prova a togliere un filtro o cerca un altro corso").
- Optional small icon (lucide, 16px, ink-3) on the left, only when it adds meaning (e.g., a calendar for appelli).

### Toast

- Bottom-right (desktop) / top (mobile), 14px radius, glass surface (`--glass` + blur), `--elev-2` + `--edge-hi`.
- Hanken Grotesk `t-sm` text. Small icon (16px) on the left in the semantic color, no dot, no side stripe.
- Auto-dismiss 4s. Dismissible with a × button.
- Bottom-anchored on mobile, with safe-area-inset padding so it clears the home indicator on notched devices.

### Login

- Centered, full-height. No card top-stripe. The whole page IS the login.
- Top: delphee mark (44px). Wordmark below: "Delphee" in Fraunces **t-2xl, weight 700, opsz 144** — the login is the first thing the user sees, and the wordmark is the brand statement, so it goes one step heavier than the in-app page titles (500) and sits at the same weight as the sidebar title. Lede "Il tuo portale" in Hanken Grotesk t-md, ink-2.
- Form: 360px wide, centered. Two inputs (matricola, password), primary button (lg size, full-width).
- Below the form: a one-line helper ("Solo per studenti dell'Università di Roma Tor Vergata.") in Hanken Grotesk t-sm, ink-3.
- No illustration, no mascot, no card. Just type.

---

## Motion

State-driven, fast, no orchestration.

- **Tab / view switch**: content fades + 6px upward settle, 180ms, `cubic-bezier(0.22, 1, 0.36, 1)`.
- **Button / input**: bg + border 120ms, focus ring instant.
- **Toast**: slide-up 8px + fade, 180ms.
- **Stagger**: ONLY for the "Ultimi esami" list on riepilogo (up to 5 items, 40ms step) and for the first 14 rows of a freshly-loaded table. Nothing else uses stagger.
- **Number count-up**: riepilogo's CFU and media counts animate from 0 to value over 600ms (the design system's `--dur-count`), once on first load and on every refresh. Resolves instantly under `prefers-reduced-motion`.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Iconography

**Lucide** (outline, 1.5px stroke, 16–20px, `currentColor`). The set is small and consistent — every icon in the app comes from the same library with the same stroke.

Specific picks:
- `arrow-left` (back), `refresh-cw` (refresh), `copy` (copy code), `external-link` (open external), `download` (PDF), `sun` / `moon` (theme), `log-out` (logout), `calendar` (date / appelli), `graduation-cap` (laurea / carriera conclusa), `search` (filter / search), `x` (close / clear filter), `chevron-right` (nav drilldown), `inbox` (empty).

No filled, no duotone, no decorative illustrations.

---

## Logo

The product mark is `assets/delphee-mark.svg` — an original Delphee *delta* glyph (Δ, for Delphi) on a brand-green rounded square. Single green fill (`#007d34`).

- Light: as-is via `<img>` (served at `/static/delphee-mark.svg`).
- Dark: same asset via CSS `mask-image` on a span with `background: var(--brand)` so the green tints to the theme's brand value.
- Sizes: **28px** (sidebar header and mobile top bar), **44px** (login).
- Also used as the page favicon.

> The Tor Vergata institutional crest was not used here: the design system explicitly defers to the delphee mark (the institution's mark is a protected asset and an original glyph is the right choice for a third-party wrapper). Drop the real `unilogo.svg` into `assets/` if you want it used in a downstream deployment.

---

## Accessibility

- WCAG 2.1 AA across light and dark.
- All controls keyboard-reachable, visible 2px brand focus ring at 2px offset.
- Sidebar nav: `role="navigation"`, current page marked with `aria-current="page"`.
- Tables: real `<table>` semantics with `<th scope>`.
- Status: never color-only — every chip has text. Voti display both the number and a textual cue (lode badge includes the text "30 e lode", not just an icon).
- Touch targets ≥ 44px.
- `prefers-reduced-motion` honored.
- `prefers-color-scheme` honored; explicit toggle stored in `localStorage` (`dw-theme`).

---

## What this design explicitly rejects

- The previous "registrar console" / mono-everywhere / 4-col stat band / top-stripe cards / identical card grids / kicker-on-everything style.
- Cream / sand / paper body backgrounds. The bg is a barely-warm off-white, not a tinted paper.
- The 10-tab horizontal scroller. Replaced with a sidebar on desktop and a hamburger drawer on mobile (the drawer is the single source of navigation truth — no bottom tab bar).
- Mono labels with `letter-spacing: 0.06em` on every section. Labels are Hanken Grotesk sentence case.
- Side-stripe borders on cards.
- A 4-col hero-metric grid on riepilogo. The page is a welcome screen, not a dashboard.
- Identical card grids (servizi / certificati as `repeat(auto-fit, minmax(260px, 1fr))`). Both are now list rows in a single column.
- Decorative gradients on card headers.

---

## Tokens summary

The canonical tokens live in `Delphee Design System/tokens/`:

- `colors.css` — `--brand*`, `--bg`, `--surface*`, `--ink*`, `--line*`, semantic `--ok/--warn/--bad/--info(-bg)` (and their dark peers under `[data-theme="dark"]`).
- `typography.css` — `--font-display` / `--font-body` / `--font-mono`, the `--t-*` scale, `--w-*` weights, `--lh-*` line heights, the Fraunces optical-axis helpers `--fraunces-hero` and `--fraunces-head`.
- `spacing.css` — `--sp-*` 4px scale, `--r-chip/--r-ctrl/--r-card/--r-modal/--r-full` radius, `--content-max` / `--sidebar-w` / `--header-h` layout, `--z-*` z-index.
- `material.css` — the "liquid glass" material set: `--glass`, `--glass-blur`, `--rim`, `--sheen-top/-bot`, `--edge-hi`, `--well`, `--elev-1/-2`, `--brand-glow`, and the `--ambient` field gradient.
- `motion.css` — `--dur-fast/--dur-base/--dur-count`, `--ease-out/--ease-in-out`, `--stagger-step` (40ms), plus the `prefers-reduced-motion` reset.
- `fonts.css` — the Google Fonts `@import` for Fraunces + Hanken Grotesk + Spline Sans Mono.
- `base.css` — the body reset, the ambient field (`body::before` uses `--ambient`), focus-visible, selection.

`src/server/static/styles.css` is the production port: it declares the same tokens with the same names, darkens them under `[data-theme="dark"]` (and the `prefers-color-scheme` media query for users without an explicit toggle), and adds the component rules that consume them. **No literal colors, sizes, or durations in component rules** — every value is a token, and any token change in the design system propagates without code edits.
