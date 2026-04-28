'use client';

import { useDroppable } from '@dnd-kit/core';
import type { ReactNode, Ref, RefObject } from 'react';
import { cn } from '../lib/utils.js';

export interface RailDropSlotProps {
  /** Stable id used by dnd-kit; also rendered as `data-slot-id`. */
  id: string;
  /** Decide whether this slot accepts the dragged card. */
  accepts?: (activeId: string) => boolean;
  /** Whether this slot can currently receive a drop (e.g. capacity, online). */
  disabled?: boolean;
  children: ReactNode;
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
  className,
  ariaLabel,
  ref,
}: RailDropSlotProps) {
  const { isOver, active, setNodeRef } = useDroppable({
    id,
    disabled,
    data: { type: 'rail-drop-slot' },
  });

  const wouldAccept = !disabled && (!accepts || (active?.id != null && accepts(String(active.id))));
  const showHover = isOver && wouldAccept;
  const showRejected = isOver && !wouldAccept;

  return (
    <section
      ref={(el) => {
        setNodeRef(el);
        if (typeof ref === 'function') ref(el);
        else if (ref) (ref as RefObject<HTMLElement | null>).current = el;
      }}
      data-slot-id={id}
      data-state={showHover ? 'hover' : showRejected ? 'rejected' : 'idle'}
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      className={cn(
        'relative rounded-lg border border-border bg-card transition-colors',
        showHover && 'border-primary bg-primary/5 ring-2 ring-primary/30',
        showRejected && 'border-destructive bg-destructive/5',
        disabled && 'opacity-60',
        className
      )}
    >
      {children}
    </section>
  );
}

RailDropSlot.displayName = 'RailDropSlot';
