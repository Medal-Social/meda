import type { MobileBottomNavItem } from '../types.js';
export interface MobileBottomNavProps {
    /**
     * Override the items to render. When omitted, falls back to
     * `ctx.mobileBottomNav` from the provider. AppShellWorkspace passes a
     * derived list filtered to drawers that actually have content, so taps
     * never dispatch into the void.
     */
    items?: MobileBottomNavItem[];
    className?: string;
}
/**
 * Mobile-only bottom navigation bar.
 *
 * Renders 4 buttons sourced from `ctx.mobileBottomNav` (provider-controlled,
 * overrideable per-app via `mobileBottomNav` prop). Each button click opens
 * the corresponding drawer via `ctx.mobileDrawer.setOpen`.
 *
 * The Menu button supports long-press (500ms) to open the command palette.
 *
 * Hidden on non-mobile viewports and when the right panel is in fullscreen mode.
 */
export declare function MobileBottomNav({ items, className }: MobileBottomNavProps): import("react/jsx-runtime").JSX.Element | null;
