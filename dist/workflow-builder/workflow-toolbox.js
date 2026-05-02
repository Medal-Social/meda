'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { cn } from '../lib/utils.js';
import { renderWorkflowIcon } from './internal/trigger-icons.js';
import { defaultWorkflowBuilderLabels, } from './types.js';
function defaultItems(labels) {
    return [
        { kind: 'trigger', label: labels.addTrigger, iconName: 'zap' },
        { kind: 'action', label: labels.addAction, iconName: 'send' },
        { kind: 'condition', label: labels.addCondition, iconName: 'git-branch' },
        { kind: 'delay', label: labels.addDelay, iconName: 'clock' },
        { kind: 'end', label: labels.addEnd, iconName: 'flag' },
    ];
}
export function WorkflowToolbox({ items, onAddNode, readOnly = false, labels, className, }) {
    const resolvedLabels = { ...defaultWorkflowBuilderLabels, ...(labels ?? {}) };
    const resolvedItems = items ?? defaultItems(resolvedLabels);
    return (_jsxs("aside", { "data-slot": "workflow-toolbox", className: cn('flex h-full w-full flex-col border-border border-r bg-background', className), children: [_jsx("div", { className: "border-border border-b px-4 py-3", children: _jsx("h2", { className: "font-semibold text-foreground text-sm", children: resolvedLabels.toolboxTitle }) }), _jsx("div", { className: "flex-1 overflow-y-auto px-3 py-3", children: readOnly ? (_jsx("p", { className: "px-1 py-2 text-muted-foreground text-xs", children: resolvedLabels.toolboxReadOnlyHint })) : (_jsxs(_Fragment, { children: [_jsx("p", { className: "mb-2 px-1 text-muted-foreground text-xs", children: resolvedLabels.toolboxHint }), _jsx("ul", { className: "space-y-1.5", children: resolvedItems.map((item) => (_jsx("li", { children: _jsxs("button", { type: "button", "data-slot": "workflow-toolbox-item", "data-kind": item.kind, onClick: () => onAddNode?.(item.kind), className: "flex min-h-11 w-full items-center gap-2.5 rounded-md px-2 py-2.5 text-left text-sm transition-colors hover:bg-accent/60 focus-visible:bg-accent/80 focus-visible:outline-none", children: [_jsx("span", { className: "flex-shrink-0 text-muted-foreground", children: renderWorkflowIcon(item.kind, item.iconName, 'h-4 w-4') }), _jsx("span", { className: "flex-1 font-medium", children: item.label })] }) }, item.kind))) })] })) })] }));
}
