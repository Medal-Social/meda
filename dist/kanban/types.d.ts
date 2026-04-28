import type { ReactNode } from 'react';
export interface KanbanItem {
    id: string;
    status: string;
    position: number;
}
export interface KanbanColumn {
    id: string;
    label: string;
    /** Tailwind class string for the column accent — e.g. 'bg-success-500' or a token-driven class. */
    accentClass?: string;
    /** Optional icon node rendered next to the column label. */
    icon?: ReactNode;
    /** Whether the column accepts new items via the add-button. */
    canAdd?: boolean;
}
export interface KanbanLabels {
    /** "Add to {{column}}" — `{{column}}` replaced at render. */
    addItemTo: string;
    hideColumn: string;
    noItems: string;
    /** "Show {{column}}" */
    showColumn: string;
    hiddenColumns: string;
}
export declare const defaultKanbanLabels: KanbanLabels;
export interface KanbanBoardProps<TItem extends KanbanItem, TStatus extends string = string> {
    columns: KanbanColumn[];
    items: TItem[];
    renderCard: (item: TItem) => ReactNode;
    onReorder?: (itemId: string, newStatus: TStatus, newPosition: number) => void;
    onCardMove?: (itemId: string, newStatus: TStatus) => void;
    canDropCard?: (itemId: string, targetStatus: TStatus) => boolean;
    onAddItem?: (columnId: TStatus) => void;
    showEmptyColumns?: boolean;
    hiddenColumnIds?: TStatus[];
    onHiddenColumnIdsChange?: (ids: TStatus[]) => void;
    isLoading?: boolean;
    emptyColumnContent?: ReactNode;
    labels?: Partial<KanbanLabels>;
    className?: string;
}
