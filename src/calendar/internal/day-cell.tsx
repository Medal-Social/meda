'use client';

import { memo, type ReactNode } from 'react';
import { cn } from '../../lib/utils.js';
import type { CalendarEvent, CalendarLabels } from '../types.js';
import { isPast, isSameMonth, isToday } from './date.js';
import { EventPill } from './event-pill.js';

interface DayCellProps {
  date: Date;
  currentMonth: Date;
  events: CalendarEvent[];
  onCellClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onMoreClick?: (date: Date, anchorEl?: HTMLElement) => void;
  labels: CalendarLabels;
  renderEvent?: (event: CalendarEvent) => ReactNode;
}

const MAX_VISIBLE_ITEMS = 3;

function DayCellBase({
  date,
  currentMonth,
  events,
  onCellClick,
  onEventClick,
  onMoreClick,
  labels,
  renderEvent,
}: DayCellProps) {
  const isCurrentMonth = isSameMonth(date, currentMonth);
  const isTodayDate = isToday(date);
  const isPastDate = isPast(date);
  const dayNumber = date.getDate();
  const visibleEvents = events.slice(0, MAX_VISIBLE_ITEMS);
  const hiddenCount = events.length - MAX_VISIBLE_ITEMS;
  const isCellInteractive = typeof onCellClick === 'function';

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: month-view cells offer optional tap-to-open as a passive convenience; inner event pills are the keyboard-accessible controls (avoids nested-interactive)
    // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard nav is provided via the inner event/day controls; cell-click is mouse-only sugar
    <div
      data-slot="calendar-day-cell"
      data-today={isTodayDate ? 'true' : undefined}
      onClick={
        isCellInteractive
          ? (event) => {
              const target = event.target as HTMLElement;
              if (target.closest('[data-calendar-item="true"]')) return;
              onCellClick(date);
            }
          : undefined
      }
      className={cn(
        'group relative flex min-h-[5.5rem] flex-col gap-1 border-border border-r border-b p-1.5 transition-colors',
        '@md/calendar:min-h-[6.75rem]',
        isCurrentMonth ? 'bg-background' : 'bg-muted/30',
        isPastDate && isCurrentMonth && 'bg-muted/20',
        isTodayDate && 'border-primary/30 bg-primary/5',
        'hover:bg-accent/30',
        isCellInteractive && 'cursor-pointer'
      )}
    >
      {/* Day number */}
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'inline-flex size-6 items-center justify-center rounded-full font-medium text-xs',
            isTodayDate
              ? 'border border-primary/40 bg-primary/15 text-primary'
              : isCurrentMonth
                ? 'text-foreground'
                : 'text-muted-foreground'
          )}
        >
          {dayNumber}
        </span>
      </div>

      {/* Events */}
      <div className="flex flex-col gap-0.5">
        {visibleEvents.map((event) => (
          <div key={event.id}>
            {renderEvent ? renderEvent(event) : <EventPill event={event} onClick={onEventClick} />}
          </div>
        ))}

        {hiddenCount > 0 && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onMoreClick?.(date, event.currentTarget as HTMLElement);
            }}
            className={cn(
              'min-h-[24px] w-full rounded px-1 py-0.5 text-left font-medium text-[11px]',
              'text-primary transition-colors hover:bg-primary/10'
            )}
          >
            {labels.moreCount(hiddenCount)}
          </button>
        )}
      </div>
    </div>
  );
}

export const DayCell = memo(DayCellBase);
