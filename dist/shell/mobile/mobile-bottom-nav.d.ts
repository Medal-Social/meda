export interface MobileBottomNavProps {
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
export declare function MobileBottomNav({ className }: MobileBottomNavProps): import("react/jsx-runtime").JSX.Element | null;
