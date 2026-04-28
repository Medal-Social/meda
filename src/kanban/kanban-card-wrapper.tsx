'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ReactNode } from 'react';
import { cn } from '../lib/utils.js';

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
export function KanbanCardWrapper({ id, isDragging, children }: KanbanCardWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isCurrentlyDragging = isDragging || isSortableDragging;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-slot="kanban-card"
      className={cn(
        'cursor-grab active:cursor-grabbing',
        'touch-manipulation', // Better touch handling
        'transition-shadow duration-200',
        isCurrentlyDragging && 'z-50 opacity-50 shadow-lg'
      )}
    >
      {children}
    </div>
  );
}
