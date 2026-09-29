---
"@medalsocial/meda": minor
---

Lean entry points for customer sites that render only a few meda surfaces (e.g. booking UI).

**Per-feature stylesheets.** `@medalsocial/meda/styles.css` still scans every meda component and is unchanged for existing consumers (~21 KB gzip of CSS). New lean entries generate only what you render:

- `@medalsocial/meda/styles/base.css` — tokens + Tailwind theme bridge + base layer; no component scan, no `@xyflow/react` CSS.
- `@medalsocial/meda/styles/bridge.css` — the theme bridge only, for sites that bring their own shadcn-style tokens (`--primary`, `--card`, `--muted`, …) so meda parts re-theme to them.
- `@medalsocial/meda/calendar/styles.css`, `@medalsocial/meda/primitives/styles.css`, `@medalsocial/meda/workflow-builder/styles.css` — per-feature `@source`. The xyflow stylesheet now lives in the workflow-builder sheet (which `styles.css` still imports).

Calendar + primitives on a lean setup adds ~3.6 KB gzip of CSS (bridge) or ~5.2 KB (base), down from ~21 KB. See README "Lean consumer setup".

**Optional peers.** `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` and `@xyflow/react` are now optional peers, and `three` moved from `dependencies` to an optional peer (only `/voice` uses it). If you import the root barrel, `/shell`, `/kanban`, `/email-builder` or `/workflow-builder` — or the batteries-included `styles.css`, which `@import`s xyflow's stylesheet — make sure these are listed in your own `package.json`: npm and pnpm no longer install optional peers for you. Lean consumers (`/calendar`, `/primitives`, `styles/base.css`, `styles/bridge.css`) need none of them. The unused `@fontsource-variable/geist*` runtime dependencies were dropped; load Geist yourself.

**New primitives** (root and new `@medalsocial/meda/primitives` subpath, no new runtime deps, semantic tokens only): `Button` (primary / secondary / ghost / outline, sm / md / lg, `loading`, `render` prop), `Input` (`invalid` → `aria-invalid`), `ToggleGroup` (chip single-select radiogroup or multi-select `aria-pressed` group, roving tabindex) and `Avatar` with the letters-only `getInitials` helper.
