'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { ChevronDown, Monitor, Moon, PanelRightClose, PanelRightOpen, Sun } from 'lucide-react';
import { createElement, Fragment, isValidElement } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from '../components/ui/dropdown-menu.js';
import { cn } from '../lib/utils.js';
import { useMedaShell } from './shell-provider.js';
import { useTheme } from './theme.js';
import { useShellViewport } from './use-shell-viewport.js';
const NEXT_THEME = { light: 'dark', dark: 'system', system: 'light' };
const THEME_ICON = { light: Sun, dark: Moon, system: Monitor };
const THEME_LABEL = {
    light: 'Switch to dark theme',
    dark: 'Switch to system theme',
    system: 'Switch to light theme',
};
function ThemeToggleMenuItem() {
    const { theme, setTheme } = useTheme();
    const Icon = THEME_ICON[theme];
    return (_jsxs(DropdownMenuItem, { onClick: () => setTheme(NEXT_THEME[theme]), children: [_jsx(Icon, { size: 16, "aria-hidden": "true" }), THEME_LABEL[theme]] }));
}
function renderShellIcon(icon) {
    if (icon == null)
        return null;
    if (isValidElement(icon))
        return icon;
    if (typeof icon === 'function') {
        return createElement(icon, { size: 16, 'aria-hidden': true });
    }
    // forwardRef/memo components are objects carrying a `$$typeof` symbol —
    // treat them like Lucide components. Plain ReactNode objects (arrays,
    // iterables, promises) have no `$$typeof` and are rendered as-is so they
    // don't crash createElement with "Element type is invalid".
    if (typeof icon === 'object' && icon !== null) {
        const candidate = icon;
        if (candidate.$$typeof != null) {
            return createElement(icon, {
                size: 16,
                'aria-hidden': true,
            });
        }
    }
    return icon;
}
function renderConfiguredItem(item) {
    const handleSelect = () => item.onClick?.();
    // Childless anchor — Base UI merges the DropdownMenuItem's children into the
    // cloned render element. Passing children here would override the icon +
    // label children below and configured icons would silently disappear.
    // biome-ignore lint/a11y/useAnchorContent: children are injected at render time by Base UI's `render` prop
    const renderLink = item.href != null ? _jsx("a", { href: item.href }) : undefined;
    return (_jsxs(DropdownMenuItem, { render: renderLink, "data-variant": item.variant ?? 'default', className: item.variant === 'destructive' ? 'text-destructive' : undefined, onClick: handleSelect, children: [renderShellIcon(item.icon), item.label] }));
}
export function WorkspaceSwitcher({ menuItems, menuFooter, workspaceMenuFooter, } = {}) {
    const { workspace, workspaces } = useMedaShell();
    const resolvedFooter = menuFooter ?? workspaceMenuFooter;
    const useConfiguredItems = Array.isArray(menuItems);
    return (_jsxs(DropdownMenu, { children: [_jsxs(DropdownMenuTrigger, { render: _jsx("button", { type: "button", className: "flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium hover:bg-accent" }), children: [workspace.icon != null && (_jsx("span", { className: "shrink-0", "aria-hidden": "true", children: workspace.icon })), _jsx("span", { children: workspace.name }), _jsx(ChevronDown, { size: 14, "aria-hidden": "true" })] }), _jsxs(DropdownMenuContent, { className: "min-w-[200px]", children: [workspaces.length > 0 && (_jsxs(_Fragment, { children: [workspaces.map((ws) => (_jsxs(DropdownMenuItem, { children: [ws.icon != null && _jsx("span", { "aria-hidden": "true", children: ws.icon }), ws.name] }, ws.id))), _jsx(DropdownMenuSeparator, {})] })), useConfiguredItems ? (menuItems.map((item) => (_jsxs(Fragment, { children: [renderConfiguredItem(item), item.separatorAfter && _jsx(DropdownMenuSeparator, {})] }, item.id)))) : (_jsxs(_Fragment, { children: [_jsx(DropdownMenuItem, { children: "Manage workspaces" }), _jsx(DropdownMenuSeparator, {}), _jsx(DropdownMenuItem, { children: "Settings" }), _jsx(DropdownMenuItem, { children: "Profile" })] })), _jsx(DropdownMenuSeparator, {}), _jsx(ThemeToggleMenuItem, {}), !useConfiguredItems && (_jsxs(_Fragment, { children: [_jsx(DropdownMenuSeparator, {}), _jsx(DropdownMenuItem, { children: "Sign out" })] })), resolvedFooter] })] }));
}
export function AppTabs({ renderLink } = {}) {
    const { apps, activeAppId, setActiveApp } = useMedaShell();
    return (_jsx("nav", { "aria-label": "Applications", className: "flex items-center", children: apps.map((app) => {
            const isActive = app.id === activeAppId;
            const className = cn('flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors', isActive
                ? 'border-b-2 border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground');
            const children = (_jsxs(_Fragment, { children: [renderShellIcon(app.icon), app.label] }));
            const handleClick = () => {
                setActiveApp(app.id);
            };
            if (renderLink) {
                return (_jsx(Fragment, { children: renderLink({
                        app,
                        isActive,
                        className,
                        children,
                        linkProps: {
                            href: app.to,
                            className,
                            children,
                            'aria-current': isActive ? 'page' : undefined,
                            onClick: handleClick,
                        },
                    }) }, app.id));
            }
            return (_jsx("button", { type: "button", "aria-current": isActive ? 'page' : undefined, onClick: handleClick, onMouseEnter: () => { }, className: className, children: children }, app.id));
        }) }));
}
// ---------------------------------------------------------------------------
// PanelToggle
// ---------------------------------------------------------------------------
export function PanelToggle() {
    const { panel } = useMedaShell();
    const isOpen = panel.mode !== 'closed';
    const handleClick = () => {
        panel.setMode(isOpen ? 'closed' : 'panel');
    };
    return (_jsx("button", { type: "button", "aria-label": isOpen ? 'Close right panel' : 'Open right panel', onClick: handleClick, className: cn('inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors', isOpen ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent'), children: isOpen ? (_jsx(PanelRightClose, { size: 18, "aria-hidden": "true" })) : (_jsx(PanelRightOpen, { size: 18, "aria-hidden": "true" })) }));
}
export function ShellHeader({ globalActions, headerCenter, appTabsRenderLink, className, workspaceMenuItems, workspaceMenuFooter, } = {}) {
    const band = useShellViewport();
    if (band === 'mobile')
        return null;
    return (_jsxs("header", { className: cn('flex h-[var(--shell-header-height)] w-full items-center justify-between', 'gap-3 border-b border-border bg-background px-3', className), children: [_jsx("div", { className: "flex shrink-0 items-center", children: _jsx(WorkspaceSwitcher, { menuItems: workspaceMenuItems, menuFooter: workspaceMenuFooter }) }), _jsx("div", { className: "flex min-w-0 flex-1 items-center", children: headerCenter !== undefined ? headerCenter : _jsx(AppTabs, { renderLink: appTabsRenderLink }) }), _jsxs("div", { className: "flex shrink-0 items-center gap-2", children: [globalActions, _jsx(PanelToggle, {})] })] }));
}
