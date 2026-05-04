---
'@medalsocial/meda': patch
---

Adopt the same biome ruleset as `@medal/v2-web` and pin `@biomejs/biome`
to exact `2.4.14`. Pinning to an exact version is a supply-chain
hardening practice — caret ranges allow malicious-but-semver-valid
patch updates to slip in unnoticed.

The new ruleset enforces `noExplicitAny`, `noConsole`, `noDebugger`,
`noNestedTernary`, `useImportType`, and 20+ other rules across the repo.
All existing violations were repaired. No public API changes.
