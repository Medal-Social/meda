---
'@medalsocial/meda': patch
---

Refresh every dependency to the newest version this package can take. The code this
package ships is unchanged — all 467 files in `dist/` are byte-identical before and
after — and no export, no type and no `peerDependencies` range moved, so nothing in a
consuming app has to change to take this.

Three runtime dependencies do move underneath it: `@base-ui/react` 1.7.0 → 1.8.0,
`react-resizable-panels` 4.12.4 → 4.13.1 and `tailwind-merge` 3.6.0 → 3.7.0. Those
resolve in your install rather than being bundled here, so behaviour inherited from
them can differ even though meda's own output does not.
