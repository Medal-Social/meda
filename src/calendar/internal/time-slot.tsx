'use client';

import { memo, type ReactNode } from 'react';
import { cn } from '../../lib/utils.js';
import type { CalendarEvent } from '../types.js';
import { isPast, isToday, setHours } from './date.js';
import { EventPill } from './event-pill.js';

interface TimeSlotProps {
  date: Date;
  hour: number;
  events: CalendarEvent[];
  onSlotClick?: (slot: { start: Date; end: Date }) => void;
  onEventClick?: (event: CalendarEvent) => void;
  renderEvent?: (event: CalendarEvent) => ReactNode;
  variant?: 'week' | 'day';
}

function TimeSlotBase({
  date,
  hour,
  events,
  onSlotClick,
  onEventClick,
  renderEvent,
  variant = 'week',
}: TimeSlotProps) {
  const slotStart = setHours(date, hour);
  const slotEnd = setHours(date, hour + 1);
  const isPastSlot = isPast(slotStart) || (isToday(date) && hour < new Date().getHours());
  const isTodayDate = isToday(date);
  const isCurrentHour = isTodayDate && hour === new Date().getHours();
  const isInteractive = typeof onSlotClick === 'function';

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: time slots offer optional tap-to-create as a passive convenience; rendered event buttons remain the keyboard-accessible controls (avoids nested-interactive)
    // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard nav is provided via the inner event buttons; slot-click is mouse-only sugar
    <div
      data-slot="calendar-time-slot"
      data-current-hour={isCurrentHour ? 'true' : undefined}
      onClick={
        isInteractive
          ? (event) => {
              const target = event.target as HTMLElement;
              if (target.closest('[data-calendar-item="true"]')) return;
              onSlotClick({ start: slotStart, end: slotEnd });
            }
          : undefined
      }
      className={cn(
        'group relative border-border border-b p-1 transition-colors',
        variant === 'week' ? 'min-h-[44px] border-r last:border-r-0' : 'min-h-[60px]',
        isPastSlot ? 'bg-muted/20' : 'bg-background',
        isCurrentHour && 'bg-primary/5',
        !isPastSlot && 'hover:bg-accent/30',
        isInteractive && 'cursor-pointer'
      )}
    >
      {/* Current Time Indicator */}
      {isCurrentHour && (
        <div className="pointer-events-none absolute top-1/2 right-0 left-0 z-10 -translate-y-1/2">
          <div className="relative h-0.5 bg-primary">
            <div className="absolute -top-1 -left-1 size-2.5 rounded-full bg-primary" />
          </div>
        </div>
      )}

      {/* Events */}
      <div className="flex flex-col gap-1">
        {events.map((event) => (
          <div key={event.id}>
            {renderEvent ? renderEvent(event) : <EventPill event={event} onClick={onEventClick} />}
          </div>
        ))}
      </div>
    </div>
  );
}

export const TimeSlot = memo(TimeSlotBase);
