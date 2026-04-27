// size-limit checks the brotli-compressed size of each entry on every PR.
// Limits are set at current measured size + ~15 % headroom — bumping them MUST
// be accompanied by a written rationale in the PR description (see
// CONTRIBUTING.md).
//
// Sizes are reported "with all dependencies" — size-limit follows imports
// recursively, so these track the real cost a consumer pays when they
// `import { ... } from '@medalsocial/meda/<entry>'`.
//
// Shell v2 ships an opinionated header + 4-mode panel + command palette +
// mobile drawers as one cohesive surface. The pre-Shell-v2 budget of 6.5 kB
// was set against the v0.x partial-shell. Task 7.3.1 introduced @base-ui/react/menu
// for WorkspaceSwitcher which pulls in @floating-ui/* (~45 kB new dep). Measured
// post-7.3.1 size is 59.7 kB; 68 kB = measured + ~15% headroom. Reassess
// split-into-sub-entries for v1.1+ once consumer adoption proves which slices
// apps actually need. Future phases (cmdk, vaul, react-resizable-panels) are
// already partially shared via @base-ui's floating-ui dep so marginal cost
// for those phases should be smaller than this jump.
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
    limit: '68 kB',
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
