'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef } from 'react';
import { cn } from '../../lib/utils.js';
import { useMedaShell } from '../shell-provider.js';
import { useShellViewport } from '../use-shell-viewport.js';
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
export function MobileBottomNav({ className }) {
    const ctx = useMedaShell();
    const band = useShellViewport();
    if (band !== 'mobile')
        return null;
    if (ctx.panel.mode === 'fullscreen')
        return null;
    return (_jsx("nav", { "aria-label": "Mobile navigation", className: cn('flex h-[var(--shell-bottom-nav-height)] items-center justify-around border-t border-border bg-card', className), children: ctx.mobileBottomNav.map((item) => (_jsx(MobileBottomNavButton, { item: item }, item.id))) }));
}
/** Long-press threshold in milliseconds */
const LONG_PRESS_DURATION = 500;
function MobileBottomNavButton({ item }) {
    const ctx = useMedaShell();
    const Icon = item.icon;
    const label = typeof item.label === 'function' ? item.label() : item.label;
    const isMenu = item.id === 'menu';
    const longPressTimerRef = useRef(null);
    const longPressFiredRef = useRef(false);
    const cancelTimer = () => {
        if (longPressTimerRef.current !== null) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
    };
    const handlePointerDown = () => {
        if (!isMenu)
            return;
        longPressFiredRef.current = false;
        longPressTimerRef.current = setTimeout(() => {
            longPressFiredRef.current = true;
            longPressTimerRef.current = null;
            ctx.commandPalette.setOpen(true);
        }, LONG_PRESS_DURATION);
    };
    const handlePointerUp = () => {
        cancelTimer();
    };
    const handlePointerLeave = () => {
        cancelTimer();
    };
    const handlePointerCancel = () => {
        cancelTimer();
    };
    const handleClick = () => {
        if (isMenu && longPressFiredRef.current) {
            // Long-press already fired — suppress the regular click action
            longPressFiredRef.current = false;
            return;
        }
        if (typeof item.opens === 'string') {
            ctx.mobileDrawer.setOpen(item.opens);
        }
        else {
            // Custom render fn — open a custom drawer keyed by the item's id
            ctx.mobileDrawer.setOpen(item.id);
        }
    };
    return (_jsxs("button", { type: "button", onPointerDown: handlePointerDown, onPointerUp: handlePointerUp, onPointerLeave: handlePointerLeave, onPointerCancel: handlePointerCancel, onClick: handleClick, "aria-label": label, className: "flex h-full flex-1 flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-foreground", children: [_jsx(Icon, { size: 20, "aria-hidden": "true" }), _jsx("span", { className: "text-[10px]", children: label })] }));
}
