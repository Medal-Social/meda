'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Pause, Play, Zap } from 'lucide-react';
import { cn } from '../lib/utils.js';
const STATUS_CLASSES = {
    draft: 'bg-muted text-muted-foreground',
    active: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400',
    paused: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400',
};
const STATUS_ICONS = {
    draft: null,
    active: _jsx(Play, { className: "h-3 w-3", "aria-hidden": true }),
    paused: _jsx(Pause, { className: "h-3 w-3", "aria-hidden": true }),
};
export function WorkflowCardCompact({ workflow, onClick, className }) {
    return (_jsxs("div", { "data-slot": "workflow-card-compact", "data-status": workflow.status, className: cn('cursor-pointer space-y-2 rounded-md border border-border bg-card p-3 transition-colors hover:bg-accent/50', className), onClick: onClick, onKeyDown: (e) => {
            if (onClick && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onClick();
            }
        }, role: onClick ? 'button' : undefined, tabIndex: onClick ? 0 : undefined, children: [_jsx("div", { className: "truncate font-medium text-foreground text-sm", children: workflow.name }), workflow.description ? (_jsx("p", { className: "line-clamp-2 text-muted-foreground text-xs", children: workflow.description })) : null, _jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsxs("span", { className: cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium text-xs', STATUS_CLASSES[workflow.status]), children: [STATUS_ICONS[workflow.status], _jsx("span", { className: "capitalize", children: workflow.status })] }), workflow.triggerLabel ? (_jsxs("span", { className: "inline-flex items-center gap-1 text-muted-foreground text-xs", children: [_jsx(Zap, { className: "h-3 w-3", "aria-hidden": true }), workflow.triggerLabel] })) : null] })] }));
}
