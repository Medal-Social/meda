'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
/** Wraps the canvas in a vertical-list sortable DndContext. */
export function BuilderDndWrapper({ blockIds, onDragEnd, children }) {
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor));
    return (_jsx(DndContext, { sensors: sensors, onDragEnd: onDragEnd, children: _jsx(SortableContext, { items: blockIds, strategy: verticalListSortingStrategy, children: children }) }));
}
