// open/meda/src/kanban/kanban-drop-handler.ts
import type { DragEndEvent } from '@dnd-kit/core';
import { isKanbanCardDropAllowed } from './kanban-collision.js';
import type { KanbanItem } from './types.js';

export interface KanbanColumnDropHandlerArgs<TItem extends KanbanItem, TStatus extends string> {
  event: DragEndEvent;
  items: TItem[];
  columns: { id: string }[];
  onCardMove?: (itemId: string, newStatus: TStatus) => void;
  onReorder?: (itemId: string, newStatus: TStatus, newPosition: number) => void;
  canDropCard?: (itemId: string, targetStatus: TStatus) => boolean;
}

/** Returns true if the drag was handled as a kanban column drop (column-to-column
 * move or reorder); false if `over` was null or did not resolve to a kanban column/
 * item, so the consumer can handle it (e.g. an external drop slot). */
export function handleKanbanColumnDrop<TItem extends KanbanItem, TStatus extends string>(
  args: KanbanColumnDropHandlerArgs<TItem, TStatus>
): boolean {
  const { event, items, columns, onCardMove, onReorder, canDropCard } = args;
  const { active, over } = event;

  if (!over) return false;

  const activeItemId = active.id as string;
  const overId = over.id as string;

  const draggedItem = items.find((item) => item.id === activeItemId);
  if (!draggedItem) return false;

  // Build itemsByStatus map for position resolution
  const itemsByStatus = new Map<TStatus, TItem[]>();
  for (const column of columns) {
    itemsByStatus.set(column.id as TStatus, []);
  }
  for (const item of items) {
    const status = item.status as TStatus;
    const columnItems = itemsByStatus.get(status);
    if (columnItems) {
      columnItems.push(item);
    }
  }
  for (const [status, columnItems] of itemsByStatus) {
    columnItems.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    itemsByStatus.set(status, columnItems);
  }

  // Resolve drop target: check if over.id is a column id
  const targetColumn = columns.find((col) => col.id === overId);
  if (targetColumn) {
    const targetStatus = targetColumn.id as TStatus;
    const columnItems = itemsByStatus.get(targetStatus) ?? [];

    if (
      !isKanbanCardDropAllowed({
        itemId: activeItemId,
        sourceStatus: draggedItem.status as TStatus,
        targetStatus,
        canDropCard,
      })
    ) {
      return true; // handled (rejected) — don't fall through to external handler
    }

    if (draggedItem.status !== targetStatus || draggedItem.position !== columnItems.length) {
      if (onReorder) {
        onReorder(activeItemId, targetStatus, columnItems.length);
      }
      if (onCardMove && draggedItem.status !== targetStatus) {
        void Promise.resolve(onCardMove(activeItemId, targetStatus)).catch(() => {
          // Mutation handlers handle toast + rollback on failure.
        });
      }
    }
    return true;
  }

  // Check if over.id is an item id in one of the kanban columns
  const targetItem = items.find((item) => item.id === overId);
  if (!targetItem) return false;

  const targetStatus = targetItem.status as TStatus;
  const columnItems = itemsByStatus.get(targetStatus) ?? [];
  const targetIndex = columnItems.findIndex((item) => item.id === overId);
  if (targetIndex === -1) return false;

  if (
    !isKanbanCardDropAllowed({
      itemId: activeItemId,
      sourceStatus: draggedItem.status as TStatus,
      targetStatus,
      canDropCard,
    })
  ) {
    return true; // handled (rejected)
  }

  if (draggedItem.status !== targetStatus || draggedItem.position !== targetIndex) {
    if (onReorder) {
      onReorder(activeItemId, targetStatus, targetIndex);
    }
    if (onCardMove && draggedItem.status !== targetStatus) {
      void Promise.resolve(onCardMove(activeItemId, targetStatus)).catch(() => {
        // Mutation handlers handle toast + rollback on failure.
      });
    }
  }
  return true;
}
