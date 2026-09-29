---
"@medalsocial/meda": major
---

Lean entry points for customer sites that render only a few meda surfaces (e.g. booking UI), optional feature peers, and booking primitives.

## Breaking: feature peers are optional — migration

`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` and `@xyflow/react` are now **optional** peers, and `three` moved from `dependencies` to an optional peer (next to the already-optional `@react-three/fiber`). npm and pnpm no longer install them automatically, so a consumer that relied on auto-installed peers fails to resolve them after upgrading.

Anyone importing the root `@medalsocial/meda`, `@medalsocial/meda/shell`, `/email-builder`, `/kanban`, `/workflow-builder` or `@medalsocial/meda/styles.css` must run:

```bash
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities @xyflow/react
```

and, if using the 3D `VoiceOrb` entry (`@medalsocial/meda/voice`), additionally:

```bash
pnpm add three @react-three/fiber
```

Lean consumers — `@medalsocial/meda/calendar`, `@medalsocial/meda/primitives`, `styles/bridge.css`, `styles/base.css` and the per-feature stylesheets — need nothing.

Known consumers that do not list all of these peers and need the migration before bumping: `dispatch`, `medal-monorepo/open/pilot-ui`, `pilot-talk/web`, `medal-labs/Picasso/software/dashboard`, `medal-labs/pr-dashboard`.

The unused `@fontsource-variable/geist*` runtime dependencies were dropped; if you `@import` them, list them yourself.

`@xyflow/react`'s stylesheet is now vendored into the package (`dist/styles/vendor/xyflow.css`, pinned to the xyflow version meda is built against), so `styles.css` and `workflow-builder/styles.css` compile even without `@xyflow/react` installed.

## Lean stylesheets

`@medalsocial/meda/styles.css` still scans every meda component and produces the same CSS as before (~21 KB gzip). New lean entries generate only what you render:

- `@medalsocial/meda/styles/base.css` — tokens + Tailwind theme bridge + base layer; no component scan, no xyflow CSS.
- `@medalsocial/meda/styles/bridge.css` — the theme bridge only, for sites that bring their own shadcn-style tokens (`--primary`, `--card`, `--muted`, …) so meda parts re-theme to them.
- `@medalsocial/meda/calendar/styles.css`, `@medalsocial/meda/primitives/styles.css`, `@medalsocial/meda/workflow-builder/styles.css` — per-feature `@source`. xyflow's CSS lives in the workflow-builder sheet (which `styles.css` still imports).

Calendar + primitives on a lean setup adds ~3.6 KB gzip of CSS (bridge) or ~5.2 KB (base), down from ~21 KB. See README "Lean consumer setup".

## New primitives

Exported from the root and the new `@medalsocial/meda/primitives` subpath; no new runtime deps, semantic tokens only: `Button` (primary / secondary / ghost / outline, sm / md / lg, `loading`, `render` prop), `Input` (`invalid` → `aria-invalid`), `ToggleGroup` (chip single-select radiogroup or multi-select `aria-pressed` group, roving tabindex) and `Avatar` with the letters-only `getInitials` helper.
