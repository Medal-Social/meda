---
'@medalsocial/meda': patch
---

Declare `fast-glob`, which `scripts/lint-tokens.mjs` imports, and run
`lint:tokens` in CI.

The design-token linter has been dead: `fast-glob` was never declared, so
`pnpm lint:tokens` failed with `ERR_MODULE_NOT_FOUND` on a clean install. It
went unnoticed because it only ever ran through the `quality` script, and CI
runs `lint`, `typecheck`, `check:stories`, `build`, `test:coverage`,
`registry:validate` and `size-limit` — never `quality`.

No runtime change; devDependency and CI only.
