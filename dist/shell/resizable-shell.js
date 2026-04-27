'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { Group, Panel, Separator } from 'react-resizable-panels';
import { cn } from '../lib/utils.js';
export function ResizableShell({ orientation = 'horizontal', className, children, }) {
    return (_jsx(Group, { orientation: orientation, className: cn('flex h-full w-full', className), children: children }));
}
export function ResizableShellPanel({ className, children, onResize, ...props }) {
    return (_jsx(Panel, { className: cn('h-full', className), onResize: onResize, ...props, children: children }));
}
export function ResizableHandle({ className, withHandle = false }) {
    return (_jsx(Separator, { className: cn(
        // 4px wide, transparent until hover/active — then ring-color line
        'group relative w-1 shrink-0 cursor-col-resize transition-colors', 'bg-transparent hover:bg-ring data-[separator]:hover:bg-ring', 'focus-visible:bg-ring focus-visible:outline-none', className), children: withHandle && (_jsx("div", { "data-testid": "resize-handle-indicator", className: cn('absolute top-1/2 left-1/2 h-6 w-1 -translate-x-1/2 -translate-y-1/2', 'rounded-sm bg-border opacity-0 transition-opacity group-hover:opacity-100') })) }));
}
