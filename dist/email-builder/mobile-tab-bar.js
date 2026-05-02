'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LayoutPanelLeft, Settings, SlidersHorizontal } from 'lucide-react';
import { cn } from '../lib/utils.js';
/** Bottom-of-screen tab bar visible on mobile. */
export function MobileTabBar({ labels, onOpenBlocks, onOpenInspector, onOpenSettings, }) {
    const btnClass = 'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-muted-foreground hover:text-foreground';
    return (_jsxs("div", { "data-slot": "email-builder-mobile-tab-bar", className: cn('fixed inset-x-0 bottom-0 z-40 flex items-stretch border-border border-t bg-background md:hidden'), children: [_jsxs("button", { type: "button", onClick: onOpenBlocks, className: btnClass, children: [_jsx(LayoutPanelLeft, { className: "size-5", "aria-hidden": true }), _jsx("span", { className: "text-xs", children: labels.openBlocks })] }), _jsxs("button", { type: "button", onClick: onOpenInspector, className: btnClass, children: [_jsx(SlidersHorizontal, { className: "size-5", "aria-hidden": true }), _jsx("span", { className: "text-xs", children: labels.openInspector })] }), _jsxs("button", { type: "button", onClick: onOpenSettings, className: btnClass, children: [_jsx(Settings, { className: "size-5", "aria-hidden": true }), _jsx("span", { className: "text-xs", children: labels.openSettings })] })] }));
}
