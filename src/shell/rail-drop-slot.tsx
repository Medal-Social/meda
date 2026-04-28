'use client';

import { useDndMonitor, useDroppable } from '@dnd-kit/core';
import { type ReactNode, type Ref, type RefObject, useState } from 'react';
import { cn } from '../lib/utils.js';

/**
 * Describes the slot's current relation to an active drag operation.
 *
 * - `'idle'`     — no drag in progress.
 * - `'active'`   — a drag is in progress and this slot would accept it, but
 *                  the cursor is not currently over this slot.
 * - `'over'`     — the dragged item is hovering over this slot and it would
 *                  accept the drop.
 * - `'rejected'` — the dragged item is hovering over this slot but the slot
 *                  cannot accept it (disabled or `accepts` returns false), OR
 *                  the slot is `disabled` while any drag is active.
 */
export type RailDropSlotState = 'idle' | 'active' | 'over' | 'rejected';

export interface RailDropSlotProps {
  /** Stable id used by dnd-kit; also rendered as `data-slot-id`. */
  id: string;
  /** Decide whether this slot accepts the dragged card. */
  accepts?: (activeId: string) => boolean;
  /** Whether this slot can currently receive a drop (e.g. capacity, online). */
  disabled?: boolean;
  /**
   * Static content. Mutually exclusive with `render`.
   * Use `render` when you need state-aware content.
   */
  children?: ReactNode;
  /**
   * State-aware content factory. Receives the slot's current `RailDropSlotState`
   * so you can render different UI for idle / active / over / rejected states.
   * Mutually exclusive with `children`.
   */
  render?: (state: RailDropSlotState) => ReactNode;
  className?: string;
  /** Visible label for assistive tech. */
  ariaLabel?: string;
  ref?: Ref<HTMLElement>;
}

export function RailDropSlot({
  id,
  accepts,
  disabled,
  children,
  render,
  className,
  ariaLabel,
  ref,
}: RailDropSlotProps) {
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

  let state: RailDropSlotState;
  if (isOver && wouldAccept) {
    state = 'over';
  } else if (isOver && !wouldAccept) {
    state = 'rejected';
  } else if (globalDragActive && disabled) {
    state = 'rejected';
  } else if (globalDragActive && wouldAccept) {
    state = 'active';
  } else {
    state = 'idle';
  }

  // Legacy boolean aliases kept for backward-compat data attributes
  const showHover = state === 'over';
  const showRejected = state === 'rejected';

  return (
    <section
      ref={(el) => {
        setNodeRef(el);
        if (typeof ref === 'function') ref(el);
        else if (ref) (ref as RefObject<HTMLElement | null>).current = el;
      }}
      data-slot-id={id}
      data-state={state}
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      className={cn(
        'relative rounded-lg border border-border bg-card transition-all duration-150',
        state === 'idle' && '',
        state === 'active' && 'border-dashed border-primary/60 bg-primary/5',
        state === 'over' &&
          'border-primary bg-primary/5 ring-2 ring-primary/30 shadow-[0_0_0_4px_hsl(var(--primary)/0.1)]',
        state === 'rejected' && 'border-destructive/40 opacity-60',
        // Legacy classes — keep working for consumers using data-state selectors
        showHover && '',
        showRejected && '',
        disabled && state === 'idle' && 'opacity-60',
        className
      )}
    >
      {render ? render(state) : children}
    </section>
  );
}

RailDropSlot.displayName = 'RailDropSlot';
