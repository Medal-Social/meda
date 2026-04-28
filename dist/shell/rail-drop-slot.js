'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { useDroppable } from '@dnd-kit/core';
import { cn } from '../lib/utils.js';
export function RailDropSlot({ id, accepts, disabled, children, className, ariaLabel, ref, }) {
    const { isOver, active, setNodeRef } = useDroppable({
        id,
        disabled,
        data: { type: 'rail-drop-slot' },
    });
    const wouldAccept = !disabled && (!accepts || (active?.id != null && accepts(String(active.id))));
    const showHover = isOver && wouldAccept;
    const showRejected = isOver && !wouldAccept;
    return (_jsx("section", { ref: (el) => {
            setNodeRef(el);
            if (typeof ref === 'function')
                ref(el);
            else if (ref)
                ref.current = el;
        }, "data-slot-id": id, "data-state": showHover ? 'hover' : showRejected ? 'rejected' : 'idle', "aria-label": ariaLabel, "aria-disabled": disabled || undefined, className: cn('relative rounded-lg border border-border bg-card transition-colors', showHover && 'border-primary bg-primary/5 ring-2 ring-primary/30', showRejected && 'border-destructive bg-destructive/5', disabled && 'opacity-60', className), children: children }));
}
RailDropSlot.displayName = 'RailDropSlot';
