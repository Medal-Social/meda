'use client';

import { useCallback } from 'react';
import { cn } from '../lib/utils.js';
import { CalendarToolbar } from './calendar-toolbar.js';
import { DayView } from './day-view.js';
import { addDays, addMonths } from './internal/date.js';
import { MonthView } from './month-view.js';
import { type CalendarProps, type CalendarView, DEFAULT_CALENDAR_LABELS } from './types.js';
import { WeekView } from './week-view.js';

export function Calendar({
  view = 'month',
  date,
  events,
  onDateChange,
  onViewChange,
  onEventClick,
  onSlotClick,
  weekStartsOn = 0,
  locale = 'en-US',
  labels: labelOverrides,
  className,
  renderEvent,
}: CalendarProps) {
  const labels = { ...DEFAULT_CALENDAR_LABELS, ...labelOverrides };

  const handlePrev = useCallback(() => {
    if (!onDateChange) return;
    if (view === 'month') {
      onDateChange(addMonths(date, -1));
    } else if (view === 'week') {
      onDateChange(addDays(date, -7));
    } else {
      onDateChange(addDays(date, -1));
    }
  }, [view, date, onDateChange]);

  const handleNext = useCallback(() => {
    if (!onDateChange) return;
    if (view === 'month') {
      onDateChange(addMonths(date, 1));
    } else if (view === 'week') {
      onDateChange(addDays(date, 7));
    } else {
      onDateChange(addDays(date, 1));
    }
  }, [view, date, onDateChange]);

  const handleToday = useCallback(() => {
    onDateChange?.(new Date());
  }, [onDateChange]);

  const handleViewChange = useCallback(
    (next: CalendarView) => {
      onViewChange?.(next);
    },
    [onViewChange]
  );

  const sharedProps = {
    date,
    events,
    onEventClick,
    onSlotClick,
    locale,
    labels,
    renderEvent,
  };

  return (
    <div data-slot="calendar" className={cn('@container/calendar flex flex-col gap-3', className)}>
      <CalendarToolbar
        date={date}
        view={view}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        onViewChange={onViewChange ? handleViewChange : undefined}
        locale={locale}
        labels={labels}
      />

      {view === 'month' ? (
        <MonthView
          {...sharedProps}
          weekStartsOn={weekStartsOn}
          onDateClick={onDateChange ? (d) => onDateChange(d) : undefined}
        />
      ) : view === 'week' ? (
        <WeekView
          {...sharedProps}
          weekStartsOn={weekStartsOn}
          onDateClick={onDateChange ? (d) => onDateChange(d) : undefined}
        />
      ) : (
        <DayView {...sharedProps} />
      )}
    </div>
  );
}
