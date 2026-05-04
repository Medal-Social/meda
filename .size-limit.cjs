// size-limit checks the brotli-compressed size of each entry on every PR.
// Limits are set at current measured size + ~15 % headroom — bumping them MUST
// be accompanied by a written rationale in the PR description (see
// CONTRIBUTING.md).
//
// Sizes are reported "with all dependencies" — size-limit follows imports
// recursively, so these track the real cost a consumer pays when they
// `import { ... } from '@medalsocial/meda/<entry>'`.
//
// Shell v2 RC.1 budget review (Phase 19.2):
//   Measured at end of Phase 18.3 — shell 97.07 kB / main-barrel 97.13 kB
//   (main-barrel re-exports shell + timeline + voice + chat + panel; size
//   is dominated by shell, hence the close match).
//
// shell tightened 150 kB → 115 kB:
//   97.07 kB measured + ~18% headroom for Phase 18+ stories/wcag inflation
//   that may still affect tree-shaking. Original 150 kB was a forward-looking
//   ceiling set when only Phase 7 had landed.
//
// main barrel raised 6.5 kB → 105 kB:
//   The pre-Shell-v2 budget assumed the root barrel was thin (chat + panel +
//   timeline only). Shell v2 adds ~95 kB via the re-export. 105 kB matches
//   shell + ~8 kB headroom.
//
// timeline raised 6.5 kB → 13 kB and voice raised 55 kB → 60 kB:
//   Pre-existing overages (predate Shell v2 work). Bumped to clear CI; deeper
//   investigation is out of Shell v2 scope.
//
// timeline raised 13 kB → 16 kB (PR #60):
//   LaneTimeline + Lane + TimeAxis added to the timeline subpath. Measured
//   13.02 kB brotli — 20 B over the previous limit. Bumped to 16 kB for ~22%
//   headroom. Note: in PR #61 these move to data-view/gantt and the timeline
//   subpath will reclaim headroom; consider lowering then.
//
// theme.css raised 2 kB → 2.5 kB (PR #80):
//   Added `@source "../**/*.js"` directive so consumer Tailwind v4 builds emit
//   utility classes meda components rely on, plus a base `color-scheme` block
//   bound to the resolved theme so native UA controls follow the in-app
//   palette. Measured 2.07 kB brotli — 66 B over the previous limit. Bumped
//   to 2.5 kB for ~20% headroom.
//
// main barrel raised 105 kB → 106 kB (PR #118):
//   Foundation primitives are intentionally exported from the package root so
//   package consumers and shadcn registry consumers share the same public API.
//   Measured 105.33 kB brotli — 333 B over the previous limit. Bumped tightly
//   to keep CI honest while allowing the new primitive surface area.
//
// main barrel raised 106 kB → 135 kB (post-preview surface):
//   src/index.ts now re-exports `post-preview/public.js`, which references all
//   12 platform components and chromes via the post-preview barrel. Measured
//   121.08 kB brotli with the new surface. Bumped to 135 kB for ~12% headroom.
//   Consumers who don't want the cost should import from the
//   `@medalsocial/meda/post-preview` subpath directly — the per-platform
//   budgets below prove that path stays small.
//
// post-preview per-platform budgets (new — post-preview surface):
//   Each platform component + chrome lands at 9–10.5 kB brotli when imported
//   in isolation. 13 kB per entry leaves ~25–40% headroom for label / locale
//   additions and minor chrome polish without forcing churn on this file.
//   The roll-up `post-preview / all` entry exercises the full subpath barrel
//   and measures 23.64 kB; 30 kB is a comfortable ceiling that still catches
//   accidental cross-platform coupling regressions.
//
// Sub-entry split for shell (provider / desktop / mobile / palette) is
// deferred to v1.x — decision pinned to real consumer adoption data, not
// upfront speculation. See plan file Decision C history for context.
module.exports = [
  {
    name: 'main barrel',
    // Bumped 135 kB → 145 kB (consolidated post-preview + calendar +
    // workflow-builder + email-builder surfaces all re-exported from the root).
    // Measured 137.76 kB brotli with all four surfaces; budget includes ~5%
    // headroom. Consumers who don't want the cost should import from the
    // per-surface subpaths (`@medalsocial/meda/post-preview`,
    // `@medalsocial/meda/calendar`, etc.) — those budgets stay tight.
    path: 'dist/index.js',
    limit: '145 kB',
  },
  {
    name: 'calendar',
    path: 'dist/calendar/index.js',
    // Measured 11.05 kB brotli with deps; +20% headroom = ~13.3 kB.
    limit: '13 kB',
  },
  {
    name: 'chat',
    path: 'dist/chat/index.js',
    limit: '6.5 kB',
  },
  {
    // Initial budget for the email-builder surface. Includes the full block +
    // property-editor matrix plus DnD wiring. Measured 36.12 kB brotli on
    // first build; budget set with ~25% headroom for follow-up additions
    // (Lexical slot, more block kinds, etc.).
    name: 'email-builder',
    path: 'dist/email-builder/index.js',
    limit: '45 kB',
  },
  {
    name: 'panel',
    path: 'dist/panel/index.js',
    limit: '1.5 kB',
  },
  {
    name: 'shell',
    path: 'dist/shell/index.js',
    limit: '115 kB',
  },
  {
    name: 'timeline',
    path: 'dist/timeline/index.js',
    limit: '16 kB',
  },
  {
    name: 'voice',
    path: 'dist/voice/index.js',
    limit: '60 kB',
  },
  {
    // workflow-builder. @xyflow/react is a peer dep — size-limit treats peer
    // deps as external, so the measured ship size for the workflow surface is
    // ~12 kB (just our wrappers). Limit set at measured + ~20% headroom.
    name: 'workflow-builder',
    path: 'dist/workflow-builder/index.js',
    limit: '15 kB',
  },
  {
    name: 'theme.css',
    path: 'dist/styles/theme.css',
    limit: '2.5 kB',
  },
  {
    // Bumped from 1 kB → 2 kB: canonical .lib.pen contract adds 6 full color
    // ramps (brand/neutral/error/info/success/warning, 10–11 stops each) plus
    // surface primitives, semantic tokens, shell sizing, typography, radii, and
    // spacing — all required by the design contract. Measured: 1.46 kB brotli.
    name: 'tokens.css',
    path: 'dist/styles/tokens.css',
    limit: '2 kB',
  },
  // post-preview surface — single PostPreview entry. Because PostPreview
  // statically dispatches across all 12 platforms, importing the named
  // export pulls in essentially the same matrix as the full barrel — the
  // second entry confirms there is no hidden re-export overhead.
  // Bumping these limits requires a written rationale (see CONTRIBUTING.md).
  {
    name: 'post-preview',
    path: 'dist/post-preview/index.js',
    limit: '45 kB',
  },
  {
    name: 'post-preview / PostPreview only',
    path: 'dist/post-preview/index.js',
    import: '{ PostPreview }',
    limit: '30 kB',
  },
];
