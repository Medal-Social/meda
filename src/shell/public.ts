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
} from './index';

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
} from './index';

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
} from './index';

export { useShellState } from './index';
