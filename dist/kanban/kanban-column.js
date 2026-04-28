'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useDroppable } from '@dnd-kit/core';
import { MoreHorizontal, Plus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from '../components/ui/dropdown-menu.js';
import { cn } from '../lib/utils.js';
const interpolate = (template, vars) => Object.entries(vars).reduce((s, [k, v]) => s.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v), template);
/**
 * KanbanColumn Component
 *
 * A single column in the kanban board that can receive dropped items.
 */
export function KanbanColumn({ column, count, isOver, onAddItem, onHideColumn, labels, children, }) {
    const { setNodeRef, isOver: isDroppableOver } = useDroppable({
        id: column.id,
    });
    const showDropIndicator = isOver || isDroppableOver;
    return (_jsxs("div", { ref: setNodeRef, "data-slot": "kanban-column", "data-column-id": column.id, className: cn('group/column flex w-72 flex-shrink-0 flex-col rounded-lg bg-muted/30', 'transition-colors duration-200', showDropIndicator && 'bg-primary/5 ring-2 ring-primary/20'), children: [_jsxs("div", { "data-slot": "kanban-column-header", className: "flex items-center gap-2 p-3 pb-2", children: [column.icon ? (_jsx("span", { className: "flex-shrink-0", children: column.icon })) : (_jsx("div", { className: cn('h-2 w-2 rounded-full', column.accentClass ?? 'bg-muted-foreground') })), _jsx("h3", { "data-slot": "kanban-column-title", className: "font-medium text-sm", children: column.label }), _jsx("span", { className: "rounded-full bg-muted px-1.5 py-0.5 text-muted-foreground text-xs", children: count }), (onAddItem || onHideColumn) && (_jsxs("div", { "data-slot": "kanban-column-actions", className: "ml-auto flex items-center gap-1", children: [onAddItem && (_jsx("button", { type: "button", onClick: onAddItem, className: "rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground", "aria-label": interpolate(labels.addItemTo, { column: column.label }), children: _jsx(Plus, { className: "h-4 w-4" }) })), onHideColumn && (_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { render: _jsx("button", { type: "button", className: "rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground", "aria-label": "Actions" }), children: _jsx(MoreHorizontal, { className: "h-4 w-4" }) }), _jsx(DropdownMenuContent, { align: "end", children: _jsx(DropdownMenuItem, { onSelect: onHideColumn, children: labels.hideColumn }) })] }))] }))] }), _jsxs("div", { "data-slot": "kanban-column-content", className: cn('min-h-[100px] flex-1 overflow-y-auto p-2 pt-0 [contain:content]', 'transition-colors duration-200'), children: [children, onAddItem && (_jsxs("button", { type: "button", onClick: onAddItem, className: cn('flex w-full items-center justify-center gap-1.5 rounded-md border border-transparent border-dashed p-2 text-muted-foreground text-sm opacity-0 transition-[color,opacity,background-color,border-color] hover:border-muted-foreground/30 hover:bg-accent/50 hover:text-foreground group-hover/column:opacity-100', count > 0 && 'mt-2'), "aria-label": interpolate(labels.addItemTo, { column: column.label }), children: [_jsx(Plus, { className: "h-4 w-4" }), _jsx("span", { children: "Add" })] }))] }), showDropIndicator && count === 0 && (_jsx("div", { className: "mx-2 mb-2 h-1 rounded-full bg-primary/30" }))] }));
}
