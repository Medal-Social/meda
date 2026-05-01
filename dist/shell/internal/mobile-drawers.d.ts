import { type ReactNode } from 'react';
import type { IconRailItem, IconRailProps } from '../icon-rail.js';
import type { ContextModule, ContextRailHeader, ContextRailScroll, PanelView, WorkspaceMenuItem } from '../types.js';
export interface MobileDrawersProps {
    /** Menu drawer source (icon-rail items). */
    menuItems?: IconRailItem[];
    /** Active menu item id, sourced from icon rail config. */
    menuActiveId?: string;
    /** Custom menu link renderer, sourced from icon rail config. */
    menuRenderLink?: IconRailProps['renderLink'];
    /** Workspace-level menu items rendered after icon rail links on mobile. */
    workspaceMenuItems?: WorkspaceMenuItem[];
    /** Workspace-level footer rendered after workspace items and the theme toggle. */
    workspaceMenuFooter?: ReactNode;
    /** Module drawer source (current app's context-rail module). */
    module?: ContextModule;
    /** App id used when rendering module custom content. */
    moduleAppId?: string;
    /** Header behavior mirrored from the desktop ContextRail. */
    moduleHeader?: ContextRailHeader;
    /** Scroll behavior mirrored from the desktop ContextRail. */
    moduleScroll?: ContextRailScroll;
    /** Panels drawer source. */
    panelViews?: PanelView[];
    /**
     * Default panel view id. Used when ctx.panel.activeView is null so the
     * mobile panels drawer opens to the same view as the desktop right panel.
     * Without this, mobile would always fall back to panelViews[0].
     */
    defaultView?: string;
    /** Custom content drawers keyed by id from MobileBottomNavItem.opens render fn. */
    customContent?: Record<string, (close: () => void) => ReactNode>;
    className?: string;
}
/**
 * Renders all four mobile drawer slots (Menu / Module / Panels / AI) plus
 * any custom-content drawers. Mount once near the AppShell root; drawers
 * open/close via `ctx.mobileDrawer.open` provider state.
 */
export declare function MobileDrawers({ menuItems, menuActiveId, menuRenderLink, workspaceMenuItems, workspaceMenuFooter, module, moduleAppId, moduleHeader, moduleScroll, panelViews, defaultView, customContent, }: MobileDrawersProps): import("react/jsx-runtime").JSX.Element;
