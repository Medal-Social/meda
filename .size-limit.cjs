// size-limit checks the brotli-compressed size of each entry on every PR.
// Limits are set at current measured size + ~15 % headroom — bumping them MUST
// be accompanied by a written rationale in the PR description (see
// CONTRIBUTING.md).
//
// Sizes are reported "with all dependencies" — size-limit follows imports
// recursively, so these track the real cost a consumer pays when they
// `import { ... } from '@medalsocial/meda/<entry>'`.
//
// shell — Forward-looking 150 kB budget for Phase 7-14 RC.1 build-out.
// Current measurement: ~60 kB (Phase 7 — header + base-ui menu).
// Projection through Phase 14 (~125 kB):
//   + Tooltip primitive (IconRail)            ~+15 kB
//   + react-resizable-panels (ResizableShell) ~+12 kB
//   + Mobile drawers (vaul)                   ~+15 kB
//   + Command palette (cmdk)                  ~+12 kB
// 150 kB = ~125 kB projection + ~15% headroom.
//
// Sub-entry split (provider / desktop / mobile / palette) is deferred
// to v1.x — decision pinned to real consumer adoption data, not
// upfront speculation. See plan file Decision C history for context.
module.exports = [
  {
    name: 'main barrel',
    path: 'dist/index.js',
    limit: '6.5 kB',
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
    limit: '150 kB',
  },
  {
    name: 'timeline',
    path: 'dist/timeline/index.js',
    limit: '6.5 kB',
  },
  {
    name: 'voice',
    path: 'dist/voice/index.js',
    limit: '55 kB',
  },
  {
    name: 'theme.css',
    path: 'dist/styles/theme.css',
    limit: '2 kB',
  },
  {
    name: 'tokens.css',
    path: 'dist/styles/tokens.css',
    limit: '1 kB',
  },
];
