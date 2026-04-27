// size-limit checks the brotli-compressed size of each entry on every PR.
// Limits are set at current measured size + ~15 % headroom — bumping them MUST
// be accompanied by a written rationale in the PR description (see
// CONTRIBUTING.md).
//
// Sizes are reported "with all dependencies" — size-limit follows imports
// recursively, so these track the real cost a consumer pays when they
// `import { ... } from '@medalsocial/meda/<entry>'`.
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
    limit: '6.5 kB',
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
    name: 'styles.css',
    path: 'dist/styles.css',
    limit: '1 kB',
  },
];
