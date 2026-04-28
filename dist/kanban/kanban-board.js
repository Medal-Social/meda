'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { DndContext, DragOverlay, KeyboardSensor, MeasuringStrategy, PointerSensor, useDndMonitor, useSensor, useSensors, } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ChevronRight, EyeOff, MoreHorizontal } from 'lucide-react';
import { useCallback, useDeferredValue, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Collapsible, CollapsibleContent, CollapsibleTrigger, } from '../components/ui/collapsible.js';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from '../components/ui/dropdown-menu.js';
import { cn } from '../lib/utils.js';
import { KanbanCardWrapper } from './kanban-card-wrapper.js';
import { kanbanCollisionDetection } from './kanban-collision.js';
import { KanbanColumn } from './kanban-column.js';
import { handleKanbanColumnDrop } from './kanban-drop-handler.js';
import { defaultKanbanLabels, } from './types.js';
const interpolate = (template, vars) => Object.entries(vars).reduce((s, [k, v]) => s.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v), template);
function resolveOverColumnStatus(overId, columns, items) {
    const targetColumn = columns.find((col) => col.id === overId);
    if (targetColumn) {
        return targetColumn.id;
    }
    const targetItem = items.find((item) => item.id === overId);
    return targetItem?.status ?? null;
}
/**
 * Inner component that always renders inside a DndContext — either the kanban's
 * own (non-headless) or the consumer's outer context (headless). This means
 * `useDndMonitor` is always safe to call here, enabling the DragOverlay to
 * track external drags when `headless={true}`.
 */
function KanbanBoardInner({ columns, items, renderCard, onReorder, onCardMove, canDropCard, onAddItem, showEmptyColumns = false, hiddenColumnIds = [], onHiddenColumnIdsChange, emptyColumnContent, labels, headless = false, }) {
    const resolvedLabels = { ...defaultKanbanLabels, ...(labels ?? {}) };
    const [activeId, setActiveId] = useState(null);
    const [overColumnId, setOverColumnId] = useState(null);
    // Defer item updates during drag to keep the overlay responsive
    const deferredItems = useDeferredValue(items);
    // Group items by status
    const itemsByStatus = useMemo(() => {
        const grouped = new Map();
        // Initialize all columns
        for (const column of columns) {
            grouped.set(column.id, []);
        }
        // Group items
        for (const item of deferredItems) {
            const status = item.status;
            const columnItems = grouped.get(status);
            if (columnItems) {
                columnItems.push(item);
            }
        }
        // Sort each column by position
        for (const [status, columnItems] of grouped) {
            columnItems.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
            grouped.set(status, columnItems);
        }
        return grouped;
    }, [columns, deferredItems]);
    // Get the active item being dragged
    const activeItem = useMemo(() => {
        if (!activeId)
            return null;
        return items.find((item) => item.id === activeId) ?? null;
    }, [activeId, items]);
    const hiddenColumnIdSet = useMemo(() => new Set(hiddenColumnIds.map((columnId) => String(columnId))), [hiddenColumnIds]);
    const hiddenColumns = useMemo(() => columns.filter((column) => hiddenColumnIdSet.has(String(column.id))), [columns, hiddenColumnIdSet]);
    const explicitlyVisibleColumns = useMemo(() => columns.filter((column) => !hiddenColumnIdSet.has(String(column.id))), [columns, hiddenColumnIdSet]);
    // Filter columns if not showing empty ones
    const visibleColumns = useMemo(() => {
        if (showEmptyColumns)
            return explicitlyVisibleColumns;
        return explicitlyVisibleColumns.filter((column) => {
            const columnItems = itemsByStatus.get(column.id);
            return columnItems && columnItems.length > 0;
        });
    }, [explicitlyVisibleColumns, itemsByStatus, showEmptyColumns]);
    // Handle drag over (for preview) — used both by own DndContext and via useDndMonitor
    const handleDragOver = useCallback((event) => {
        const { over } = event;
        if (!over) {
            setOverColumnId(null);
            return;
        }
        setOverColumnId(resolveOverColumnStatus(String(over.id), visibleColumns, items));
    }, [items, visibleColumns]);
    // Handle drag start
    const handleDragStart = useCallback((event) => {
        setActiveId(event.active.id);
    }, []);
    // Handle drag end
    const handleDragEnd = useCallback((event) => {
        setActiveId(null);
        setOverColumnId(null);
        handleKanbanColumnDrop({
            event,
            items,
            columns: visibleColumns,
            onCardMove,
            onReorder,
            canDropCard,
        });
    }, [items, visibleColumns, canDropCard, onReorder, onCardMove]);
    // Always monitor the active DndContext (either the kanban's own in non-headless
    // mode, or the consumer's outer context in headless mode). This is safe because
    // KanbanBoardInner is always rendered inside a DndContext.
    //
    // In headless mode the consumer's outer onDragEnd is the single owner of drop
    // routing — only update local UI state here to avoid double-firing handleKanbanColumnDrop.
    useDndMonitor({
        onDragStart: handleDragStart,
        onDragOver: handleDragOver,
        onDragEnd: headless
            ? () => {
                setActiveId(null);
                setOverColumnId(null);
            }
            : handleDragEnd,
        onDragCancel: () => {
            setActiveId(null);
            setOverColumnId(null);
        },
    });
    const handleHideColumn = useCallback((columnId) => {
        if (!onHiddenColumnIdsChange)
            return;
        const nextHiddenColumnIds = [...hiddenColumnIds];
        if (!nextHiddenColumnIds.includes(columnId)) {
            nextHiddenColumnIds.push(columnId);
            onHiddenColumnIdsChange(nextHiddenColumnIds);
        }
    }, [hiddenColumnIds, onHiddenColumnIdsChange]);
    const handleShowColumn = useCallback((columnId) => {
        if (!onHiddenColumnIdsChange)
            return;
        onHiddenColumnIdsChange(hiddenColumnIds.filter((hiddenColumnId) => hiddenColumnId !== columnId));
    }, [hiddenColumnIds, onHiddenColumnIdsChange]);
    return (_jsxs(_Fragment, { children: [_jsxs("div", { "data-slot": "kanban-board", className: "flex h-full gap-4 pb-4", children: [visibleColumns.map((column) => {
                        const columnItems = itemsByStatus.get(column.id) ?? [];
                        const canDropInColumn = !activeId ||
                            !canDropCard ||
                            activeItem?.status === column.id ||
                            canDropCard(activeId, column.id);
                        const isOver = overColumnId === column.id && canDropInColumn;
                        return (_jsx(SortableContext, { items: columnItems.map((item) => item.id), strategy: verticalListSortingStrategy, children: _jsx(KanbanColumn, { column: column, items: columnItems, count: columnItems.length, isOver: isOver, onAddItem: onAddItem && column.canAdd !== false
                                    ? () => onAddItem(column.id)
                                    : undefined, onHideColumn: onHiddenColumnIdsChange ? () => handleHideColumn(column.id) : undefined, labels: resolvedLabels, children: columnItems.length === 0 ? (
                                // If onAddItem is provided, show nothing (add button appears on hover)
                                // Otherwise show custom empty content or default "No items" message
                                (() => {
                                    if (onAddItem && column.canAdd !== false)
                                        return null;
                                    return (emptyColumnContent || (_jsx("div", { className: "py-8 text-center text-muted-foreground text-sm", children: resolvedLabels.noItems })));
                                })()) : (_jsx("div", { className: "space-y-2", children: columnItems.map((item) => (_jsx(KanbanCardWrapper, { id: item.id, isDragging: activeId === item.id, children: renderCard(item) }, item.id))) })) }) }, column.id));
                    }), hiddenColumns.length > 0 && (_jsx(HiddenColumnsRail, { hiddenColumns: hiddenColumns, itemsByStatus: itemsByStatus, onShowColumn: handleShowColumn, labels: resolvedLabels }))] }), typeof document !== 'undefined'
                ? createPortal(_jsx(DragOverlay, { dropAnimation: null, children: activeItem ? (_jsx("div", { className: "cursor-grabbing opacity-95 shadow-xl", children: renderCard(activeItem) })) : null }), document.body)
                : null] }));
}
/**
 * Generic Kanban Board Component
 *
 * A reusable drag-and-drop kanban board that can be used across
 * different features (Deals, Ideas, etc.)
 */
export function KanbanBoard(props) {
    const { columns, onReorder, onCardMove, hiddenColumnIds = [], isLoading = false, headless = false, } = props;
    // Setup sensors for drag detection (only when drag is enabled)
    const dragSensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: {
            distance: 5, // Keep drag responsive while avoiding accidental drags
        },
    }), useSensor(KeyboardSensor));
    // Only use sensors if onReorder or onCardMove is provided
    const sensors = onReorder || onCardMove ? dragSensors : [];
    const hiddenColumnIdSet = useMemo(() => new Set(hiddenColumnIds.map((columnId) => String(columnId))), [hiddenColumnIds]);
    const explicitlyVisibleColumns = useMemo(() => columns.filter((column) => !hiddenColumnIdSet.has(String(column.id))), [columns, hiddenColumnIdSet]);
    // Loading skeleton
    if (isLoading) {
        const loadingColumns = explicitlyVisibleColumns.length > 0 ? explicitlyVisibleColumns : columns;
        return (_jsx("div", { className: "flex gap-4 pb-4", children: loadingColumns.map((column) => (_jsxs("div", { className: "w-72 flex-shrink-0 animate-pulse rounded-lg bg-muted/50 p-4", children: [_jsx("div", { className: "mb-4 h-6 w-24 rounded bg-muted" }), _jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "h-24 rounded bg-muted" }), _jsx("div", { className: "h-24 rounded bg-muted" })] })] }, column.id))) }));
    }
    // In headless mode the consumer supplies the DndContext — KanbanBoardInner
    // uses useDndMonitor to listen to it from inside the same tree.
    if (headless) {
        return _jsx(KanbanBoardInner, { ...props, headless: true });
    }
    return (_jsx(DndContext, { sensors: sensors, collisionDetection: kanbanCollisionDetection, measuring: {
            droppable: {
                strategy: MeasuringStrategy.Always,
            },
        }, children: _jsx(KanbanBoardInner, { ...props, headless: false }) }));
}
function HiddenColumnsRail({ hiddenColumns, itemsByStatus, onShowColumn, labels, }) {
    return (_jsx("aside", { "data-slot": "kanban-hidden-columns-rail", className: "flex w-64 flex-shrink-0 flex-col gap-3 self-start rounded-lg border border-border/60 bg-background/95 p-3 shadow-sm backdrop-blur", children: _jsxs(Collapsible, { defaultOpen: true, children: [_jsxs(CollapsibleTrigger, { "data-slot": "kanban-hidden-columns-trigger", className: "flex w-full items-center gap-2 rounded-md p-1 text-left transition-colors hover:bg-accent/50", children: [_jsx(ChevronRight, { className: "h-4 w-4 text-muted-foreground transition-transform duration-200 [[data-open]>&]:rotate-90" }), _jsx(EyeOff, { className: "h-4 w-4 text-muted-foreground" }), _jsx("h3", { className: "font-medium text-sm", children: labels.hiddenColumns }), _jsx("span", { className: "ml-auto rounded-full bg-muted px-1.5 py-0.5 text-muted-foreground text-xs", children: hiddenColumns.length })] }), _jsx(CollapsibleContent, { "data-slot": "kanban-hidden-columns-content", className: "pt-3", children: _jsx("div", { className: "space-y-2", children: hiddenColumns.map((column) => {
                            const columnItems = itemsByStatus.get(column.id) ?? [];
                            return (_jsxs("div", { "data-slot": "kanban-hidden-column", "data-column-id": column.id, className: "flex items-center gap-3 rounded-md border border-border/60 bg-background p-3 shadow-sm", children: [column.icon ? (_jsx("span", { className: "flex-shrink-0", children: column.icon })) : (_jsx("div", { className: cn('h-2.5 w-2.5 rounded-full', column.accentClass ?? 'bg-muted-foreground') })), _jsx("div", { className: "min-w-0 flex-1", children: _jsx("div", { className: "truncate font-medium text-sm", children: column.label }) }), _jsx("span", { className: "text-muted-foreground text-sm tabular-nums", children: columnItems.length }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { render: _jsx("button", { type: "button", className: "rounded-md border border-border/70 p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground", "aria-label": "Actions" }), children: _jsx(MoreHorizontal, { className: "h-4 w-4" }) }), _jsx(DropdownMenuContent, { align: "end", children: _jsx(DropdownMenuItem, { onSelect: () => onShowColumn(column.id), children: interpolate(labels.showColumn, { column: column.label }) }) })] })] }, column.id));
                        }) }) })] }) }));
}
