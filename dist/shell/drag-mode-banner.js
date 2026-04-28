'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useDndMonitor } from '@dnd-kit/core';
import { useState } from 'react';
import { cn } from '../lib/utils.js';
export function DragModeBanner({ message, cancelKey, isActive, className }) {
    const [activeId, setActiveId] = useState(null);
    useDndMonitor({
        onDragStart: (e) => setActiveId(e.active.id),
        onDragEnd: () => setActiveId(null),
        onDragCancel: () => setActiveId(null),
    });
    if (activeId == null)
        return null;
    if (isActive && !isActive(activeId))
        return null;
    return (_jsxs("div", { role: "status", "aria-live": "polite", className: cn('pointer-events-none flex items-center justify-center gap-3 px-4 py-2 text-sm text-muted-foreground', className), children: [_jsx("span", { children: message }), cancelKey === 'ESC' && (_jsx("kbd", { className: "rounded border border-border bg-muted px-1.5 py-0.5 font-medium font-mono text-xs", children: "ESC" }))] }));
}
DragModeBanner.displayName = 'DragModeBanner';
