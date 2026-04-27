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
    opens: 'menu-drawer' | 'module-drawer' | 'panels-drawer' | 'ai-drawer' | ((close: () => void) => ReactNode);
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
