'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils.js';
import { formatMonthYear } from './internal/date.js';
import { type CalendarToolbarProps, type CalendarView, DEFAULT_CALENDAR_LABELS } from './types.js';

const VIEW_ORDER: CalendarView[] = ['day', 'week', 'month'];

export function CalendarToolbar({
  date,
  view,
  onPrev,
  onNext,
  onToday,
  onViewChange,
  periodLabel,
  showViewSwitcher = true,
  locale = 'en-US',
  labels: labelOverrides,
  className,
}: CalendarToolbarProps) {
  const labels = { ...DEFAULT_CALENDAR_LABELS, ...labelOverrides };
  const title = periodLabel ?? formatMonthYear(date, locale);
  const viewLabel: Record<CalendarView, string> = {
    day: labels.dayView,
    week: labels.weekView,
    month: labels.monthView,
  };

  return (
    <div
      data-slot="calendar-toolbar"
      className={cn(
        'flex flex-wrap items-center gap-2 border-border/70 border-b pb-2 text-left',
        className
      )}
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={onToday}
          className={cn(
            'inline-flex h-9 min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-border bg-background px-3 font-medium text-xs',
            'hover:bg-accent hover:text-accent-foreground'
          )}
        >
          {labels.today}
        </button>

        <div className="inline-flex items-center rounded-md border border-border/70">
          <button
            type="button"
            onClick={onPrev}
            aria-label={labels.previous}
            className={cn(
              'inline-flex size-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-l-md',
              'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label={labels.next}
            className={cn(
              'inline-flex size-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-r-md border-border border-l',
              'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground text-sm leading-tight @md/calendar:text-base">
            {title}
          </p>
        </div>
      </div>

      {showViewSwitcher && onViewChange && (
        <div className="inline-flex rounded-md border border-border/70">
          {VIEW_ORDER.map((v) => {
            const isActive = v === view;
            return (
              <button
                key={v}
                type="button"
                aria-pressed={isActive}
                onClick={() => onViewChange(v)}
                className={cn(
                  'inline-flex h-9 min-h-[44px] min-w-[44px] items-center justify-center px-3 font-medium text-xs',
                  'first:rounded-l-md last:rounded-r-md not-last:border-border not-last:border-r',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {viewLabel[v]}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
