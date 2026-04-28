'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../lib/utils.js';
/**
 * KanbanCardWrapper Component
 *
 * Wraps card content to make it draggable within the kanban board.
 */
export function KanbanCardWrapper({ id, isDragging, children }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging, } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    const isCurrentlyDragging = isDragging || isSortableDragging;
    return (_jsx("div", { ref: setNodeRef, style: style, ...attributes, ...listeners, "data-slot": "kanban-card", className: cn('cursor-grab active:cursor-grabbing', 'touch-manipulation', // Better touch handling
        'transition-shadow duration-200', isCurrentlyDragging && 'z-50 opacity-50 shadow-lg'), children: children }));
}
