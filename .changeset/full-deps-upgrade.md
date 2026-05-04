---
'@medalsocial/meda': patch
---

Upgrade every dependency to its latest version and pin all entries in
`dependencies` and `devDependencies` to **exact** versions (no caret
ranges). Peer dependencies stay as ranges per their semantics.

Pinning to exact versions is a supply-chain hardening practice — caret
ranges allow malicious-but-semver-valid patch updates to slip in
between `pnpm install` runs.

Notable bumps:

- `@biomejs/biome` `2.4.12` → `2.4.14`
- `storybook` and `@storybook/*` `10.3.5` → `10.3.6`
- `vitest` and `@vitest/*` `4.1.4` → `4.1.5`
- `vite` `8.0.9` → `8.0.10`
- `chromatic` `16.6.0` → `16.6.3`
- `jsdom` `29.0.2` → `29.1.1`
- `wrangler` `4.84.1` → `4.87.0`
- `react-resizable-panels` `4.10.0` → `4.11.0`
- `@react-three/fiber` `9.6.0` → `9.6.1`
- `three` `0.170.0` → `0.184.0`
- `@changesets/changelog-github` `0.5.2` → `0.6.0`

Also folds in the strict biome ruleset that was lost from PR #133:

- `noExplicitAny`, `noConsole`, `noDebugger`, `noNestedTernary`,
  `useImportType`, `useNumericSeparators`, `useErrorMessage`, plus
  20 other rules — all `error`.
- Per-folder overrides: `scripts/**` and `demo/**` allow console;
  `**/*.test.{ts,tsx}`, `vitest.setup.ts`, and `.storybook/**` allow
  empty blocks and bare async.

All existing violations were repaired. No public API changes.
