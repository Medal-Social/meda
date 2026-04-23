import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PanelRightClose, PanelRightOpen } from 'lucide-react';
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
