'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { useDndMonitor, useDroppable } from '@dnd-kit/core';
import { useState } from 'react';
import { cn } from '../lib/utils.js';
export function RailDropSlot({ id, accepts, disabled, children, render, className, ariaLabel, ref, }) {
    const { isOver, active, setNodeRef } = useDroppable({
        id,
        disabled,
        data: { type: 'rail-drop-slot' },
    });
    const [globalDragActive, setGlobalDragActive] = useState(false);
    useDndMonitor({
        onDragStart: () => setGlobalDragActive(true),
        onDragEnd: () => setGlobalDragActive(false),
        onDragCancel: () => setGlobalDragActive(false),
    });
    const wouldAccept = !disabled && (!accepts || (active?.id != null && accepts(String(active.id))));
    let state;
    if (isOver && wouldAccept) {
        state = 'over';
    }
    else if (isOver && !wouldAccept) {
        state = 'rejected';
    }
    else if (globalDragActive && disabled) {
        state = 'rejected';
    }
    else if (globalDragActive && wouldAccept) {
        state = 'active';
    }
    else {
        state = 'idle';
    }
    // Legacy boolean aliases kept for backward-compat data attributes
    const showHover = state === 'over';
    const showRejected = state === 'rejected';
    return (_jsx("section", { ref: (el) => {
            setNodeRef(el);
            if (typeof ref === 'function')
                ref(el);
            else if (ref)
                ref.current = el;
        }, "data-slot-id": id, "data-state": state, "aria-label": ariaLabel, "aria-disabled": disabled || undefined, className: cn('relative rounded-lg border border-border bg-card transition-all duration-150', state === 'idle' && '', state === 'active' && 'border-dashed border-primary/60 bg-primary/5', state === 'over' &&
            'border-primary bg-primary/5 ring-2 ring-primary/30 shadow-[0_0_0_4px_hsl(var(--primary)/0.1)]', state === 'rejected' && 'border-destructive/40 opacity-60', 
        // Legacy classes — keep working for consumers using data-state selectors
        showHover && '', showRejected && '', disabled && state === 'idle' && 'opacity-60', className), children: render ? render(state) : children }));
}
RailDropSlot.displayName = 'RailDropSlot';
