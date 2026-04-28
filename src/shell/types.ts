'use client';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export interface AppDefinition {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface WorkspaceDefinition {
  id: string;
  name: string;
  icon: ReactNode;
}

export interface ContextModule {
  id: string;
  label: string;
  description?: string;
  items: ContextItem[];
}

export interface ContextItem {
  id: string;
  label: string;
  icon: LucideIcon;
  to: string;
  description?: string;
  shortcut?: string;
}

export interface PanelView {
  id: string;
  label: string;
  icon: LucideIcon;
  render: (ctx: ShellRenderContext) => ReactNode;
}

export type PanelMode = 'closed' | 'panel' | 'expanded' | 'fullscreen';
export type ShellMainLayout = 'workspace' | 'centered' | 'fullbleed';
export type ShellViewport = 'mobile' | 'tablet' | 'desktop' | 'wide' | 'ultrawide';

export interface MobileBottomNavItem {
  id: string;
  label: string | (() => string);
  icon: LucideIcon;
  opens:
    | 'menu-drawer'
    | 'module-drawer'
    | 'panels-drawer'
    | 'ai-drawer'
    | ((close: () => void) => ReactNode);
}

export interface ShellRenderContext {
  workspaceId: string;
  appId: string;
}

export interface ShellLinkRenderArgs {
  item: ContextItem;
  isActive: boolean;
  className: string;
  children: ReactNode;
}

export interface CommandDefinition {
  id: string;
  label: string;
  icon?: LucideIcon;
  group: string;
  shortcut?: string;
  run: () => void | Promise<void>;
}

export interface ThemeAdapter {
  theme: 'light' | 'dark' | 'system';
  setTheme: (t: 'light' | 'dark' | 'system') => void;
  resolvedTheme: 'light' | 'dark';
}

export type AppShellVariant = 'auth' | 'workspace' | 'chat';

export interface AppShellIconRailConfig {
  mainItems: import('./icon-rail.js').IconRailItem[];
  utilityItems?: import('./icon-rail.js').IconRailItem[];
  footer?: ReactNode;
  activeId?: string;
}

export interface AppShellContextRailConfig {
  appId: string;
  module: ContextModule;
  activeItemId?: string;
}

export interface AppShellRightPanelConfig {
  panelViews: PanelView[];
  defaultView?: string;
}

export interface AppShellAuthConfig {
  title: ReactNode;
  description?: ReactNode;
  brandName?: ReactNode;
  brandMark?: ReactNode;
  eyebrow?: ReactNode;
  preview?: ReactNode;
  actions?: ReactNode;
}
