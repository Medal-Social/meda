---
"@medalsocial/meda": minor
---

feat(shell): mobile-first chrome, grouped panel-views dropdown, unified context-rail seam, and borderless header.

App shell additions and refinements (all additive / backwards-compatible):

- **`headerLeading` slot** — new optional left-region content rendered right after the `WorkspaceSwitcher` (spacing only, no divider). Threaded through `AppShell` (workspace variant), `AppShellWorkspace`, and `ShellHeader`. On mobile it surfaces inside the menu drawer as horizontally-scrolling section tabs.
- **Grouped panel-views dropdown** — `PanelToggle` now accepts `panelViews` and renders a single grouped pill (panel icon + chevron) that opens a dropdown of registered views; selecting the open view closes the panel, selecting another focuses it. With no views it stays a plain open/close toggle. `ShellHeader` gains `showPanelToggle` + `panelViews`; the workspace shell wires them from the resolved right-panel views.
- **Borderless unified header** — removed the `border-b` from `ShellHeader` and the mobile header; header height grows to 64px with a new 48px `--shell-mobile-header-height` token. `headerCenter` now lays the desktop header out as a 3-column grid.
- **Mobile header workspace switcher** — the root mobile header workspace identity is now a button that opens the menu drawer (`mobileDrawer.setOpen('menu-drawer')`), accepts and centers `headerCenter` (e.g. a clock), and uses `bg-background`.
- **Mobile drawers** — menu drawer renders `sectionTabs` (fed from `headerLeading`) and auto-closes on anchor click; module drawer gains `moduleActiveItemId` + `moduleRenderLink` for active-state and router-link parity with the desktop context rail.
- **Unified context-rail seam** — the separate resize handle and collapse pull-tab are merged into one `group/seam` element: a single brand-tinted seam line (revealed on rail hover / grip focus) that resizes via pointer drag, with a collapse/expand grip pill. The rail's right border is now hover-only (removed the always-on `border-r`). The collapse grip remains the keyboard-accessible control.
- **Icon rail `labelVisibility`** — new `'tooltip' | 'visible'` prop; `'visible'` renders a wider labelled rail (`--shell-rail-label-width`) with an icon frame and inline label, active items use a solid `bg-primary` treatment.
- **`svh` viewport units** — workspace/chat chrome and `AppShellBody` switch from `100vh`/`h-screen` to `100svh`/`h-svh` so mobile browser chrome doesn't clip the layout.
- **Removed the built-in command palette fallback** — `AppShellWorkspace` renders the bare shell instead of wrapping it in meda's own empty `CommandPalette`. Host apps that ship their own palette no longer get a duplicate empty dialog. Apps that relied on the auto-mounted palette must now wrap the shell in `<CommandPalette>` themselves.
- **`workflow-builder` CSS** — `@xyflow/react/dist/style.css` is imported once from the package stylesheet (`@medalsocial/meda/styles`) instead of from the canvas component module, so the styles are bundled with the theme rather than re-imported per consumer build.
- Dropped `[content-visibility:auto]` from `ShellMain` (it interfered with measured/sticky children).

New public types: `IconRailLabelVisibility`, `PanelToggleProps`; new config fields `AppShellIconRailConfig.labelVisibility` and `AppShellContextRailConfig.renderLink`.
