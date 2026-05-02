'use client';

import type { ReactNode } from 'react';
import { cn } from '../../lib/utils.js';
import type { CalendarEvent } from '../types.js';

interface EventPillProps {
  event: CalendarEvent;
  onClick?: (event: CalendarEvent) => void;
  variant?: 'compact' | 'full';
  className?: string;
}

/**
 * Default compact event pill used inside calendar cells/slots when the
 * consumer does not pass a custom `renderEvent` callback.
 */
export function EventPill({ event, onClick, variant = 'compact', className }: EventPillProps) {
  const isInteractive = typeof onClick === 'function';
  // Apply consumer color as the left-border accent only — using it as a
  // background risks color-contrast failures with the default foreground
  // text. Consumers wanting full color fills should pass a custom renderEvent.
  const style = event.color ? { borderLeftColor: event.color } : undefined;

  const content: ReactNode =
    variant === 'compact' ? (
      <span className="block truncate font-medium text-[11px] leading-tight">{event.title}</span>
    ) : (
      <>
        <span className="block truncate font-medium text-xs leading-tight">{event.title}</span>
        {event.allDay ? null : (
          <span className="block text-[10px] text-muted-foreground tabular-nums">
            {formatRange(event)}
          </span>
        )}
      </>
    );

  if (isInteractive) {
    return (
      <button
        type="button"
        data-slot="calendar-event"
        data-calendar-item="true"
        onClick={(e) => {
          e.stopPropagation();
          onClick(event);
        }}
        style={style}
        className={cn(
          'block w-full min-h-[24px] rounded border-l-2 bg-accent px-1.5 py-0.5 text-left',
          'border-primary text-accent-foreground transition-colors',
          'hover:bg-accent/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          className
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      data-slot="calendar-event"
      data-calendar-item="true"
      style={style}
      className={cn(
        'block w-full min-h-[24px] rounded border-l-2 bg-accent px-1.5 py-0.5',
        'border-primary text-accent-foreground',
        className
      )}
    >
      {content}
    </div>
  );
}

function formatRange(event: CalendarEvent): string {
  const start = event.start;
  const end = event.end;
  const fmt = (d: Date) =>
    new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(
      d
    );
  if (!end) return fmt(start);
  return `${fmt(start)} – ${fmt(end)}`;
}
