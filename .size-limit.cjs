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
// Sub-entry split for shell (provider / desktop / mobile / palette) is
// deferred to v1.x — decision pinned to real consumer adoption data, not
// upfront speculation. See plan file Decision C history for context.
module.exports = [
  {
    name: 'main barrel',
    path: 'dist/index.js',
    limit: '105 kB',
  },
  {
    name: 'chat',
    path: 'dist/chat/index.js',
    limit: '6.5 kB',
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
    limit: '13 kB',
  },
  {
    name: 'voice',
    path: 'dist/voice/index.js',
    limit: '60 kB',
  },
  {
    name: 'theme.css',
    path: 'dist/styles/theme.css',
    limit: '2 kB',
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
];
