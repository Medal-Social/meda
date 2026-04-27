'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { ChevronLeft } from 'lucide-react';
import { cn } from '../../lib/utils.js';
import { useMedaShell } from '../shell-provider.js';
import { useShellViewport } from '../use-shell-viewport.js';
/**
 * Mobile-only header.
 *
 * Root mode: workspace name + optional globalActions.
 * Nested mode (when parentLabel is set): ← parentLabel · pageTitle back button.
 *
 * Renders nothing on non-mobile viewports.
 */
export function MobileHeader({ parentLabel, parentTo: _parentTo, title, onBack, globalActions, className, }) {
    const ctx = useMedaShell();
    const band = useShellViewport();
    const isNested = !!parentLabel;
    if (band !== 'mobile')
        return null;
    return (_jsx("header", { "data-meda-mobile-header": isNested ? 'nested' : 'root', className: cn('flex h-[var(--shell-header-height)] items-center justify-between border-b border-border bg-card px-3', className), children: isNested ? (_jsxs("button", { type: "button", onClick: onBack, "aria-label": "Go back", className: "flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm hover:bg-accent", children: [_jsx(ChevronLeft, { size: 16, "aria-hidden": "true" }), _jsx("span", { className: "text-muted-foreground", children: parentLabel }), title && (_jsxs(_Fragment, { children: [_jsx("span", { className: "text-muted-foreground/40", "aria-hidden": "true", children: "\u00B7" }), _jsx("span", { className: "text-foreground", children: title })] }))] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-center gap-2 text-sm font-medium text-foreground", children: [_jsx("span", { "aria-hidden": "true", children: ctx.workspace.icon }), _jsx("span", { children: ctx.workspace.name })] }), globalActions && _jsx("div", { className: "flex items-center gap-1", children: globalActions })] })) }));
}
