---
'@medalsocial/meda': major
---

Shell v2 — breaking rewrite.

- 4-layer token system shipped in package (canonical contract from
  `00-design-system.lib.pen` — brand purple ramp + neutral zinc + status
  ramps + surface primitives + shell semantic).
- New components: AppShell, AppShellBody, ShellHeader (opinionated 56px),
  WorkspaceSwitcher, AppTabs, PanelToggle, IconRail (60px no expand,
  hover tooltip), RailDivider, ContextRail (resizable, persisted),
  ResizableShell, ShellMain (3 layouts), RightPanel (4 modes), MobileHeader,
  MobileBottomNav, MobileDrawers, CommandPalette (⌘K), ThemeToggle,
  MedalSocialMark.
- Removed: ShellFrame, ShellHeaderFrame, ShellAppRail, ShellModuleNav,
  ShellPanelRail, ShellPanelToggle, NavigationArea, ShellState (use the
  new MedaShellProvider + v2 components).
- Removed types from public surface (preserved at
  `@medalsocial/meda/shell/extras` for apps using ported legacy components):
  ShellContentLayout, ShellViewportBand, ShellTab, ShellNavItem,
  ShellRailItem, ShellModuleDefinition, ShellPanelDefinition,
  ShellCommandDefinition, ShellRouteContext, ShellHostAdapter,
  ShellViewDefinition.
- Tailwind v4 theme bridge at `@medalsocial/meda/styles` (CSS-first via
  `@theme inline`; consumers `@import` it once). Removed `./styles.css`
  and `./tailwind.preset` exports.
- Framework support: Vite + React, Next.js 14+ App Router, generic React.
  Optional `next-themes` peer-dep for `themeAdapter='next-themes'`.
- See PR description for the full breaking-change list and migration
  guide.
