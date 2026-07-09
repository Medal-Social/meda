---
'@medalsocial/meda': minor
---

feat(shell): full-width `bar` variant for the mobile dock

`AppShellMobileNavConfig.variant` now accepts `'bar'` alongside the default
`'pill'`. The `bar` renders a flat, full-width bottom bar of evenly-spread slots
— each a larger icon + label with a tinted active state — mirroring the native
mobile app; the brand item (e.g. Pilot) sits inline as the last slot. Fully
additive: consumers that omit `variant` keep the floating pill.
