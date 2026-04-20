import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

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
}

export interface ShellCommandDefinition {
  id: string;
  label: string;
  to: string;
  icon: LucideIcon;
  group: string;
  shortcut?: string;
}

export interface ShellRenderContext {
  sectionKey: string;
  viewId: string;
  selectedProductId: string | null;
}

export type ShellPanelRenderer = (context: ShellRenderContext) => ReactNode;

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
