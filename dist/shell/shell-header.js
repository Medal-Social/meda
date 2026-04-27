'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { ChevronDown, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from '../components/ui/dropdown-menu.js';
import { cn } from '../lib/utils.js';
import { useMedaShell } from './shell-provider.js';
import { ThemeToggle } from './theme.js';
import { useShellViewport } from './use-shell-viewport.js';
// ---------------------------------------------------------------------------
// Legacy components — preserved for back-compat
// ---------------------------------------------------------------------------
export function ShellHeaderFrame({ left, center, right, className, }) {
    return (_jsxs("header", { className: [
            'relative z-[var(--z-sticky)] grid h-[var(--header-height)] w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 bg-[var(--header)] px-3 shadow-[var(--shadow-header)] sm:px-4',
            className,
        ]
            .filter(Boolean)
            .join(' '), children: [left, _jsx("div", { className: "min-w-0", children: center }), _jsx("div", { "data-testid": "shell-header-actions", className: "hidden items-center justify-end gap-2 md:flex", children: right })] }));
}
export function ShellPanelToggle({ panelOpen, onToggle, }) {
    return (_jsx("button", { type: "button", "aria-label": panelOpen ? 'Close panel' : 'Open panel', onClick: onToggle, className: panelOpen
            ? 'inline-flex h-9 items-center justify-center rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/12 px-2.5 text-[var(--primary)] transition-[background-color,color,border-color] duration-200 hover:bg-[var(--primary)]/18'
            : 'inline-flex h-9 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] px-2.5 text-[var(--muted-foreground)] transition-[background-color,color,border-color] duration-200 hover:bg-[var(--sidebar-accent)] hover:text-[var(--foreground)]', children: panelOpen ? _jsx(PanelRightClose, { size: 18 }) : _jsx(PanelRightOpen, { size: 18 }) }));
}
export function WorkspaceSwitcher({ workspaceMenuFooter } = {}) {
    const { workspace, workspaces } = useMedaShell();
    return (_jsxs(DropdownMenu, { children: [_jsxs(DropdownMenuTrigger, { render: _jsx("button", { type: "button", className: "flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium hover:bg-accent" }), children: [workspace.icon != null && (_jsx("span", { className: "shrink-0", "aria-hidden": "true", children: workspace.icon })), _jsx("span", { children: workspace.name }), _jsx(ChevronDown, { size: 14, "aria-hidden": "true" })] }), _jsxs(DropdownMenuContent, { className: "min-w-[200px]", children: [workspaces.length > 0 && (_jsxs(_Fragment, { children: [workspaces.map((ws) => (_jsxs(DropdownMenuItem, { children: [ws.icon != null && _jsx("span", { "aria-hidden": "true", children: ws.icon }), ws.name] }, ws.id))), _jsx(DropdownMenuSeparator, {})] })), _jsx(DropdownMenuItem, { children: "Manage workspaces" }), _jsx(DropdownMenuSeparator, {}), _jsx(DropdownMenuItem, { children: "Settings" }), _jsx(DropdownMenuItem, { children: "Profile" }), _jsx("div", { role: "none", className: "flex items-center px-1.5 py-1", children: _jsx(ThemeToggle, {}) }), _jsx(DropdownMenuSeparator, {}), _jsx(DropdownMenuItem, { children: "Sign out" }), workspaceMenuFooter] })] }));
}
// ---------------------------------------------------------------------------
// Task 7.4 — AppTabs
// ---------------------------------------------------------------------------
export function AppTabs() {
    const { apps, activeAppId, setActiveApp } = useMedaShell();
    return (_jsx("nav", { "aria-label": "Applications", className: "flex items-center", children: apps.map((app) => {
            const isActive = app.id === activeAppId;
            const Icon = app.icon;
            return (_jsxs("button", { type: "button", "aria-current": isActive ? 'page' : undefined, onClick: () => {
                    setActiveApp(app.id);
                    // TODO(Phase 18.x): renderLink integration so clicking a tab also navigates
                    // the consumer's router; setActiveApp alone updates context.
                }, onMouseEnter: () => { }, className: cn('flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors', isActive
                    ? 'border-b-2 border-primary text-foreground'
                    : 'text-muted-foreground hover:text-foreground'), children: [_jsx(Icon, { size: 16, "aria-hidden": "true" }), app.label] }, app.id));
        }) }));
}
// ---------------------------------------------------------------------------
// Task 7.5 — PanelToggle
// ---------------------------------------------------------------------------
export function PanelToggle() {
    const { panel } = useMedaShell();
    const isOpen = panel.mode !== 'closed';
    const handleClick = () => {
        panel.setMode(isOpen ? 'closed' : 'panel');
    };
    return (_jsx("button", { type: "button", "aria-label": isOpen ? 'Close right panel' : 'Open right panel', onClick: handleClick, className: cn('inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors', isOpen ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent'), children: isOpen ? (_jsx(PanelRightClose, { size: 18, "aria-hidden": "true" })) : (_jsx(PanelRightOpen, { size: 18, "aria-hidden": "true" })) }));
}
export function ShellHeader({ globalActions, className } = {}) {
    const band = useShellViewport();
    if (band === 'mobile')
        return null;
    return (_jsxs("header", { className: cn('flex h-[var(--shell-header-height)] w-full items-center justify-between', 'border-b border-border bg-background px-3', className), children: [_jsxs("div", { className: "flex items-center", children: [_jsx(WorkspaceSwitcher, {}), _jsx(AppTabs, {})] }), _jsxs("div", { className: "flex items-center gap-2", children: [globalActions, _jsx(PanelToggle, {})] })] }));
}
