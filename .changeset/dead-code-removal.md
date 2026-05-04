---
'@medalsocial/meda': patch
---

Remove dead code left over from earlier refactors. No public API change.

- Drop the entire `src/post-preview/chrome/` directory (13 components +
  index + test). The chromes (`InstagramChrome`, `TwitterChrome`,
  `PlatformChrome`, etc.) became internal during the PR #132 PostPreview
  consolidation and are no longer imported by any test, story, or
  platform component. They were not exported from the post-preview
  barrel or `package.json`'s `exports`.
- Drop `src/email-builder/internal/dnd-data.ts` and `drop-zone.tsx` —
  leftovers from a DnD refactor; both were defined but never imported.
- Drop `@react-three/drei` from devDependencies — not imported anywhere
  in `src/`, `demo/`, `scripts/`, or `docs/`.
