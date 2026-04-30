'use client';
import type { LucideIcon } from 'lucide-react';
import type { AnchorHTMLAttributes, ReactNode } from 'react';

export interface AppDefinition {
  id: string;
  label: string;
  /**
   * Either a Lucide-style icon component or a rendered React node such as a
   * custom brand SVG.
   */
  icon: LucideIcon | ReactNode;
  /** Optional route target for consumers that render app tabs as links. */
  to?: string;
}

export interface AppTabRenderLinkArgs {
  app: AppDefinition;
  isActive: boolean;
  className: string;
  children: ReactNode;
  linkProps: AnchorHTMLAttributes<HTMLAnchorElement>;
}

export interface AppShellAppTabsConfig {
  renderLink?: (args: AppTabRenderLinkArgs) => ReactNode;
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
  items?: ContextItem[];
  render?: (ctx: ShellRenderContext) => ReactNode;
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
  linkProps: AnchorHTMLAttributes<HTMLAnchorElement>;
}

export interface CommandDefinition {
  id: string;
  label: string;
  icon?: LucideIcon;
  group: string;
  shortcut?: string;
  /** Display-only alias for `shortcut`; `shortcut` wins when both are supplied. */
  hotkey?: string;
  run: () => void | Promise<void>;
}

export interface ThemeAdapter {
  theme: 'light' | 'dark' | 'system';
  setTheme: (t: 'light' | 'dark' | 'system') => void;
  resolvedTheme: 'light' | 'dark';
}

/**
 * AppShell renders one of three shell modes:
 * - `auth` — split-screen marketing + form (signed-out)
 * - `workspace` — header + rails + main + panel (signed-in work surface;
 *   collapses to mobile header + bottom nav + drawers on mobile)
 * - `chat` — transcript-dominant layout (conversational AI)
 */
export type AppShellVariant = 'auth' | 'workspace' | 'chat';

/** IconRail configuration for `<AppShell variant="workspace">`. */
export interface AppShellIconRailConfig {
  mainItems: import('./icon-rail.js').IconRailItem[];
  utilityItems?: import('./icon-rail.js').IconRailItem[];
  footer?: ReactNode;
  activeId?: string;
  renderLink?: import('./icon-rail.js').IconRailProps['renderLink'];
}

/** ContextRail configuration for `<AppShell variant="workspace">`. */
export interface AppShellContextRailConfig {
  appId: string;
  module: ContextModule;
  activeItemId?: string;
}

/** RightPanel configuration for `<AppShell variant="workspace">`. */
export interface AppShellRightPanelConfig {
  panelViews: PanelView[];
  defaultView?: string;
}

/**
 * A single configurable item in the WorkspaceSwitcher dropdown.
 * Either `href` (renders as a link) or `onClick` (renders as a button) MUST
 * be provided; supplying both makes the item a button that fires `onClick`
 * AND navigates to `href` afterwards.
 */
interface WorkspaceMenuItemBase {
  id: string;
  label: ReactNode;
  icon?: LucideIcon | ReactNode;
  /** Insert a `<DropdownMenuSeparator />` immediately after this item. */
  separatorAfter?: boolean;
  /** Visual intent — `destructive` paints with the destructive token. */
  variant?: 'default' | 'destructive';
}

export type WorkspaceMenuItem = WorkspaceMenuItemBase &
  ({ href: string; onClick?: () => void } | { onClick: () => void; href?: string });

/**
 * Workspace dropdown configuration for `<AppShell variant="workspace">`.
 *
 * When `menuItems` is provided, it REPLACES the package-default menu
 * ("Manage workspaces", "Settings", "Profile", "Sign out"). The theme toggle
 * is still inserted automatically by meda — between the items and the footer
 * — so consumers don't have to reimplement theme cycling.
 *
 * When `menuItems` is omitted, the package defaults render unchanged (the
 * existing 1.x behavior). This is fully additive and non-breaking.
 */
export interface AppShellWorkspaceConfig {
  menuItems?: WorkspaceMenuItem[];
  /** Extra slot rendered after all items and the theme toggle. */
  menuFooter?: ReactNode;
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

export interface AppShellAuthBranding {
  brandName?: ReactNode;
  brandMark?: ReactNode;
  appName?: ReactNode;
  tagline?: ReactNode;
}
