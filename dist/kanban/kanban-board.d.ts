import { type KanbanBoardProps, type KanbanItem } from './types.js';
/**
 * Generic Kanban Board Component
 *
 * A reusable drag-and-drop kanban board that can be used across
 * different features (Deals, Ideas, etc.)
 */
export declare function KanbanBoard<TItem extends KanbanItem, TStatus extends string = string>(props: KanbanBoardProps<TItem, TStatus>): import("react/jsx-runtime").JSX.Element;
