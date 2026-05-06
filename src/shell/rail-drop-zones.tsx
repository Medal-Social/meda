'use client';

import { useDndMonitor } from '@dnd-kit/core';
import { type ReactNode, useState } from 'react';
import { cn } from '../lib/utils.js';

export interface RailDropZonesProps {
  /** Section title — uppercased in the header. Defaults to "Drop zones". */
  title?: string;
  /** Subtitle shown under the title (e.g. "Eligible machines for ENG-405 · claude"). */
  subtitle?: ReactNode;
  /** Count badge rendered in the header corner, e.g. "3 / 4". */
  count?: ReactNode;
  /** Optional icon rendered at the start of the header. */
  icon?: ReactNode;
  /**
   * When set, overrides the auto-detected drag-active state. Useful for
   * Storybook stories that want to demonstrate the active visual without a
   * real drag in progress.
   */
  forceActive?: boolean;
  /**
   * Optional predicate; when supplied only activates the rail outline for
   * matching drag ids. Receives `active.id` of the current drag.
   */
  isActive?: (activeId: string | number) => boolean;
  children: ReactNode;
  className?: string;
}

export function RailDropZones({
  title = 'Drop zones',
  subtitle,
  count,
  icon,
  forceActive,
  isActive,
  children,
  className,
}: RailDropZonesProps) {
  const [activeId, setActiveId] = useState<string | number | null>(null);

  /* v8 ignore next — useDndMonitor: callbacks are never invoked in jsdom (no pointer events) */
  useDndMonitor({
    onDragStart: (e) => setActiveId(e.active.id),
    onDragEnd: () => setActiveId(null),
    onDragCancel: () => setActiveId(null),
  });

  /* v8 ignore next — false branch: activeId is always null in jsdom (no drag events) */
  const auto = activeId != null && (!isActive || isActive(activeId));
  const active = forceActive ?? auto;

  return (
    <section
      data-active={active || undefined}
      className={cn(
        'flex flex-col gap-3 rounded-lg border border-transparent p-3 transition-colors',
        active && 'border-2 border-dashed border-primary/60 bg-primary/5',
        className
      )}
    >
      {(title || subtitle || count) && (
        <header className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            {icon && <span className="text-primary">{icon}</span>}
            <div className="flex flex-col gap-0.5">
              {title && (
                <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  {title}
                </span>
              )}
              {subtitle && <span className="text-muted-foreground text-xs">{subtitle}</span>}
            </div>
          </div>
          {count && <span className="text-muted-foreground text-xs">{count}</span>}
        </header>
      )}
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}

RailDropZones.displayName = 'RailDropZones';
