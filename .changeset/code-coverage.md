---
'@medalsocial/meda': patch
---

Track code coverage over time via DeepSource. CI now runs
`pnpm test:coverage` and uploads the `coverage/lcov.info` report to
DeepSource on every push, so coverage trend, deltas per PR, and
hotspots become visible in the DeepSource dashboard.

Internal: fixed a vitest 4 quirk where setting both `coverage.include`
and `coverage.exclude` arrays on the top-level `coverage` block silently
zeroed instrumentation. Working around it with `excludeAfterRemap` and
relaxed thresholds (~5% under current floor) so CI catches regressions
without blocking PRs on rounding.

No public API change.
