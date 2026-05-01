'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId } from 'react';
import { cn } from '../lib/utils.js';
function FilterRailGroup({ title, description, children, className, ...props }) {
    return (_jsxs("fieldset", { "data-slot": "filter-rail-group", className: cn('space-y-2 border-0 p-0', className), ...props, children: [title ? (_jsx("legend", { "data-slot": "filter-rail-group-title", className: "text-xs font-semibold text-foreground", children: title })) : null, description ? (_jsx("p", { "data-slot": "filter-rail-group-description", className: "text-xs text-muted-foreground", children: description })) : null, _jsx("div", { "data-slot": "filter-rail-group-content", className: "space-y-1.5", children: children })] }));
}
function FilterRailRoot({ title, description, search, actions, footer, children, className, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy, ...props }) {
    const titleId = useId();
    const label = ariaLabel ?? (ariaLabelledBy ? undefined : typeof title === 'string' ? title : undefined);
    const labelledBy = ariaLabelledBy ?? (label ? undefined : title ? titleId : undefined);
    return (_jsxs("aside", { "data-slot": "filter-rail", "aria-label": label, "aria-labelledby": labelledBy, className: cn('flex min-h-0 w-full flex-col border-border bg-card text-card-foreground', className), ...props, children: [title || description || actions ? (_jsxs("div", { "data-slot": "filter-rail-header", className: "flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-3", children: [_jsxs("div", { className: "min-w-0", children: [title ? (_jsx("h2", { id: titleId, "data-slot": "filter-rail-title", className: "text-sm font-semibold text-foreground", children: title })) : null, description ? (_jsx("p", { "data-slot": "filter-rail-description", className: "mt-0.5 text-xs text-muted-foreground", children: description })) : null] }), actions ? (_jsx("div", { "data-slot": "filter-rail-actions", className: "shrink-0", children: actions })) : null] })) : null, search ? (_jsx("div", { "data-slot": "filter-rail-search", className: "shrink-0 border-b border-border p-3", children: search })) : null, _jsx("div", { "data-slot": "filter-rail-content", className: "min-h-0 flex-1 space-y-5 overflow-y-auto p-4", children: children }), footer ? (_jsx("div", { "data-slot": "filter-rail-footer", className: "shrink-0 border-t border-border p-3", children: footer })) : null] }));
}
export const FilterRail = Object.assign(FilterRailRoot, {
    Group: FilterRailGroup,
});
