'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useDndMonitor } from '@dnd-kit/core';
import { useState } from 'react';
import { cn } from '../lib/utils.js';
export function RailDropZones({ title = 'Drop zones', subtitle, count, icon, forceActive, isActive, children, className, }) {
    const [activeId, setActiveId] = useState(null);
    useDndMonitor({
        onDragStart: (e) => setActiveId(e.active.id),
        onDragEnd: () => setActiveId(null),
        onDragCancel: () => setActiveId(null),
    });
    const auto = activeId != null && (!isActive || isActive(activeId));
    const active = forceActive ?? auto;
    return (_jsxs("section", { "data-active": active || undefined, className: cn('flex flex-col gap-3 rounded-lg border border-transparent p-3 transition-colors', active && 'border-2 border-dashed border-primary/60 bg-primary/5', className), children: [(title || subtitle || count) && (_jsxs("header", { className: "flex items-start justify-between gap-3", children: [_jsxs("div", { className: "flex items-start gap-2", children: [icon && _jsx("span", { className: "text-primary", children: icon }), _jsxs("div", { className: "flex flex-col gap-0.5", children: [title && (_jsx("span", { className: "font-medium text-muted-foreground text-xs uppercase tracking-wider", children: title })), subtitle && _jsx("span", { className: "text-muted-foreground text-xs", children: subtitle })] })] }), count && _jsx("span", { className: "text-muted-foreground text-xs", children: count })] })), _jsx("div", { className: "flex flex-col gap-2", children: children })] }));
}
RailDropZones.displayName = 'RailDropZones';
