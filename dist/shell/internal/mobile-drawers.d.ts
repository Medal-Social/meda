import { type ReactNode } from 'react';
import type { IconRailItem, IconRailProps } from '../icon-rail.js';
import type { ContextModule, PanelView } from '../types.js';
export interface MobileDrawersProps {
    /** Menu drawer source (icon-rail items). */
    menuItems?: IconRailItem[];
    /** Active menu item id, sourced from icon rail config. */
    menuActiveId?: string;
    /** Custom menu link renderer, sourced from icon rail config. */
    menuRenderLink?: IconRailProps['renderLink'];
    /** Module drawer source (current app's context-rail module). */
    module?: ContextModule;
    /** App id used when rendering module custom content. */
    moduleAppId?: string;
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
export declare function MobileDrawers({ menuItems, menuActiveId, menuRenderLink, module, moduleAppId, panelViews, defaultView, customContent, }: MobileDrawersProps): import("react/jsx-runtime").JSX.Element;
