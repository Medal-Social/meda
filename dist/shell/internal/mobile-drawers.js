'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Monitor, Moon, Sun } from 'lucide-react';
import { cloneElement, createElement, Fragment, isValidElement, useEffect, } from 'react';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, } from '../../components/ui/drawer.js';
import { cn } from '../../lib/utils.js';
import { useMedaShell } from '../shell-provider.js';
import { useTheme } from '../theme.js';
/**
 * Renders all four mobile drawer slots (Menu / Module / Panels / AI) plus
 * any custom-content drawers. Mount once near the AppShell root; drawers
 * open/close via `ctx.mobileDrawer.open` provider state.
 */
export function MobileDrawers({ menuItems = [], menuActiveId, menuRenderLink, workspaceMenuItems, workspaceMenuFooter, module, moduleAppId, moduleHeader, moduleScroll, panelViews = [], defaultView, customContent = {}, }) {
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
    return (_jsxs(_Fragment, { children: [_jsx(MenuDrawer, { open: open === 'menu-drawer', onClose: close, items: menuItems, activeId: menuActiveId, renderLink: menuRenderLink, workspaceItems: workspaceMenuItems, workspaceFooter: workspaceMenuFooter }), _jsx(ModuleDrawer, { open: open === 'module-drawer', onClose: close, module: module, renderCtx: moduleRenderCtx, header: moduleHeader, scroll: moduleScroll }), _jsx(PanelsDrawer, { open: open === 'panels-drawer', onClose: close, panelViews: panelViews, defaultView: defaultView, renderCtx: renderCtx }), _jsx(AiDrawer, { open: open === 'ai-drawer', onClose: close, panelViews: panelViews, renderCtx: renderCtx }), Object.entries(customContent).map(([id, renderFn]) => (_jsx(Drawer, { open: open === id, onOpenChange: (o) => !o && close(), direction: "bottom", children: _jsx(DrawerContent, { children: renderFn(close) }) }, id)))] }));
}
// ---------------------------------------------------------------------------
// Internal sub-drawers
// ---------------------------------------------------------------------------
function MenuDrawer({ open, onClose, items, activeId, renderLink, workspaceItems, workspaceFooter, }) {
    const hasIconItems = items.length > 0;
    const hasWorkspaceItems = Array.isArray(workspaceItems) && workspaceItems.length > 0;
    return (_jsx(Drawer, { open: open, onOpenChange: (o) => !o && onClose(), direction: "left", children: _jsxs(DrawerContent, { children: [_jsxs(DrawerHeader, { children: [_jsx(DrawerTitle, { children: "Menu" }), _jsx(DrawerDescription, { className: "sr-only", children: "Switch between primary app areas." })] }), _jsxs("div", { className: "flex flex-col gap-2 p-2", children: [hasIconItems && (_jsx("nav", { "aria-label": "Primary navigation", className: "flex flex-col gap-0.5", children: items.map((item) => (_jsx(MenuDrawerItem, { item: item, isActive: item.id === activeId, onClose: onClose, renderLink: renderLink }, item.id))) })), (hasIconItems || hasWorkspaceItems) && _jsx("div", { className: "h-px bg-border" }), _jsxs("nav", { "aria-label": "Workspace menu", className: "flex flex-col gap-0.5", children: [workspaceItems?.map((item) => (_jsxs(Fragment, { children: [_jsx(WorkspaceMenuDrawerItem, { item: item, onClose: onClose }), item.separatorAfter && _jsx("div", { className: "my-1 h-px bg-border" })] }, item.id))), _jsx(MobileThemeMenuItem, { onClose: onClose })] }), workspaceFooter] })] }) }));
}
const menuItemClassName = 'flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground';
function MenuDrawerItem({ item, isActive, onClose, renderLink, }) {
    const Icon = item.icon;
    const children = (_jsxs(_Fragment, { children: [_jsx(Icon, { size: 18, "aria-hidden": "true" }), _jsx("span", { children: item.label })] }));
    const className = cn(menuItemClassName, isActive && 'bg-accent text-foreground');
    const linkProps = {
        href: item.to,
        className,
        children,
    };
    if (renderLink) {
        return closeAfterLinkClick(renderLink({
            item,
            isActive,
            className,
            children,
            linkProps,
        }), onClose);
    }
    return closeAfterLinkClick(_jsx("a", { ...linkProps }), onClose);
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
function renderWorkspaceIcon(icon) {
    if (icon == null)
        return null;
    if (isValidElement(icon))
        return icon;
    if (typeof icon === 'function') {
        return createElement(icon, { size: 18, 'aria-hidden': true });
    }
    if (typeof icon === 'object') {
        const candidate = icon;
        if (candidate.$$typeof != null) {
            return createElement(icon, { size: 18, 'aria-hidden': true });
        }
    }
    return icon;
}
function WorkspaceMenuDrawerItem({ item, onClose, }) {
    const children = (_jsxs(_Fragment, { children: [renderWorkspaceIcon(item.icon), _jsx("span", { children: item.label })] }));
    const className = cn(menuItemClassName, item.variant === 'destructive' && 'text-destructive hover:text-destructive');
    const handleClick = () => {
        item.onClick?.();
        onClose();
    };
    if (item.href != null) {
        return closeAfterLinkClick(_jsx("a", { href: item.href, className: className, "data-variant": item.variant ?? 'default', onClick: () => item.onClick?.(), children: children }), onClose);
    }
    return (_jsx("button", { type: "button", "data-variant": item.variant ?? 'default', className: className, onClick: handleClick, children: children }));
}
const NEXT_THEME = { light: 'dark', dark: 'system', system: 'light' };
const THEME_ICON = { light: Sun, dark: Moon, system: Monitor };
const THEME_LABEL = {
    light: 'Switch to dark theme',
    dark: 'Switch to system theme',
    system: 'Switch to light theme',
};
function MobileThemeMenuItem({ onClose }) {
    const { theme, setTheme } = useTheme();
    const Icon = THEME_ICON[theme];
    return (_jsxs("button", { type: "button", "aria-label": THEME_LABEL[theme], className: menuItemClassName, onClick: () => {
            setTheme(NEXT_THEME[theme]);
            onClose();
        }, children: [_jsx(Icon, { size: 18, "aria-hidden": "true" }), _jsx("span", { children: THEME_LABEL[theme] })] }));
}
function ModuleDrawer({ open, onClose, module, renderCtx, header = 'auto', scroll = 'auto', }) {
    const items = module?.items ?? [];
    if (!module || (items.length === 0 && !module.render))
        return null;
    const hasRender = typeof module.render === 'function';
    const showHeader = header === 'visible' || (header === 'auto' && items.length > 0 && !hasRender);
    const title = (_jsxs(_Fragment, { children: [_jsx(DrawerTitle, { className: showHeader ? undefined : 'sr-only', children: module.label }), module.description && (_jsx(DrawerDescription, { className: showHeader ? 'text-muted-foreground text-xs' : 'sr-only', children: module.description }))] }));
    return (_jsx(Drawer, { open: open, onOpenChange: (o) => !o && onClose(), direction: "left", children: _jsxs(DrawerContent, { children: [showHeader ? _jsx(DrawerHeader, { children: title }) : title, _jsxs("div", { "data-meda-context-rail-scroll-area": "", className: cn('min-h-0 flex-1', scroll === 'auto' ? 'overflow-y-auto overflow-x-hidden' : 'overflow-hidden'), children: [items.length > 0 && (_jsx("nav", { className: "flex flex-col gap-0.5 p-2", children: items.map((item) => {
                                const Icon = item.icon;
                                return (_jsxs("a", { href: item.to, onClick: onClose, className: "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground", children: [_jsx(Icon, { size: 16, "aria-hidden": "true" }), _jsx("span", { children: item.label })] }, item.id));
                            }) })), module.render?.(renderCtx)] })] }) }));
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
    return (_jsx(Drawer, { open: open, onOpenChange: (o) => !o && onClose(), direction: "bottom", children: _jsxs(DrawerContent, { children: [_jsxs(DrawerHeader, { children: [_jsx(DrawerTitle, { children: active?.label ?? 'Panels' }), _jsx(DrawerDescription, { className: "sr-only", children: "Contextual panels for the current module." })] }), panelViews.length > 1 && (_jsx("div", { className: "flex items-center gap-1 border-b border-border px-3 py-2", children: panelViews.map((view) => (_jsx("button", { type: "button", onClick: () => ctx.panel.setActiveView(view.id), "aria-current": view.id === activeView ? 'true' : undefined, className: cn('rounded-md px-2 py-1 text-sm', view.id === activeView
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
