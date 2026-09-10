---
'@medalsocial/meda': patch
---

Remove the unused `fast-glob` devDependency added in #215.

`scripts/lint-tokens.mjs` on this branch uses Node's built-in
`glob` from `node:fs/promises`; nothing in the repo imports `fast-glob`.
The CI wiring from #215 stays — `pnpm lint:tokens` still runs, and still fails
on a violation.
