---
'@medalsocial/meda': patch
---

Refresh every dependency to the newest version this package can take. The published
output is unchanged — all 467 files in `dist/` are byte-identical before and after —
so this is a maintenance-only patch: no API, no types and no runtime behaviour move.

Runtime dependencies bumped: `@base-ui/react` 1.7.0 → 1.8.0,
`react-resizable-panels` 4.12.4 → 4.13.1, `tailwind-merge` 3.6.0 → 3.7.0. Peer
dependency ranges are untouched, so no consumer has to change anything to take this.
