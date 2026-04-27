// Legacy public surface — imports from source files directly since index.ts now re-exports v2 only.
// Phase 17 deletes this file along with the legacy component files.

// Extras (moved to extras/ during Phase 15)
export { ShellDesktopPanelDock } from './extras/shell-desktop-panel-dock.js';
export { ShellScrollableContent } from './extras/shell-scrollable-content.js';
export { ShellTabBar } from './extras/shell-tab-bar.js';
export { WorkbenchLayout } from './extras/workbench-layout.js';
// Legacy components
export { NavigationArea } from './navigation-area.js';
export { ShellAppRail } from './shell-app-rail.js';
export { ShellFrame } from './shell-frame.js';
// Legacy compat shims inside shell-header.tsx
export { ShellHeaderFrame, ShellPanelToggle } from './shell-header.js';
export {
  getResolvedShellPanelWidth,
  getShellContentMaxWidth,
} from './shell-layout-utils.js';
export { ShellModuleNav } from './shell-module-nav.js';
export { ShellPanelRail } from './shell-panel-rail.js';
export {
  getShellActionsFromMatches,
  getShellContentLayoutFromMatches,
  getShellPanelViewsFromMatches,
  getShellTabsFromMatches,
} from './shell-route-utils.js';
export type {
  ShellSearchParamsAdapter,
  ShellStateContextValue,
} from './shell-state.js';
export { ShellStateProvider, useShellState } from './shell-state.js';
export type {
  ShellCommandDefinition,
  ShellContentLayout,
  ShellHostAdapter,
  ShellModuleDefinition,
  ShellNavItem,
  ShellPanelDefinition,
  ShellPanelRenderContext,
  ShellRailItem,
  ShellRouteContext,
  ShellTab,
  ShellViewDefinition,
  ShellViewportBand,
} from './types.js';
// Utility functions from their actual source locations
export {
  buildShellSectionCommands,
  buildShellShortcutMap,
  getDefaultShellPanelView,
  getShellPanelCollection,
  getShellPanelView,
  isShellPanelViewAvailable,
  resolveShellPanelView,
} from './utils.js';
