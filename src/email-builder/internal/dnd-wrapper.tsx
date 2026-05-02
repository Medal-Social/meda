'use client';

import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { ReactNode } from 'react';

interface BuilderDndWrapperProps {
  blockIds: string[];
  onDragEnd: (event: DragEndEvent) => void;
  children: ReactNode;
}

/** Wraps the canvas in a vertical-list sortable DndContext. */
export function BuilderDndWrapper({ blockIds, onDragEnd, children }: BuilderDndWrapperProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );
  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}
