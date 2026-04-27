'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { cn } from '../lib/utils.js';
import { useMedaShell } from './shell-provider.js';
import { useShellViewport } from './use-shell-viewport.js';
// ---------------------------------------------------------------------------
// Constants — spec §10 dimensions
// ---------------------------------------------------------------------------
const MIN_WIDTH = 240;
const MAX_WIDTH = 420;
function ResizeHandle({ currentWidth, onResize, onCommit }) {
    const startWidthRef = useRef(currentWidth);
    const startXRef = useRef(0);
    const draggingRef = useRef(false);
    const handlePointerDown = (e) => {
        // setPointerCapture may not be available in all test environments (jsdom)
        try {
            e.currentTarget.setPointerCapture(e.pointerId);
        }
        catch {
            // ignore — drag still functions via draggingRef
        }
        startWidthRef.current = currentWidth;
        startXRef.current = e.clientX;
        draggingRef.current = true;
    };
    const handlePointerMove = (e) => {
        if (!draggingRef.current)
            return;
        const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidthRef.current + (e.clientX - startXRef.current)));
        onResize(next);
    };
    const handlePointerUp = (e) => {
        if (!draggingRef.current)
            return;
        draggingRef.current = false;
        const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidthRef.current + (e.clientX - startXRef.current)));
        onCommit(next);
    };
    return (_jsx("div", { role: "separator", "aria-orientation": "vertical", "aria-label": "Resize context rail", "aria-valuenow": currentWidth, "aria-valuemin": MIN_WIDTH, "aria-valuemax": MAX_WIDTH, tabIndex: 0, className: cn('absolute top-0 right-0 h-full w-1 cursor-col-resize', 'opacity-0 transition-opacity hover:opacity-100 hover:bg-ring'), onPointerDown: handlePointerDown, onPointerMove: handlePointerMove, onPointerUp: handlePointerUp }));
}
// ---------------------------------------------------------------------------
// ContextRail
// ---------------------------------------------------------------------------
export function ContextRail({ appId: _appId, module, hidden = false, collapsible: _collapsible = true, activeItemId, renderLink, className, }) {
    const band = useShellViewport();
    const ctx = useMedaShell();
    const collapsed = ctx.contextRail.collapsed;
    // Local display width tracks pointer-move updates; ctx.contextRail.setWidth
    // is called on pointerUp to persist via useShellLayoutState.
    const [displayWidth, setDisplayWidth] = useState(null);
    const width = displayWidth ?? ctx.contextRail.width;
    if (band === 'mobile')
        return null;
    if (hidden) {
        return _jsx("div", { "aria-hidden": "true", className: "hidden", "data-testid": "context-rail-hidden" });
    }
    if (!module || module.items.length === 0) {
        return _jsx("div", { "aria-hidden": "true", className: "hidden", "data-testid": "context-rail-empty" });
    }
    const handleResize = (w) => {
        setDisplayWidth(w);
    };
    const handleCommit = (w) => {
        setDisplayWidth(null);
        ctx.contextRail.setWidth(w);
    };
    return (_jsxs("aside", { "aria-label": module.label, className: cn('relative h-full shrink-0 overflow-hidden border-r border-shell-border bg-shell-context', collapsed && 'w-0', className), style: { width: collapsed ? 0 : width }, children: [_jsxs("div", { className: "border-b border-shell-border px-4 py-3", children: [_jsx("h2", { className: "text-sm font-semibold text-foreground", children: module.label }), module.description && (_jsx("p", { className: "mt-0.5 text-xs text-muted-foreground", children: module.description }))] }), _jsx("nav", { "aria-label": `${module.label} navigation`, className: "flex flex-col gap-0.5 p-2", children: module.items.map((item) => {
                    const isActive = item.id === activeItemId;
                    const klass = cn('flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors', isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground');
                    const IconComp = item.icon;
                    const inner = (_jsxs(_Fragment, { children: [_jsx(IconComp, { size: 16, "aria-hidden": "true", className: "shrink-0" }), _jsx("span", { className: "truncate", children: item.label }), item.shortcut && (_jsx("kbd", { className: "ml-auto font-mono text-[10px] text-muted-foreground", children: item.shortcut }))] }));
                    if (renderLink) {
                        return renderLink({ item, isActive, className: klass, children: inner });
                    }
                    return (_jsx("a", { href: item.to, "aria-current": isActive ? 'page' : undefined, className: klass, children: inner }, item.id));
                }) }), _jsx(ResizeHandle, { currentWidth: width, onResize: handleResize, onCommit: handleCommit })] }));
}
