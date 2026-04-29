'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { cloneElement, isValidElement, useEffect } from 'react';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, } from '../../components/ui/drawer.js';
import { cn } from '../../lib/utils.js';
import { useMedaShell } from '../shell-provider.js';
/**
 * Renders all four mobile drawer slots (Menu / Module / Panels / AI) plus
 * any custom-content drawers. Mount once near the AppShell root; drawers
 * open/close via `ctx.mobileDrawer.open` provider state.
 */
export function MobileDrawers({ menuItems = [], menuActiveId, menuRenderLink, module, moduleAppId, panelViews = [], defaultView, customContent = {}, }) {
    const ctx = useMedaShell();
    const open = ctx.mobileDrawer.open;
    const setOpen = ctx.mobileDrawer.setOpen;
    const close = () => setOpen(null);
    const renderCtx = {
        workspaceId: ctx.workspace.id,
        appId: ctx.activeAppId,
    };
    const moduleRenderCtx = {
        workspaceId: ctx.workspace.id,
        appId: moduleAppId ?? ctx.activeAppId,
    };
    return (_jsxs(_Fragment, { children: [_jsx(MenuDrawer, { open: open === 'menu-drawer', onClose: close, items: menuItems, activeId: menuActiveId, renderLink: menuRenderLink }), _jsx(ModuleDrawer, { open: open === 'module-drawer', onClose: close, module: module, renderCtx: moduleRenderCtx }), _jsx(PanelsDrawer, { open: open === 'panels-drawer', onClose: close, panelViews: panelViews, defaultView: defaultView, renderCtx: renderCtx }), _jsx(AiDrawer, { open: open === 'ai-drawer', onClose: close, panelViews: panelViews, renderCtx: renderCtx }), Object.entries(customContent).map(([id, renderFn]) => (_jsx(Drawer, { open: open === id, onOpenChange: (o) => !o && close(), direction: "bottom", children: _jsx(DrawerContent, { children: renderFn(close) }) }, id)))] }));
}
// ---------------------------------------------------------------------------
// Internal sub-drawers
// ---------------------------------------------------------------------------
function MenuDrawer({ open, onClose, items, activeId, renderLink, }) {
    return (_jsx(Drawer, { open: open, onOpenChange: (o) => !o && onClose(), direction: "left", children: _jsxs(DrawerContent, { children: [_jsxs(DrawerHeader, { children: [_jsx(DrawerTitle, { children: "Menu" }), _jsx(DrawerDescription, { className: "sr-only", children: "Switch between primary app areas." })] }), _jsx("nav", { className: "flex flex-col gap-0.5 p-2", children: items.map((item) => (_jsx(MenuDrawerItem, { item: item, isActive: item.id === activeId, onClose: onClose, renderLink: renderLink }, item.id))) })] }) }));
}
const menuItemClassName = 'flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground';
function MenuDrawerItem({ item, isActive, onClose, renderLink, }) {
    const Icon = item.icon;
    const children = (_jsxs(_Fragment, { children: [_jsx(Icon, { size: 18, "aria-hidden": "true" }), _jsx("span", { children: item.label })] }));
    if (renderLink) {
        return closeAfterLinkClick(renderLink({
            item,
            isActive,
            className: cn(menuItemClassName, isActive && 'bg-accent text-foreground'),
            children,
        }), onClose);
    }
    return (_jsx("a", { href: item.to, onClick: onClose, className: menuItemClassName, children: children }));
}
function closeAfterLinkClick(link, onClose) {
    if (!isValidElement(link)) {
        return link;
    }
    const originalOnClick = link.props.onClick;
    return cloneElement(link, {
        onClick: (event) => {
            originalOnClick?.(event);
            onClose();
        },
    });
}
function ModuleDrawer({ open, onClose, module, renderCtx, }) {
    const items = module?.items ?? [];
    if (!module || (items.length === 0 && !module.render))
        return null;
    return (_jsx(Drawer, { open: open, onOpenChange: (o) => !o && onClose(), direction: "left", children: _jsxs(DrawerContent, { children: [_jsxs(DrawerHeader, { children: [_jsx(DrawerTitle, { children: module.label }), module.description && (_jsx(DrawerDescription, { className: "text-muted-foreground text-xs", children: module.description }))] }), items.length > 0 && (_jsx("nav", { className: "flex flex-col gap-0.5 p-2", children: items.map((item) => {
                        const Icon = item.icon;
                        return (_jsxs("a", { href: item.to, onClick: onClose, className: "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground", children: [_jsx(Icon, { size: 16, "aria-hidden": "true" }), _jsx("span", { children: item.label })] }, item.id));
                    }) })), module.render?.(renderCtx)] }) }));
}
function PanelsDrawer({ open, onClose, panelViews, defaultView, renderCtx, }) {
    const ctx = useMedaShell();
    const activeView = ctx.panel.activeView;
    const setActiveView = ctx.panel.setActiveView;
    // Hydrate ctx.panel.activeView from defaultView when the drawer opens — matches
    // desktop RightPanel behavior so the tab highlight (aria-current) and provider
    // state stay in sync across viewports. Without this, mobile shows the right
    // content but no tab is marked active.
    useEffect(() => {
        if (open && activeView == null && defaultView && panelViews.some((v) => v.id === defaultView)) {
            setActiveView(defaultView);
        }
    }, [open, activeView, defaultView, panelViews, setActiveView]);
    // Resolution order: explicit user selection → consumer-provided defaultView
    // → first view. Keeps mobile parity with desktop where defaultView is honored.
    const active = panelViews.find((v) => v.id === activeView) ??
        (defaultView ? panelViews.find((v) => v.id === defaultView) : undefined) ??
        panelViews[0];
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
