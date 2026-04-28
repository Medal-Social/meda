import type { ReactNode } from 'react';
import type { KanbanColumn as KanbanColumnDef, KanbanItem, KanbanLabels } from './types.js';
interface KanbanColumnProps<TItem extends KanbanItem> {
    column: KanbanColumnDef;
    items: TItem[];
    count: number;
    isOver?: boolean;
    onAddItem?: () => void;
    onHideColumn?: () => void;
    labels: KanbanLabels;
    children: ReactNode;
}
/**
 * KanbanColumn Component
 *
 * A single column in the kanban board that can receive dropped items.
 */
export declare function KanbanColumn<TItem extends KanbanItem>({ column, count, isOver, onAddItem, onHideColumn, labels, children, }: KanbanColumnProps<TItem>): import("react/jsx-runtime").JSX.Element;
export {};
