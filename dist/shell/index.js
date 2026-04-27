// Note: NO 'use client' at the top of this barrel.
// Next.js 14+'s flight loader rejects `export * as Foo` inside a file with
// the directive (see test/nextjs-consumer.test.ts). Each underlying component
// file carries its own 'use client' — Next traces through the barrel and
// applies them per-component. The barrel itself is just a re-exporter.
// Layout
export { AppShell, AppShellBody } from './app-shell.js';
// Command palette
export { CommandPalette, useCommandGroup, useCommands } from './command-palette.js';
export { ContextRail } from './context-rail.js';
// Extras (legacy components ported during Phase 15 — opt-in for apps that need them)
export * as Extras from './extras/index.js';
// Rails + main + panel
export { IconRail, RailDivider } from './icon-rail.js';
// Storage adapter (consumers may want to provide their own)
export { createLocalStorageAdapter } from './layout-state.js';
export { MobileBottomNav } from './mobile/mobile-bottom-nav.js';
export { MobileDrawers } from './mobile/mobile-drawers.js';
// Mobile (individual exports + namespaced fallback)
export { MobileHeader } from './mobile/mobile-header.js';
// Hooks + tokens
export { motion } from './motion.js';
// Resize primitives
export { ResizableHandle, ResizableShell, ResizableShellPanel } from './resizable-shell.js';
export { RightPanel } from './right-panel.js';
// Header (and its individual children for advanced composition)
export { AppTabs, PanelToggle, ShellHeader, WorkspaceSwitcher } from './shell-header.js';
export { ShellMain } from './shell-main.js';
// Provider + hooks
export { MedaShellProvider, useMedaShell, useShellSelection } from './shell-provider.js';
// Theme
export { DefaultThemeProvider, ThemeToggle, useTheme } from './theme.js';
export { NextThemesAdapter } from './theme-next-themes.js';
export { useShellViewport } from './use-shell-viewport.js';
