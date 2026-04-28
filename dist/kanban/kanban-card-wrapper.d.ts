import type { ReactNode } from 'react';
interface KanbanCardWrapperProps {
    /** Unique ID for the draggable item */
    id: string;
    /** Whether the card is currently being dragged */
    isDragging?: boolean;
    /** The card content to render */
    children: ReactNode;
}
/**
 * KanbanCardWrapper Component
 *
 * Wraps card content to make it draggable within the kanban board.
 */
export declare function KanbanCardWrapper({ id, isDragging, children }: KanbanCardWrapperProps): import("react/jsx-runtime").JSX.Element;
export {};
