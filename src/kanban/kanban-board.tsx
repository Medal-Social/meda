'use client';

import {
  DndContext,
  type DragEndEvent as DndKitDragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  useDndMonitor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ChevronRight, EyeOff, MoreHorizontal } from 'lucide-react';
import { useCallback, useDeferredValue, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../components/ui/collapsible.js';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu.js';
import { cn } from '../lib/utils.js';
import { KanbanCardWrapper } from './kanban-card-wrapper.js';
import { kanbanCollisionDetection } from './kanban-collision.js';
import { KanbanColumn } from './kanban-column.js';
import { handleKanbanColumnDrop } from './kanban-drop-handler.js';
import {
  defaultKanbanLabels,
  type KanbanBoardProps,
  type KanbanItem,
  type KanbanLabels,
} from './types.js';

const interpolate = (template: string, vars: Record<string, string>) =>
  Object.entries(vars).reduce(
    (s, [k, v]) => s.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v),
    template
  );

function resolveOverColumnStatus<TItem extends KanbanItem, TStatus extends string>(
  overId: string,
  columns: KanbanBoardProps<TItem, TStatus>['columns'],
  items: TItem[]
): TStatus | null {
  const targetColumn = columns.find((col) => col.id === overId);
  if (targetColumn) {
    return targetColumn.id as TStatus;
  }

  const targetItem = items.find((item) => item.id === overId);
  return (targetItem?.status as TStatus | undefined) ?? null;
}

/**
 * Inner component that always renders inside a DndContext — either the kanban's
 * own (non-headless) or the consumer's outer context (headless). This means
 * `useDndMonitor` is always safe to call here, enabling the DragOverlay to
 * track external drags when `headless={true}`.
 */
function KanbanBoardInner<TItem extends KanbanItem, TStatus extends string = string>({
  columns,
  items,
  renderCard,
  onReorder,
  onCardMove,
  canDropCard,
  onAddItem,
  showEmptyColumns = false,
  hiddenColumnIds = [],
  onHiddenColumnIdsChange,
  emptyColumnContent,
  labels,
}: KanbanBoardProps<TItem, TStatus>) {
  const resolvedLabels: KanbanLabels = { ...defaultKanbanLabels, ...(labels ?? {}) };

  const [activeId, setActiveId] = useState<string | null>(null);
  const [overColumnId, setOverColumnId] = useState<TStatus | null>(null);

  // Defer item updates during drag to keep the overlay responsive
  const deferredItems = useDeferredValue(items);

  // Group items by status
  const itemsByStatus = useMemo(() => {
    const grouped = new Map<TStatus, TItem[]>();

    // Initialize all columns
    for (const column of columns) {
      grouped.set(column.id as TStatus, []);
    }

    // Group items
    for (const item of deferredItems) {
      const status = item.status as TStatus;
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
    if (!activeId) return null;
    return items.find((item) => item.id === activeId) ?? null;
  }, [activeId, items]);

  const hiddenColumnIdSet = useMemo(
    () => new Set(hiddenColumnIds.map((columnId) => String(columnId))),
    [hiddenColumnIds]
  );

  const hiddenColumns = useMemo(
    () => columns.filter((column) => hiddenColumnIdSet.has(String(column.id))),
    [columns, hiddenColumnIdSet]
  );

  const explicitlyVisibleColumns = useMemo(
    () => columns.filter((column) => !hiddenColumnIdSet.has(String(column.id))),
    [columns, hiddenColumnIdSet]
  );

  // Filter columns if not showing empty ones
  const visibleColumns = useMemo(() => {
    if (showEmptyColumns) return explicitlyVisibleColumns;
    return explicitlyVisibleColumns.filter((column) => {
      const columnItems = itemsByStatus.get(column.id as TStatus);
      return columnItems && columnItems.length > 0;
    });
  }, [explicitlyVisibleColumns, itemsByStatus, showEmptyColumns]);

  // Handle drag over (for preview) — used both by own DndContext and via useDndMonitor
  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { over } = event;
      if (!over) {
        setOverColumnId(null);
        return;
      }

      setOverColumnId(resolveOverColumnStatus(String(over.id), visibleColumns, items));
    },
    [items, visibleColumns]
  );

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback(
    (event: DndKitDragEndEvent) => {
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
    },
    [items, visibleColumns, canDropCard, onReorder, onCardMove]
  );

  // Always monitor the active DndContext (either the kanban's own in non-headless
  // mode, or the consumer's outer context in headless mode). This is safe because
  // KanbanBoardInner is always rendered inside a DndContext.
  useDndMonitor({
    onDragStart: handleDragStart,
    onDragOver: handleDragOver,
    onDragEnd: handleDragEnd,
    onDragCancel: () => {
      setActiveId(null);
      setOverColumnId(null);
    },
  });

  const handleHideColumn = useCallback(
    (columnId: TStatus) => {
      if (!onHiddenColumnIdsChange) return;
      const nextHiddenColumnIds = [...hiddenColumnIds];
      if (!nextHiddenColumnIds.includes(columnId)) {
        nextHiddenColumnIds.push(columnId);
        onHiddenColumnIdsChange(nextHiddenColumnIds);
      }
    },
    [hiddenColumnIds, onHiddenColumnIdsChange]
  );

  const handleShowColumn = useCallback(
    (columnId: TStatus) => {
      if (!onHiddenColumnIdsChange) return;
      onHiddenColumnIdsChange(
        hiddenColumnIds.filter((hiddenColumnId) => hiddenColumnId !== columnId)
      );
    },
    [hiddenColumnIds, onHiddenColumnIdsChange]
  );

  return (
    <>
      <div data-slot="kanban-board" className="flex h-full gap-4 pb-4">
        {visibleColumns.map((column) => {
          const columnItems = itemsByStatus.get(column.id as TStatus) ?? [];
          const canDropInColumn =
            !activeId ||
            !canDropCard ||
            activeItem?.status === column.id ||
            canDropCard(activeId, column.id as TStatus);
          const isOver = overColumnId === column.id && canDropInColumn;

          return (
            <SortableContext
              key={column.id}
              items={columnItems.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <KanbanColumn
                column={column}
                items={columnItems}
                count={columnItems.length}
                isOver={isOver}
                onAddItem={
                  onAddItem && column.canAdd !== false
                    ? () => onAddItem(column.id as TStatus)
                    : undefined
                }
                onHideColumn={
                  onHiddenColumnIdsChange ? () => handleHideColumn(column.id as TStatus) : undefined
                }
                labels={resolvedLabels}
              >
                {columnItems.length === 0 ? (
                  // If onAddItem is provided, show nothing (add button appears on hover)
                  // Otherwise show custom empty content or default "No items" message
                  (() => {
                    if (onAddItem && column.canAdd !== false) return null;
                    return (
                      emptyColumnContent || (
                        <div className="py-8 text-center text-muted-foreground text-sm">
                          {resolvedLabels.noItems}
                        </div>
                      )
                    );
                  })()
                ) : (
                  <div className="space-y-2">
                    {columnItems.map((item) => (
                      <KanbanCardWrapper
                        key={item.id}
                        id={item.id}
                        isDragging={activeId === item.id}
                      >
                        {renderCard(item)}
                      </KanbanCardWrapper>
                    ))}
                  </div>
                )}
              </KanbanColumn>
            </SortableContext>
          );
        })}
        {hiddenColumns.length > 0 && (
          <HiddenColumnsRail
            hiddenColumns={hiddenColumns}
            itemsByStatus={itemsByStatus}
            onShowColumn={handleShowColumn}
            labels={resolvedLabels}
          />
        )}
      </div>

      {typeof document !== 'undefined'
        ? createPortal(
            <DragOverlay dropAnimation={null}>
              {activeItem ? (
                <div className="cursor-grabbing opacity-95 shadow-xl">{renderCard(activeItem)}</div>
              ) : null}
            </DragOverlay>,
            document.body
          )
        : null}
    </>
  );
}

/**
 * Generic Kanban Board Component
 *
 * A reusable drag-and-drop kanban board that can be used across
 * different features (Deals, Ideas, etc.)
 */
export function KanbanBoard<TItem extends KanbanItem, TStatus extends string = string>(
  props: KanbanBoardProps<TItem, TStatus>
) {
  const {
    columns,
    onReorder,
    onCardMove,
    hiddenColumnIds = [],
    isLoading = false,
    headless = false,
  } = props;

  // Setup sensors for drag detection (only when drag is enabled)
  const dragSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Keep drag responsive while avoiding accidental drags
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Only use sensors if onReorder or onCardMove is provided
  const sensors = onReorder || onCardMove ? dragSensors : [];

  const hiddenColumnIdSet = useMemo(
    () => new Set(hiddenColumnIds.map((columnId) => String(columnId))),
    [hiddenColumnIds]
  );

  const explicitlyVisibleColumns = useMemo(
    () => columns.filter((column) => !hiddenColumnIdSet.has(String(column.id))),
    [columns, hiddenColumnIdSet]
  );

  // Loading skeleton
  if (isLoading) {
    const loadingColumns = explicitlyVisibleColumns.length > 0 ? explicitlyVisibleColumns : columns;
    return (
      <div className="flex gap-4 pb-4">
        {loadingColumns.map((column) => (
          <div
            key={column.id}
            className="w-72 flex-shrink-0 animate-pulse rounded-lg bg-muted/50 p-4"
          >
            <div className="mb-4 h-6 w-24 rounded bg-muted" />
            <div className="space-y-3">
              <div className="h-24 rounded bg-muted" />
              <div className="h-24 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // In headless mode the consumer supplies the DndContext — KanbanBoardInner
  // uses useDndMonitor to listen to it from inside the same tree.
  if (headless) {
    return <KanbanBoardInner {...props} headless />;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={kanbanCollisionDetection}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
    >
      <KanbanBoardInner {...props} headless={false} />
    </DndContext>
  );
}

function HiddenColumnsRail<TItem extends KanbanItem, TStatus extends string>({
  hiddenColumns,
  itemsByStatus,
  onShowColumn,
  labels,
}: {
  hiddenColumns: KanbanBoardProps<TItem, TStatus>['columns'];
  itemsByStatus: Map<TStatus, TItem[]>;
  onShowColumn: (columnId: TStatus) => void;
  labels: KanbanLabels;
}) {
  return (
    <aside
      data-slot="kanban-hidden-columns-rail"
      className="flex w-64 flex-shrink-0 flex-col gap-3 self-start rounded-lg border border-border/60 bg-background/95 p-3 shadow-sm backdrop-blur"
    >
      <Collapsible defaultOpen>
        <CollapsibleTrigger
          data-slot="kanban-hidden-columns-trigger"
          className="flex w-full items-center gap-2 rounded-md p-1 text-left transition-colors hover:bg-accent/50"
        >
          <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 [[data-open]>&]:rotate-90" />
          <EyeOff className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium text-sm">{labels.hiddenColumns}</h3>
          <span className="ml-auto rounded-full bg-muted px-1.5 py-0.5 text-muted-foreground text-xs">
            {hiddenColumns.length}
          </span>
        </CollapsibleTrigger>
        <CollapsibleContent data-slot="kanban-hidden-columns-content" className="pt-3">
          <div className="space-y-2">
            {hiddenColumns.map((column) => {
              const columnItems = itemsByStatus.get(column.id as TStatus) ?? [];

              return (
                <div
                  key={column.id}
                  data-slot="kanban-hidden-column"
                  data-column-id={column.id}
                  className="flex items-center gap-3 rounded-md border border-border/60 bg-background p-3 shadow-sm"
                >
                  {column.icon ? (
                    <span className="flex-shrink-0">{column.icon}</span>
                  ) : (
                    <div
                      className={cn(
                        'h-2.5 w-2.5 rounded-full',
                        column.accentClass ?? 'bg-muted-foreground'
                      )}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-sm">{column.label}</div>
                  </div>
                  <span className="text-muted-foreground text-sm tabular-nums">
                    {columnItems.length}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <button
                          type="button"
                          className="rounded-md border border-border/70 p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                          aria-label="Actions"
                        />
                      }
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => onShowColumn(column.id as TStatus)}>
                        {interpolate(labels.showColumn, { column: column.label })}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </aside>
  );
}
