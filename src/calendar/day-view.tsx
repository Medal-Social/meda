'use client';

import { useMemo } from 'react';
import { cn } from '../lib/utils.js';
import { formatDate, formatHour, getDateKey, getHoursOfDay, isToday } from './internal/date.js';
import { TimeSlot } from './internal/time-slot.js';
import { type CalendarEvent, type DayViewProps, DEFAULT_CALENDAR_LABELS } from './types.js';

export function DayView({
  date,
  events,
  onEventClick,
  onSlotClick,
  locale = 'en-US',
  labels: labelOverrides,
  className,
  renderEvent,
}: DayViewProps) {
  const labels = { ...DEFAULT_CALENDAR_LABELS, ...labelOverrides };
  const hours = useMemo(() => getHoursOfDay(), []);
  const isTodayDate = isToday(date);

  const eventsByHour = useMemo(() => {
    const map = new Map<number, CalendarEvent[]>();
    const dateKey = getDateKey(date);
    for (const event of events) {
      if (event.allDay) continue;
      if (getDateKey(event.start) !== dateKey) continue;
      const hour = event.start.getHours();
      const existing = map.get(hour) ?? [];
      existing.push(event);
      map.set(hour, existing);
    }
    for (const [hour, items] of map.entries()) {
      items.sort((a, b) => a.start.getTime() - b.start.getTime());
      map.set(hour, items);
    }
    return map;
  }, [events, date]);

  const totalEvents = useMemo(() => {
    let count = 0;
    for (const list of eventsByHour.values()) count += list.length;
    return count;
  }, [eventsByHour]);

  return (
    <section
      data-slot="calendar-day-view"
      aria-label={labels.dayView}
      className={cn(
        '@container/calendar overflow-hidden rounded-lg border border-border bg-background',
        className
      )}
    >
      {/* Day Header */}
      <div
        className={cn(
          'border-border border-b bg-muted/50 px-4 py-3',
          isTodayDate && 'bg-primary/5'
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3
              className={cn(
                'font-semibold text-lg',
                isTodayDate ? 'text-primary' : 'text-foreground'
              )}
            >
              {formatDate(
                date,
                { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
                locale
              )}
            </h3>
            {isTodayDate && (
              <span className="font-medium text-primary text-xs">{labels.today}</span>
            )}
          </div>
          <div className="text-muted-foreground text-sm">{labels.eventCountLabel(totalEvents)}</div>
        </div>
      </div>

      {/* Time Grid */}
      <div
        // biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable region needs keyboard focus per WCAG (axe scrollable-region-focusable)
        tabIndex={0}
        className="max-h-[36rem] overflow-y-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {hours.map((hour) => (
          <div key={`row-${hour}`} className="grid grid-cols-[80px_1fr]">
            <div className="border-border border-r border-b px-3 py-3 text-right text-muted-foreground text-xs">
              {formatHour(hour, locale)}
            </div>
            <TimeSlot
              date={date}
              hour={hour}
              events={eventsByHour.get(hour) ?? []}
              onSlotClick={onSlotClick}
              onEventClick={onEventClick}
              renderEvent={renderEvent}
              variant="day"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
