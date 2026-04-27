'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, } from '../../components/ui/drawer.js';
import { cn } from '../../lib/utils.js';
import { useMedaShell } from '../shell-provider.js';
/**
 * Renders all four mobile drawer slots (Menu / Module / Panels / AI) plus
 * any custom-content drawers. Mount once near the AppShell root; drawers
 * open/close via `ctx.mobileDrawer.open` provider state.
 */
export function MobileDrawers({ menuItems = [], module, panelViews = [], customContent = {}, }) {
    const ctx = useMedaShell();
    const open = ctx.mobileDrawer.open;
    const setOpen = ctx.mobileDrawer.setOpen;
    const close = () => setOpen(null);
    const renderCtx = {
        workspaceId: ctx.workspace.id,
        appId: ctx.activeAppId,
    };
    return (_jsxs(_Fragment, { children: [_jsx(MenuDrawer, { open: open === 'menu-drawer', onClose: close, items: menuItems }), _jsx(ModuleDrawer, { open: open === 'module-drawer', onClose: close, module: module }), _jsx(PanelsDrawer, { open: open === 'panels-drawer', onClose: close, panelViews: panelViews, renderCtx: renderCtx }), _jsx(AiDrawer, { open: open === 'ai-drawer', onClose: close, panelViews: panelViews, renderCtx: renderCtx }), Object.entries(customContent).map(([id, renderFn]) => (_jsx(Drawer, { open: open === id, onOpenChange: (o) => !o && close(), direction: "bottom", children: _jsx(DrawerContent, { children: renderFn(close) }) }, id)))] }));
}
// ---------------------------------------------------------------------------
// Internal sub-drawers
// ---------------------------------------------------------------------------
function MenuDrawer({ open, onClose, items, }) {
    return (_jsx(Drawer, { open: open, onOpenChange: (o) => !o && onClose(), direction: "left", children: _jsxs(DrawerContent, { children: [_jsxs(DrawerHeader, { children: [_jsx(DrawerTitle, { children: "Menu" }), _jsx(DrawerDescription, { className: "sr-only", children: "Switch between primary app areas." })] }), _jsx("nav", { className: "flex flex-col gap-0.5 p-2", children: items.map((item) => {
                        const Icon = item.icon;
                        return (_jsxs("a", { href: item.to, onClick: onClose, className: "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground", children: [_jsx(Icon, { size: 18, "aria-hidden": "true" }), _jsx("span", { children: item.label })] }, item.id));
                    }) })] }) }));
}
function ModuleDrawer({ open, onClose, module, }) {
    if (!module)
        return null;
    return (_jsx(Drawer, { open: open, onOpenChange: (o) => !o && onClose(), direction: "left", children: _jsxs(DrawerContent, { children: [_jsxs(DrawerHeader, { children: [_jsx(DrawerTitle, { children: module.label }), module.description && (_jsx(DrawerDescription, { className: "text-muted-foreground text-xs", children: module.description }))] }), _jsx("nav", { className: "flex flex-col gap-0.5 p-2", children: module.items.map((item) => {
                        const Icon = item.icon;
                        return (_jsxs("a", { href: item.to, onClick: onClose, className: "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground", children: [_jsx(Icon, { size: 16, "aria-hidden": "true" }), _jsx("span", { children: item.label })] }, item.id));
                    }) })] }) }));
}
function PanelsDrawer({ open, onClose, panelViews, renderCtx, }) {
    const ctx = useMedaShell();
    const activeView = ctx.panel.activeView;
    const active = panelViews.find((v) => v.id === activeView) ?? panelViews[0];
    return (_jsx(Drawer, { open: open, onOpenChange: (o) => !o && onClose(), direction: "bottom", children: _jsxs(DrawerContent, { children: [_jsxs(DrawerHeader, { children: [_jsx(DrawerTitle, { children: active?.label ?? 'Panels' }), _jsx(DrawerDescription, { className: "sr-only", children: "Contextual panels for the current module." })] }), panelViews.length > 1 && (_jsx("div", { className: "flex items-center gap-1 border-b border-border px-3 py-2", children: panelViews.map((view) => (_jsx("button", { type: "button", onClick: () => ctx.panel.setActiveView(view.id), "aria-current": view.id === activeView ? 'true' : undefined, className: cn('rounded-md px-2 py-1 text-xs', view.id === activeView
                            ? 'bg-accent text-accent-foreground'
                            : 'text-muted-foreground hover:bg-accent'), children: view.label }, view.id))) })), _jsx("div", { className: "flex-1 overflow-y-auto p-3", children: active?.render(renderCtx) })] }) }));
}
function AiDrawer({ open, onClose, panelViews, renderCtx, }) {
    const ctx = useMedaShell();
    const aiView = panelViews.find((v) => v.id === 'ai');
    const setActiveView = ctx.panel.setActiveView;
    // Pin to ai view when drawer opens
    // biome-ignore lint/correctness/useExhaustiveDependencies: setActiveView is stable (from useMemo in provider)
    useEffect(() => {
        if (open && aiView) {
            setActiveView('ai');
        }
    }, [open, aiView]);
    if (!aiView)
        return null;
    return (_jsx(Drawer, { open: open, onOpenChange: (o) => !o && onClose(), direction: "bottom", children: _jsxs(DrawerContent, { children: [_jsxs(DrawerHeader, { children: [_jsx(DrawerTitle, { children: aiView.label }), _jsx(DrawerDescription, { className: "sr-only", children: "Open the AI assistant panel." })] }), _jsx("div", { className: "flex-1 overflow-y-auto p-3", children: aiView.render(renderCtx) })] }) }));
}
