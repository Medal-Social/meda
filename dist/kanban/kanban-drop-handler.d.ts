import type { DragEndEvent } from '@dnd-kit/core';
import type { KanbanItem } from './types.js';
export interface KanbanColumnDropHandlerArgs<TItem extends KanbanItem, TStatus extends string> {
    event: DragEndEvent;
    items: TItem[];
    columns: {
        id: string;
    }[];
    onCardMove?: (itemId: string, newStatus: TStatus) => void;
    onReorder?: (itemId: string, newStatus: TStatus, newPosition: number) => void;
    canDropCard?: (itemId: string, targetStatus: TStatus) => boolean;
}
/** Returns true if the drag was handled as a kanban column drop (column-to-column
 * move or reorder); false if `over` was null or did not resolve to a kanban column/
 * item, so the consumer can handle it (e.g. an external drop slot). */
export declare function handleKanbanColumnDrop<TItem extends KanbanItem, TStatus extends string>(args: KanbanColumnDropHandlerArgs<TItem, TStatus>): boolean;
