---
'@medalsocial/meda': minor
---

feat(shell): opt-in mobile dock + workspace sheet navigation

Adds a Linear-style mobile navigation as an opt-in alternative to the legacy
bottom-nav + four drawers. When `<AppShell variant="workspace">` receives a
`mobileNav` config, the mobile viewport renders:

- a floating **dock** — a pill of pinned destinations plus a standalone brand
  (e.g. Pilot) circle, with a workspace-selector slot that opens
- **one workspace sheet** — a calm, scannable list of the whole nav tree
  (modules as groups, submodules as rows), where a row either navigates or
  reveals a slim chip row of preset views (accordion, one open at a time).

New public types: `AppShellMobileNavConfig`, `MobileDockItem`, `MobileNavTree`,
`MobileNavGroup`, `MobileNavItem`, `MobileNavView`, `MobileNavLinkArgs`.

Fully additive — consumers that don't pass `mobileNav` keep the existing
bottom-nav + drawers unchanged.
