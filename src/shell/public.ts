export {
  NavigationArea,
  ShellAppRail,
  ShellDesktopPanelDock,
  ShellFrame,
  ShellHeaderFrame,
  ShellPanelToggle,
  ShellModuleNav,
  ShellPanelRail,
  ShellScrollableContent,
  ShellStateProvider,
  ShellTabBar,
  WorkbenchLayout,
} from './index.js';

export {
  buildShellSectionCommands,
  buildShellShortcutMap,
  getDefaultShellPanelView,
  getShellPanelCollection,
  getShellPanelView,
  getShellActionsFromMatches,
  getShellContentLayoutFromMatches,
  getShellContentMaxWidth,
  getShellPanelViewsFromMatches,
  getShellTabsFromMatches,
  getResolvedShellPanelWidth,
  isShellPanelViewAvailable,
  resolveShellPanelView,
} from './index.js';

export type {
  ShellCommandDefinition,
  ShellContentLayout,
  ShellHostAdapter,
  ShellModuleDefinition,
  ShellNavItem,
  ShellPanelDefinition,
  ShellRailItem,
  ShellRenderContext,
  ShellRouteContext,
  ShellSearchParamsAdapter,
  ShellStateContextValue,
  ShellTab,
  ShellViewDefinition,
  ShellViewportBand,
} from './index.js';

export { useShellState } from './index.js';
