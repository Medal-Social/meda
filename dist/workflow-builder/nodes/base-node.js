'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Handle, Position } from '@xyflow/react';
import { cn } from '../../lib/utils.js';
import { NODE_HEIGHT, NODE_KIND_STYLES, NODE_WIDTH } from '../internal/trigger-sentence.js';
const HANDLE_CLASS = '!w-[11px] !h-[11px] !bg-neutral-400 dark:!bg-neutral-500 !border-2 !border-background !rounded-full';
export function BaseWorkflowNode({ kind, icon, label, description, warning, selected, showSourceHandle = true, showTargetHandle = true, sourceHandles, }) {
    const colors = NODE_KIND_STYLES[kind];
    return (_jsxs("div", { "data-slot": "workflow-node", "data-kind": kind, "data-selected": selected ? '' : undefined, className: cn('cursor-default select-none rounded-lg border-2 shadow-sm transition-all', colors.bg, colors.border, selected && 'shadow-md ring-2 ring-primary ring-offset-2', !selected && 'hover:shadow-md'), style: { width: NODE_WIDTH, minHeight: NODE_HEIGHT }, children: [showTargetHandle ? (_jsx(Handle, { type: "target", position: Position.Top, className: HANDLE_CLASS })) : null, _jsxs("div", { className: "flex items-start gap-3 p-3", children: [_jsx("div", { className: cn('mt-0.5 flex-shrink-0', colors.icon), children: icon }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("p", { className: "select-none truncate font-medium text-foreground text-sm", children: label }), description ? (_jsx("p", { className: "mt-0.5 truncate text-muted-foreground text-xs", children: description })) : null, warning ? (_jsx("p", { className: "mt-1 inline-flex max-w-full rounded-full bg-warning-100 px-2 py-0.5 font-medium text-[10px] text-warning-800 dark:bg-warning-900/30 dark:text-warning-300", children: warning })) : null] })] }), (() => {
                if (sourceHandles?.length) {
                    return sourceHandles.map((handle) => (_jsx(Handle, { type: "source", position: handle.position, id: handle.id, className: HANDLE_CLASS }, handle.id)));
                }
                if (showSourceHandle) {
                    return _jsx(Handle, { type: "source", position: Position.Bottom, className: HANDLE_CLASS });
                }
                return null;
            })()] }));
}
