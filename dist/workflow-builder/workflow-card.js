'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Pause, Play, Zap } from 'lucide-react';
import { cn } from '../lib/utils.js';
const STATUS_CLASSES = {
    draft: 'bg-muted text-muted-foreground',
    active: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400',
    paused: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400',
};
function formatRelative(ts) {
    const diff = Date.now() - ts;
    const seconds = Math.round(diff / 1000);
    if (seconds < 60)
        return 'just now';
    const minutes = Math.round(seconds / 60);
    if (minutes < 60)
        return `${minutes}m ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24)
        return `${hours}h ago`;
    const days = Math.round(hours / 24);
    return `${days}d ago`;
}
function getInitials(value) {
    return value
        .split(' ')
        .map((part) => part[0] ?? '')
        .join('')
        .toUpperCase()
        .slice(0, 2);
}
const STATUS_ICONS = {
    draft: null,
    active: _jsx(Play, { className: "h-3 w-3", "aria-hidden": true }),
    paused: _jsx(Pause, { className: "h-3 w-3", "aria-hidden": true }),
};
export function WorkflowCard({ workflow, onClick, className }) {
    return (_jsxs("div", { "data-slot": "workflow-card", "data-status": workflow.status, className: cn('group cursor-pointer rounded-lg border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md', className), onClick: onClick, onKeyDown: (e) => {
            if (onClick && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onClick();
            }
        }, role: onClick ? 'button' : undefined, tabIndex: onClick ? 0 : undefined, children: [_jsx("div", { className: "mb-3 flex items-start justify-between gap-3", children: _jsxs("div", { className: "min-w-0 flex-1 space-y-1", children: [_jsx("h3", { className: "truncate font-semibold text-base text-foreground", children: workflow.name }), workflow.description ? (_jsx("p", { className: "line-clamp-2 text-muted-foreground text-sm", children: workflow.description })) : null] }) }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsxs("span", { className: cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium text-xs', STATUS_CLASSES[workflow.status]), children: [STATUS_ICONS[workflow.status], _jsx("span", { className: "capitalize", children: workflow.status })] }), workflow.triggerLabel ? (_jsxs("span", { className: "inline-flex items-center gap-1 text-muted-foreground text-sm", children: [_jsx(Zap, { className: "h-3.5 w-3.5", "aria-hidden": true }), workflow.triggerLabel] })) : null] }), workflow.meta?.length ? (_jsx("dl", { className: "flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-sm", children: workflow.meta.map((m) => (_jsxs("div", { className: "flex items-center gap-1", children: [_jsxs("dt", { className: "font-medium", children: [m.label, ":"] }), _jsx("dd", { className: "tabular-nums", children: m.value })] }, m.label))) })) : null, workflow.creatorName || workflow.createdAt ? (_jsxs("div", { className: "flex items-center gap-2 text-muted-foreground text-xs", children: [workflow.creatorName ? (_jsxs("span", { className: "inline-flex items-center gap-1.5", children: [workflow.creatorAvatarUrl ? (_jsx("img", { src: workflow.creatorAvatarUrl, alt: "", className: "h-5 w-5 rounded-full" })) : (_jsx("span", { className: "inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted font-medium text-[10px]", children: getInitials(workflow.creatorName) })), _jsx("span", { className: "truncate", children: workflow.creatorName })] })) : null, workflow.createdAt ? _jsx("span", { children: formatRelative(workflow.createdAt) }) : null] })) : null] })] }));
}
