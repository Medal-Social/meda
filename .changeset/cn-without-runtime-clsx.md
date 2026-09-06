---
'@medalsocial/meda': patch
---

`cn` no longer imports `clsx` at runtime — the class-value flattener is inlined
instead. `clsx` remains a dependency for its `ClassValue` type, which is part of
`cn`'s public signature; `import type` is erased at compile time. No API or
behaviour change.

Why a twenty-line inline is worth it: `clsx` is also a dependency of `recharts`,
so a bundler that keeps the chart vendor graph in one chunk puts the single
shared `clsx` module in **that** chunk. Every eager importer of `cn` — which is
nearly every component here — then hard-depends on the whole chart bundle, even
on surfaces that render no chart.

Measured in the Medal Social web app (2026-09-06), same commit, only this file
changed:

| | chunks in the `/login` server closure | bytes | chart chunk reachable |
| --- | --- | --- | --- |
| before | 165 | 4,758,902 | yes (392 kB `vendor-recharts`) |
| after | 164 | 4,357,355 | no |

That is **−401,547 bytes (−8.4%)** off the login server closure, and the chart
vendor chunk drops out of the first-request graph entirely. The edge was a
single `import { x }` — `clsx` — from the shell's `cn`.

Naming `clsx` into another manual chunk was tried first and does **not** work:
Rolldown honours the assignment (verified by probing the `manualChunks` return)
but still emits `clsx` inside the chart chunk, byte-identically, because the
recharts CommonJS-interop group is kept cohesive. Removing the import is the
only reliable fix.

The reimplementation is pinned to the implementation it replaced by an
equivalence test over nested arrays, dictionaries, falsy values, numbers,
bigints and tailwind-conflict cases, so any drift in the flattener fails the
suite rather than silently changing class output.
