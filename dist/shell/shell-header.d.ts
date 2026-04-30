import { type ReactNode } from 'react';
import type { AppShellAppTabsConfig, WorkspaceMenuItem } from './types.js';
export interface WorkspaceSwitcherProps {
    /**
     * Configurable dropdown items. When provided, REPLACES the default
     * "Manage workspaces / Settings / Profile / Sign out" entries. The theme
     * toggle is still inserted automatically by meda — between the items and
     * the footer — so consumers don't have to reimplement theme cycling.
     *
     * When omitted, the package-default items render (1.x behavior).
     */
    menuItems?: WorkspaceMenuItem[];
    /**
     * Extra content rendered after all items and the theme toggle. Backwards-
     * compatible alias for the legacy `workspaceMenuFooter` prop.
     */
    menuFooter?: ReactNode;
    /** @deprecated Use `menuFooter` instead. */
    workspaceMenuFooter?: ReactNode;
}
export declare function WorkspaceSwitcher({ menuItems, menuFooter, workspaceMenuFooter, }?: WorkspaceSwitcherProps): import("react/jsx-runtime").JSX.Element;
export interface AppTabsProps extends AppShellAppTabsConfig {
}
export declare function AppTabs({ renderLink }?: AppTabsProps): import("react/jsx-runtime").JSX.Element;
export declare function PanelToggle(): import("react/jsx-runtime").JSX.Element;
export interface ShellHeaderProps {
    globalActions?: ReactNode;
    /**
     * Optional center-region content. Replaces the default application tabs when
     * provided.
     */
    headerCenter?: ReactNode;
    appTabsRenderLink?: AppShellAppTabsConfig['renderLink'];
    className?: string;
    /**
     * Forwarded to the internal `<WorkspaceSwitcher>`. See
     * `WorkspaceSwitcherProps` for the full shape.
     */
    workspaceMenuItems?: WorkspaceMenuItem[];
    workspaceMenuFooter?: ReactNode;
}
export declare function ShellHeader({ globalActions, headerCenter, appTabsRenderLink, className, workspaceMenuItems, workspaceMenuFooter, }?: ShellHeaderProps): import("react/jsx-runtime").JSX.Element | null;
