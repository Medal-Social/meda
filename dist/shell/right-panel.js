'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * RightPanel — spec §12
 *
 * Four-mode right panel: closed (0px), panel (resizable 300–520px),
 * expanded (~60vw), fullscreen (100vw/100vh takeover).
 *
 * Mode state lives in MedaShellProvider (panel.mode / panel.setMode).
 * Width is persisted per-(workspaceId, appId) via panel.width / panel.setWidth.
 *
 * Resize note (Pattern B):
 * Uses its own pointer-event resize handle on the LEFT edge instead of
 * wrapping in <ResizableShell>. Pattern A requires migrating <AppShellBody>
 * to a PanelGroup layout.
 * TODO(phase-15-refactor): swap to ResizableShell once AppShellBody is a PanelGroup
 */
import { Maximize2, Minimize2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '../lib/utils.js';
import { useMedaShell } from './shell-provider.js';
import { useShellViewport } from './use-shell-viewport.js';
// ---------------------------------------------------------------------------
// Constants — spec §12 dimensions
// ---------------------------------------------------------------------------
const MIN_WIDTH = 300;
const MAX_WIDTH = 520;
function ResizeHandle({ currentWidth, onResize, onCommit }) {
    const startWidthRef = useRef(currentWidth);
    const startXRef = useRef(0);
    const draggingRef = useRef(false);
    const handlePointerDown = (e) => {
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
        // Left edge: drag left (clientX decreasing) widens panel
        const delta = startXRef.current - e.clientX;
        const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidthRef.current + delta));
        onResize(next);
    };
    const handlePointerUp = (e) => {
        if (!draggingRef.current)
            return;
        draggingRef.current = false;
        const delta = startXRef.current - e.clientX;
        const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidthRef.current + delta));
        onCommit(next);
    };
    return (_jsx("div", { role: "separator", "aria-orientation": "vertical", "aria-label": "Resize panel", "aria-valuenow": currentWidth, "aria-valuemin": MIN_WIDTH, "aria-valuemax": MAX_WIDTH, tabIndex: 0, className: cn('absolute top-0 left-0 h-full w-1 cursor-col-resize', 'opacity-0 transition-opacity hover:opacity-100 hover:bg-ring'), onPointerDown: handlePointerDown, onPointerMove: handlePointerMove, onPointerUp: handlePointerUp }));
}
// ---------------------------------------------------------------------------
// RightPanel
// ---------------------------------------------------------------------------
export function RightPanel({ panelViews = [], defaultView, modes = ['panel', 'expanded', 'fullscreen'], className, }) {
    const band = useShellViewport();
    const ctx = useMedaShell();
    const { mode, activeView, width, setMode, setActiveView, setWidth } = ctx.panel;
    // Hydrate defaultView on mount if no active view set
    // biome-ignore lint/correctness/useExhaustiveDependencies: intentional one-time mount effect
    useEffect(() => {
        if (!activeView && defaultView) {
            setActiveView(defaultView);
        }
    }, []);
    // Local display width tracks pointer-move updates live;
    // setWidth (persist) is called on pointerUp.
    const [displayWidth, setDisplayWidth] = useState(null);
    const resolvedWidth = displayWidth ?? width;
    // On mobile, the right panel renders as a drawer via <MobileDrawers > PanelsDrawer />.
    // The desktop-shaped <RightPanel> hides; consumers must mount <MobileDrawers> to expose
    // panel views on mobile.
    if (band === 'mobile')
        return null;
    const renderCtx = {
        workspaceId: ctx.workspace.id,
        appId: ctx.activeAppId,
    };
    // Cycle through allowed open modes only (skip 'closed')
    const cycleOpenMode = () => {
        if (mode === 'closed')
            return;
        const openModes = modes.filter((m) => m !== 'closed');
        const idx = openModes.indexOf(mode);
        const next = openModes[(idx + 1) % openModes.length] ?? mode;
        setMode(next);
    };
    // Mode → inline width style
    const widthStyle = (() => {
        switch (mode) {
            case 'closed':
                return { width: 0, pointerEvents: 'none' };
            case 'panel':
                return { width: `${resolvedWidth}px` };
            case 'expanded':
                return { width: '60vw' };
            case 'fullscreen':
                return { width: '100vw' };
        }
    })();
    // Z-index escalation: fullscreen covers header + rails
    const zIndexClass = mode === 'fullscreen' ? 'z-[var(--z-shell-fullscreen)]' : 'z-[var(--z-shell-panel)]';
    const activePanelView = panelViews.find((v) => v.id === activeView);
    const cycleAriaLabel = mode === 'panel' ? 'Expand panel' : mode === 'expanded' ? 'Maximize panel' : 'Restore panel';
    const handleResize = (w) => setDisplayWidth(w);
    const handleCommit = (w) => {
        setDisplayWidth(null);
        setWidth(w);
    };
    return (_jsx("aside", { "data-meda-panel-mode": mode, "aria-hidden": mode === 'closed' ? 'true' : undefined, className: cn('relative h-full shrink-0 overflow-hidden border-l border-shell-border bg-shell-panel', 'transition-[width] ease-[var(--motion-ease)] duration-[var(--motion-panel)]', mode === 'fullscreen' && 'fixed inset-0 h-screen w-screen border-none', zIndexClass, className), style: widthStyle, children: mode !== 'closed' && (_jsxs("div", { className: "flex h-full flex-col", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-shell-border px-3 py-2", children: [_jsx("div", { className: "flex items-center gap-1", children: panelViews.map((view) => {
                                const isActive = view.id === activeView;
                                const Icon = view.icon;
                                return (_jsxs("button", { type: "button", "aria-current": isActive ? 'true' : undefined, onClick: () => setActiveView(view.id), className: cn('inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors', isActive
                                        ? 'bg-accent text-accent-foreground'
                                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'), children: [_jsx(Icon, { size: 14, "aria-hidden": "true" }), _jsx("span", { children: view.label })] }, view.id));
                            }) }), _jsxs("div", { className: "flex items-center gap-1", children: [modes.length > 1 && (_jsx("button", { type: "button", "aria-label": cycleAriaLabel, onClick: cycleOpenMode, className: "inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground", children: mode === 'fullscreen' ? (_jsx(Minimize2, { size: 14, "aria-hidden": "true" })) : (_jsx(Maximize2, { size: 14, "aria-hidden": "true" })) })), _jsx("button", { type: "button", "aria-label": "Close panel", onClick: () => setMode('closed'), className: "inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground", children: _jsx(X, { size: 14, "aria-hidden": "true" }) })] })] }), _jsx("div", { className: "flex-1 overflow-y-auto", children: activePanelView != null ? (activePanelView.render(renderCtx)) : (_jsx("div", { className: "p-4 text-muted-foreground text-sm", children: "No panel view selected" })) }), mode === 'panel' && (_jsx(ResizeHandle, { currentWidth: resolvedWidth, onResize: handleResize, onCommit: handleCommit }))] })) }));
}
