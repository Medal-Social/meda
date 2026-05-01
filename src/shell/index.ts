// Note: NO 'use client' at the top of this barrel.
// Next.js 14+'s flight loader rejects `export * as Foo` inside a file with
// the directive (see test/nextjs-consumer.test.ts). Each underlying component
// file carries its own 'use client' — Next traces through the barrel and
// applies them per-component. The barrel itself is just a re-exporter.

export type {
  AuthMessageProps,
  AuthOneTapSlotProps,
  AuthProvider,
  AuthProviderButtonProps,
  AuthProviderListProps,
} from '../auth/index.js';
export {
  AuthError,
  AuthNotice,
  AuthOneTapSlot,
  AuthProviderButton,
  AuthProviderList,
} from '../auth/index.js';
// Layout
export { AppShell, AppShellBody } from './app-shell.js';
export type { CommandGroupDefinition } from './command-palette.js';
// Command palette
export { CommandPalette, useCommandGroup, useCommands } from './command-palette.js';
export { ContextRail } from './context-rail.js';
export type { DragModeBannerProps } from './drag-mode-banner.js';
// Drag-and-drop utilities
export { DragModeBanner } from './drag-mode-banner.js';
// Extras (legacy components ported during Phase 15 — opt-in for apps that need them)
export * as Extras from './extras/index.js';
// Rails + main + panel
export type { IconRailItem, IconRailProps, IconRailRenderLinkArgs } from './icon-rail.js';
export { IconRail, RailDivider } from './icon-rail.js';
export type { ShellStorageAdapter } from './layout-state.js';
// Storage adapter (consumers may want to provide their own)
export { createLocalStorageAdapter } from './layout-state.js';
// Hooks + tokens
export { motion } from './motion.js';
export type { PanelViewsProviderProps } from './panel-views-provider.js';
export { PanelViewsProvider } from './panel-views-provider.js';
export type { RailDropSlotProps, RailDropSlotState } from './rail-drop-slot.js';
// Resize primitives
export { RailDropSlot } from './rail-drop-slot.js';
export type { RailDropZonesProps } from './rail-drop-zones.js';
export { RailDropZones } from './rail-drop-zones.js';
export { ResizableHandle, ResizableShell, ResizableShellPanel } from './resizable-shell.js';
export { RightPanel } from './right-panel.js';
// Header (and its individual children for advanced composition)
export type { AppTabsProps } from './shell-header.js';
export { AppTabs, PanelToggle, ShellHeader, WorkspaceSwitcher } from './shell-header.js';
export { ShellMain } from './shell-main.js';
export type { MedaShellProviderProps } from './shell-provider.js';
// Provider + hooks
export { MedaShellProvider, useMedaShell, useShellSelection } from './shell-provider.js';
// Theme
export { DefaultThemeProvider, ThemeToggle, useTheme } from './theme.js';
export { NextThemesAdapter } from './theme-next-themes.js';
// Types
export type {
  AppDefinition,
  AppShellAppTabsConfig,
  AppShellAuthBranding,
  AppShellAuthConfig,
  AppShellContextRailConfig,
  AppShellIconRailConfig,
  AppShellRightPanelConfig,
  AppShellVariant,
  AppShellWorkspaceConfig,
  AppTabRenderLinkArgs,
  CommandDefinition,
  ContextItem,
  ContextModule,
  ContextRailHeader,
  ContextRailScroll,
  MobileBottomNavItem,
  PanelMode,
  PanelView,
  ShellLinkRenderArgs,
  ShellMainLayout,
  ShellRenderContext,
  ShellViewport,
  ThemeAdapter,
  WorkspaceDefinition,
  WorkspaceMenuItem,
} from './types.js';
export { useShellViewport } from './use-shell-viewport.js';
