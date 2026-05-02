import { type DragEndEvent } from '@dnd-kit/core';
import type { ReactNode } from 'react';
interface BuilderDndWrapperProps {
    blockIds: string[];
    onDragEnd: (event: DragEndEvent) => void;
    children: ReactNode;
}
/** Wraps the canvas in a vertical-list sortable DndContext. */
export declare function BuilderDndWrapper({ blockIds, onDragEnd, children }: BuilderDndWrapperProps): import("react/jsx-runtime").JSX.Element;
export {};
