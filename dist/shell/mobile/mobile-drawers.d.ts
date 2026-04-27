import { type ReactNode } from 'react';
import type { IconRailItem } from '../icon-rail.js';
import type { ContextModule, PanelView } from '../types.js';
export interface MobileDrawersProps {
    /** Menu drawer source (icon-rail items). */
    menuItems?: IconRailItem[];
    /** Module drawer source (current app's context-rail module). */
    module?: ContextModule;
    /** Panels drawer source. */
    panelViews?: PanelView[];
    /** Custom content drawers keyed by id from MobileBottomNavItem.opens render fn. */
    customContent?: Record<string, (close: () => void) => ReactNode>;
    className?: string;
}
/**
 * Renders all four mobile drawer slots (Menu / Module / Panels / AI) plus
 * any custom-content drawers. Mount once near the AppShell root; drawers
 * open/close via `ctx.mobileDrawer.open` provider state.
 */
export declare function MobileDrawers({ menuItems, module, panelViews, customContent, }: MobileDrawersProps): import("react/jsx-runtime").JSX.Element;
