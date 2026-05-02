'use client';

import { useDroppable } from '@dnd-kit/core';
import { cn } from '../../lib/utils.js';

interface DropZoneProps {
  /** Stable id (e.g. `drop-2`). */
  id: string;
  /** Visual height when no block is being dragged. */
  collapsedHeight?: number;
}

/** A horizontal drop slot rendered between blocks on the canvas. */
export function DropZone({ id, collapsedHeight = 4 }: DropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      data-slot="email-builder-drop-zone"
      data-over={isOver ? 'true' : undefined}
      className={cn(
        'mx-auto w-full transition-all duration-150',
        isOver ? 'h-12 rounded-md bg-primary/15 ring-1 ring-primary/40' : ''
      )}
      style={isOver ? undefined : { height: collapsedHeight }}
      aria-hidden
    />
  );
}
