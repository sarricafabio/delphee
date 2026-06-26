---
name: delphee-design
description: Use this skill to generate well-branded interfaces and assets for Delphee — the REST-API wrapper that makes Università di Roma Tor Vergata's "Delphi" student portal usable — either for production or throwaway prototypes/mocks. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.
If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.
If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

Quick map:
- `styles.css` — the single entry point; link it and everything (tokens, fonts) comes with it.
- `tokens/` — colors, typography, spacing, material ("liquid glass"), motion, base reset.
- `components/<group>/` — React primitives (Button, IconButton, Input, Select, StatusPill, Card, DataTable, Toast, NavItem). Each has a `.prompt.md` with usage.
- `ui_kits/delphi-wrapper/` — the product recreated (login → home · esami · tasse); read it for layout/shell patterns.
- `guidelines/` — foundation specimen cards.
- `assets/` — the Delphee mark.

Core rules to honor: Italian copy, sentence case, no emoji; Tor Vergata green used on <1 in 12 surfaces; barely-warm off-white page with pure-white cards; Fraunces (display) × Hanken Grotesk (body) × Spline Sans Mono (data); liquid-glass material only on chrome; Lucide outline icons at 1.5px; dark mode as a first-class peer.
