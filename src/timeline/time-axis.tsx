'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../lib/utils.js';
import type { LaneTimelineLabels, LaneTimelineRange, TimeTick } from './lane-timeline-types.js';

const RANGES: LaneTimelineRange[] = ['1h', '6h', '24h', '7d'];

export interface TimeAxisProps {
  range: LaneTimelineRange;
  onRangeChange: (range: LaneTimelineRange) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  title?: ReactNode;
  groupChip?: ReactNode;
  activeCount?: number;
  labels: LaneTimelineLabels;
  ticks: TimeTick[];
  /** Width of the lane-label gutter on the left, in px (matches Lane component). */
  labelGutterPx: number;
}

export function TimeAxis({
  range,
  onRangeChange,
  selectedDate,
  onDateChange,
  title,
  groupChip,
  activeCount,
  labels,
  ticks,
  labelGutterPx,
}: TimeAxisProps) {
  const stepDate = (delta: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + delta);
    onDateChange(next);
  };

  return (
    <div className="flex flex-col gap-3 border-border border-b pb-3">
      <div className="flex items-center gap-3">
        {title && <div className="font-medium text-sm">{title}</div>}
        <div
          role="tablist"
          aria-label="Time range"
          className="flex items-center gap-1 rounded-md bg-muted p-0.5"
        >
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              role="tab"
              aria-selected={r === range}
              onClick={() => onRangeChange(r)}
              data-active={r === range || undefined}
              className={cn(
                'rounded px-2 py-0.5 text-xs',
                'data-[active]:bg-background data-[active]:text-foreground',
                r !== range && 'text-muted-foreground hover:text-foreground'
              )}
            >
              {r}
            </button>
          ))}
        </div>
        {groupChip && <div className="text-muted-foreground text-xs">{groupChip}</div>}
        {typeof activeCount === 'number' && (
          <div className="text-muted-foreground text-xs">
            <span className="mr-1 inline-block size-1.5 rounded-full bg-success-500" />
            {labels.activeCount.replace('{n}', String(activeCount))}
          </div>
        )}
        <div className="ml-auto flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-xs">
          <button
            type="button"
            aria-label={labels.previousDate}
            onClick={() => stepDate(-1)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <div className="px-1">{formatDateHeader(selectedDate)}</div>
          <button
            type="button"
            aria-label={labels.nextDate}
            onClick={() => stepDate(1)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>
      <div
        className="grid items-end gap-0"
        style={{ gridTemplateColumns: `${labelGutterPx}px 1fr` }}
      >
        <div />
        <div className="relative h-5">
          {ticks.map((t) => (
            <div
              key={`${t.position}:${t.label}`}
              className="-translate-x-1/2 absolute top-0 text-muted-foreground text-xs"
              style={{ left: `${t.position}%` }}
            >
              {t.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatDateHeader(d: Date): string {
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  const fmt = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(d);
  return isToday ? `Today · ${fmt}` : fmt;
}
