'use client';

import { useDndMonitor } from '@dnd-kit/core';
import { type ReactNode, useState } from 'react';
import { cn } from '../lib/utils.js';

/**
 * Props for DragModeBanner.
 *
 * **Important:** This component uses `useDndMonitor` internally and must be
 * rendered inside the same `<DndContext>` tree it is monitoring.
 *
 * **Known limitation:** The ESC chip is decorative only. Keyboard-initiated
 * drags cancel naturally via dnd-kit's KeyboardSensor; pointer-initiated drags
 * require the user to release outside any drop zone — a manual ESC handler for
 * pointer drags is not yet implemented.
 */
export interface DragModeBannerProps {
  /** Banner message shown while a drag is active. */
  message: ReactNode;
  /**
   * When provided, render an ESC chip indicating the user can press Escape to
   * cancel. See known limitation note above.
   */
  cancelKey?: 'ESC';
  /**
   * Optional predicate; when supplied only activates the banner for matching
   * drag ids. Receives the `active.id` of the current drag.
   */
  isActive?: (activeId: string | number) => boolean;
  className?: string;
}

export function DragModeBanner({ message, cancelKey, isActive, className }: DragModeBannerProps) {
  const [activeId, setActiveId] = useState<string | number | null>(null);

  useDndMonitor({
    onDragStart: (e) => setActiveId(e.active.id),
    onDragEnd: () => setActiveId(null),
    onDragCancel: () => setActiveId(null),
  });

  if (activeId == null) return null;
  if (isActive && !isActive(activeId)) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'pointer-events-none flex items-center justify-center gap-3 px-4 py-2 text-sm text-muted-foreground',
        className
      )}
    >
      <span>{message}</span>
      {cancelKey === 'ESC' && (
        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-medium font-mono text-xs">
          ESC
        </kbd>
      )}
    </div>
  );
}

DragModeBanner.displayName = 'DragModeBanner';
