import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { DndContext, DragOverlay, KeyboardSensor, MeasuringStrategy, PointerSensor, useSensor, useSensors, } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ChevronRight, EyeOff, MoreHorizontal } from 'lucide-react';
import { useCallback, useDeferredValue, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Collapsible, CollapsibleContent, CollapsibleTrigger, } from '../components/ui/collapsible.js';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from '../components/ui/dropdown-menu.js';
import { cn } from '../lib/utils.js';
import { KanbanCardWrapper } from './kanban-card-wrapper.js';
import { isKanbanCardDropAllowed, kanbanCollisionDetection } from './kanban-collision.js';
import { KanbanColumn } from './kanban-column.js';
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
function resolveDropTarget({ overId, items, columns, itemsByStatus, }) {
    const targetColumn = columns.find((column) => column.id === overId);
    if (targetColumn) {
        const targetStatus = targetColumn.id;
        const columnItems = itemsByStatus.get(targetStatus) ?? [];
        return {
            targetStatus,
            targetPosition: columnItems.length,
        };
    }
    const targetItem = items.find((item) => item.id === overId);
    if (!targetItem) {
        return null;
    }
    const targetStatus = targetItem.status;
    const columnItems = itemsByStatus.get(targetStatus) ?? [];
    const targetIndex = columnItems.findIndex((item) => item.id === overId);
    if (targetIndex === -1) {
        return null;
    }
    const targetPosition = targetIndex;
    return {
        targetStatus,
        targetPosition,
    };
}
/**
 * Generic Kanban Board Component
 *
 * A reusable drag-and-drop kanban board that can be used across
 * different features (Deals, Ideas, etc.)
 */
export function KanbanBoard({ columns, items, renderCard, onReorder, onCardMove, canDropCard, onAddItem, showEmptyColumns = false, hiddenColumnIds = [], onHiddenColumnIdsChange, isLoading = false, emptyColumnContent, labels, }) {
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
    // Setup sensors for drag detection (only when drag is enabled)
    const dragSensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: {
            distance: 5, // Keep drag responsive while avoiding accidental drags
        },
    }), useSensor(KeyboardSensor));
    // Only use sensors if onReorder or onCardMove is provided
    const sensors = onReorder || onCardMove ? dragSensors : [];
    // Handle drag start
    const handleDragStart = useCallback((event) => {
        setActiveId(event.active.id);
    }, []);
    // Handle drag over (for preview)
    const handleDragOver = useCallback((event) => {
        const { over } = event;
        if (!over) {
            setOverColumnId(null);
            return;
        }
        setOverColumnId(resolveOverColumnStatus(String(over.id), visibleColumns, items));
    }, [items, visibleColumns]);
    // Handle drag end
    const handleDragEnd = useCallback((event) => {
        const { active, over } = event;
        setActiveId(null);
        setOverColumnId(null);
        if (!over)
            return;
        const activeItemId = active.id;
        const overId = over.id;
        // Find the item being dragged
        const draggedItem = items.find((item) => item.id === activeItemId);
        if (!draggedItem)
            return;
        const dropTarget = resolveDropTarget({
            overId,
            items,
            columns: visibleColumns,
            itemsByStatus,
        });
        if (!dropTarget)
            return;
        const { targetStatus, targetPosition } = dropTarget;
        // Only trigger callback if something changed and handler exists
        if (draggedItem.status !== targetStatus || draggedItem.position !== targetPosition) {
            if (!isKanbanCardDropAllowed({
                itemId: activeItemId,
                sourceStatus: draggedItem.status,
                targetStatus,
                canDropCard,
            })) {
                return;
            }
            if (onReorder) {
                onReorder(activeItemId, targetStatus, targetPosition);
            }
            // Also call onCardMove if status changed
            if (onCardMove && draggedItem.status !== targetStatus) {
                void Promise.resolve(onCardMove(activeItemId, targetStatus)).catch(() => {
                    // Mutation handlers handle toast + rollback on failure.
                });
            }
        }
    }, [items, visibleColumns, itemsByStatus, canDropCard, onReorder, onCardMove]);
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
    // Loading skeleton
    if (isLoading) {
        const loadingColumns = explicitlyVisibleColumns.length > 0 ? explicitlyVisibleColumns : columns;
        return (_jsx("div", { className: "flex gap-4 pb-4", children: loadingColumns.map((column) => (_jsxs("div", { className: "w-72 flex-shrink-0 animate-pulse rounded-lg bg-muted/50 p-4", children: [_jsx("div", { className: "mb-4 h-6 w-24 rounded bg-muted" }), _jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "h-24 rounded bg-muted" }), _jsx("div", { className: "h-24 rounded bg-muted" })] })] }, column.id))) }));
    }
    return (_jsxs(DndContext, { sensors: sensors, collisionDetection: kanbanCollisionDetection, onDragStart: handleDragStart, onDragOver: handleDragOver, onDragEnd: handleDragEnd, measuring: {
            droppable: {
                strategy: MeasuringStrategy.Always,
            },
        }, children: [_jsxs("div", { "data-slot": "kanban-board", className: "flex h-full gap-4 pb-4", children: [visibleColumns.map((column) => {
                        const columnItems = itemsByStatus.get(column.id) ?? [];
                        const canDropInColumn = !activeId ||
                            !canDropCard ||
                            activeItem?.status === column.id ||
                            canDropCard(activeId, column.id);
                        const isOver = overColumnId === column.id && canDropInColumn;
                        return (_jsx(SortableContext, { items: columnItems.map((item) => item.id), strategy: verticalListSortingStrategy, children: _jsx(KanbanColumn, { column: column, items: columnItems, count: columnItems.length, isOver: isOver, onAddItem: onAddItem ? () => onAddItem(column.id) : undefined, onHideColumn: onHiddenColumnIdsChange ? () => handleHideColumn(column.id) : undefined, labels: resolvedLabels, children: columnItems.length === 0 ? (
                                // If onAddItem is provided, show nothing (add button appears on hover)
                                // Otherwise show custom empty content or default "No items" message
                                (() => {
                                    if (onAddItem)
                                        return null;
                                    return (emptyColumnContent || (_jsx("div", { className: "py-8 text-center text-muted-foreground text-sm", children: resolvedLabels.noItems })));
                                })()) : (_jsx("div", { className: "space-y-2", children: columnItems.map((item) => (_jsx(KanbanCardWrapper, { id: item.id, isDragging: activeId === item.id, children: renderCard(item) }, item.id))) })) }) }, column.id));
                    }), hiddenColumns.length > 0 && (_jsx(HiddenColumnsRail, { hiddenColumns: hiddenColumns, itemsByStatus: itemsByStatus, onShowColumn: handleShowColumn, labels: resolvedLabels }))] }), typeof document !== 'undefined'
                ? createPortal(_jsx(DragOverlay, { dropAnimation: null, children: activeItem ? (_jsx("div", { className: "cursor-grabbing opacity-95 shadow-xl", children: renderCard(activeItem) })) : null }), document.body)
                : null] }));
}
function HiddenColumnsRail({ hiddenColumns, itemsByStatus, onShowColumn, labels, }) {
    return (_jsx("aside", { "data-slot": "kanban-hidden-columns-rail", className: "flex w-64 flex-shrink-0 flex-col gap-3 self-start rounded-lg border border-border/60 bg-background/95 p-3 shadow-sm backdrop-blur", children: _jsxs(Collapsible, { defaultOpen: true, children: [_jsxs(CollapsibleTrigger, { "data-slot": "kanban-hidden-columns-trigger", className: "flex w-full items-center gap-2 rounded-md p-1 text-left transition-colors hover:bg-accent/50", children: [_jsx(ChevronRight, { className: "h-4 w-4 text-muted-foreground transition-transform duration-200 [[data-open]>&]:rotate-90" }), _jsx(EyeOff, { className: "h-4 w-4 text-muted-foreground" }), _jsx("h3", { className: "font-medium text-sm", children: labels.hiddenColumns }), _jsx("span", { className: "ml-auto rounded-full bg-muted px-1.5 py-0.5 text-muted-foreground text-xs", children: hiddenColumns.length })] }), _jsx(CollapsibleContent, { "data-slot": "kanban-hidden-columns-content", className: "pt-3", children: _jsx("div", { className: "space-y-2", children: hiddenColumns.map((column) => {
                            const columnItems = itemsByStatus.get(column.id) ?? [];
                            return (_jsxs("div", { "data-slot": "kanban-hidden-column", "data-column-id": column.id, className: "flex items-center gap-3 rounded-md border border-border/60 bg-background p-3 shadow-sm", children: [column.icon ? (_jsx("span", { className: "flex-shrink-0", children: column.icon })) : (_jsx("div", { className: cn('h-2.5 w-2.5 rounded-full', column.accentClass ?? 'bg-muted-foreground') })), _jsx("div", { className: "min-w-0 flex-1", children: _jsx("div", { className: "truncate font-medium text-sm", children: column.label }) }), _jsx("span", { className: "text-muted-foreground text-sm tabular-nums", children: columnItems.length }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { render: _jsx("button", { type: "button", className: "rounded-md border border-border/70 p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground", "aria-label": "Actions" }), children: _jsx(MoreHorizontal, { className: "h-4 w-4" }) }), _jsx(DropdownMenuContent, { align: "end", children: _jsx(DropdownMenuItem, { onSelect: () => onShowColumn(column.id), children: interpolate(labels.showColumn, { column: column.label }) }) })] })] }, column.id));
                        }) }) })] }) }));
}
