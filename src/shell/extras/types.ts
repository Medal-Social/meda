'use client';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

// Legacy shell types — preserved at extras/ for the ported components
// (ShellTabBar, ShellScrollableContent, WorkbenchLayout, ShellDesktopPanelDock)
// that keep their v0.x API contract. New code should use the v2 types from
// src/shell/types.ts instead.

export type ShellContentLayout = 'workspace' | 'centered' | 'fullbleed';
export type ShellViewportBand = 'mobile' | 'tablet' | 'desktop' | 'wide' | 'ultrawide';

export interface ShellTab {
  id: string;
  label: string;
  to?: string;
  icon?: LucideIcon;
}

export interface ShellNavItem {
  to: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  shortcut?: string;
}

export interface ShellRailItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export interface ShellModuleDefinition {
  id: string;
  label: string;
  description: string;
  items: ShellNavItem[];
  headerTabs?: ShellTab[];
}

export interface ShellPanelDefinition {
  id: string;
  label: string;
  icon: LucideIcon;
  global?: boolean;
  hidden?: boolean;
}

export interface ShellCommandDefinition {
  id: string;
  label: string;
  to: string;
  icon: LucideIcon;
  group: string;
  shortcut?: string;
}

export interface ShellPanelRenderContext {
  sectionKey: string;
  viewId: string;
  selectedProductId: string | null;
}

export type ShellPanelRenderer = (context: ShellPanelRenderContext) => ReactNode;

export interface ShellRouteContext {
  pathname: string;
  params: Record<string, string | undefined>;
}

export interface ShellHostAdapter {
  route: ShellRouteContext;
  navigate: (to: string) => void;
}

export interface ShellViewDefinition {
  shellContentLayout?: ShellContentLayout;
  shellTabs?: ShellTab[] | ((context: ShellRouteContext) => ShellTab[]);
  shellActions?: ReactNode | ((context: ShellRouteContext) => ReactNode);
  shellPanelViews?: string[];
}
