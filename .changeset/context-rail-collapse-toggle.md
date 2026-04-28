---
'@medalsocial/meda': patch
---

`<ContextRail>` now ships with an always-visible chevron toggle on its right edge that collapses and re-expands the rail. The chevron sits on the rail's edge when expanded and naturally migrates to the IconRail's right edge when collapsed. Width animates with a 200ms ease-in-out transition (or instant snap for users with `prefers-reduced-motion: reduce`). The collapsed state was already persisted per-workspace via `ctx.contextRail.collapsed`; this release adds the UI affordance to flip it. No public API change — works automatically inside `<AppShell variant="workspace">`.
