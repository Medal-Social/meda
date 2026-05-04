'use client';

import { useMemo } from 'react';
import { cn } from '../lib/utils.js';
import {
  addDays,
  formatDayOfWeek,
  getDateKey,
  getMonthCalendarDays,
  startOfWeek,
} from './internal/date.js';
import { DayCell } from './internal/day-cell.js';
import { type CalendarEvent, DEFAULT_CALENDAR_LABELS, type MonthViewProps } from './types.js';

export function MonthView({
  date,
  events,
  onEventClick,
  onDateClick,
  onSlotClick,
  weekStartsOn = 0,
  locale = 'en-US',
  labels: labelOverrides,
  className,
  renderEvent,
}: MonthViewProps) {
  const labels = { ...DEFAULT_CALENDAR_LABELS, ...labelOverrides };

  const calendarDays = useMemo(
    () => getMonthCalendarDays(date, weekStartsOn),
    [date, weekStartsOn]
  );

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const key = getDateKey(event.start);
      const existing = map.get(key) ?? [];
      existing.push(event);
      map.set(key, existing);
    }
    for (const [key, dayEvents] of map.entries()) {
      dayEvents.sort((a, b) => a.start.getTime() - b.start.getTime());
      map.set(key, dayEvents);
    }
    return map;
  }, [events]);

  const weekDays = useMemo(() => {
    const baseDate = startOfWeek(new Date(2024, 0, 7), weekStartsOn);
    return Array.from({ length: 7 }, (_, i) =>
      formatDayOfWeek(addDays(baseDate, i), locale, 'short')
    );
  }, [locale, weekStartsOn]);

  let cellClick: ((d: Date) => void) | undefined;
  if (onDateClick) {
    cellClick = (d: Date) => onDateClick(d);
  } else if (onSlotClick) {
    cellClick = (d: Date) => {
      const start = new Date(d);
      start.setHours(0, 0, 0, 0);
      const end = new Date(d);
      end.setHours(23, 59, 59, 999);
      onSlotClick({ start, end });
    };
  } else {
    cellClick = undefined;
  }

  return (
    <div
      data-slot="calendar-month-view"
      className={cn(
        '@container/calendar overflow-hidden rounded-md border border-border bg-background',
        className
      )}
    >
      <div className="grid grid-cols-7 border-border border-b bg-muted/40">
        {weekDays.map((day) => (
          <div
            key={`header-${day}`}
            className="border-border border-r px-1 py-1.5 text-center font-medium text-muted-foreground text-[11px] uppercase tracking-wide last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {calendarDays.map((d) => (
          <DayCell
            key={`day-${getDateKey(d)}`}
            date={d}
            currentMonth={date}
            events={eventsByDate.get(getDateKey(d)) ?? []}
            onCellClick={cellClick}
            onEventClick={onEventClick}
            onMoreClick={onDateClick}
            labels={labels}
            renderEvent={renderEvent}
          />
        ))}
      </div>
    </div>
  );
}
