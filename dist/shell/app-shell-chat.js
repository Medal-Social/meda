'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../lib/utils.js';
import { useShellViewport } from './use-shell-viewport.js';
export function AppShellChat({ globalActions, children }) {
    const viewport = useShellViewport();
    const isMobile = viewport === 'mobile';
    return (_jsxs("section", { "data-testid": "app-shell-chat", className: "flex h-screen flex-col bg-background text-foreground", children: [_jsxs("header", { className: "flex h-12 items-center justify-between border-b border-border px-4", children: [_jsx("span", { className: "text-sm font-medium text-foreground", children: "Chat" }), globalActions ? _jsx("div", { className: "flex items-center gap-2", children: globalActions }) : null] }), _jsx("div", { className: cn('flex-1 overflow-y-auto', isMobile ? 'px-2 py-3' : 'px-6 py-4'), children: children })] }));
}
