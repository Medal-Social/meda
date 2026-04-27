'use client';

import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils.js';

export interface DateSwitcherProps {
  /** Currently selected date. */
  value: Date;
  /** Reference for "today" comparison and forward-disable. */
  now: Date;
  /** IANA timezone for "same day" / display semantics. Defaults to local. */
  tz?: string;
  onChange: (next: Date) => void;
  className?: string;
}

// "YYYY-MM-DD" in the given tz (or local if undefined). Comparing these
// strings is a robust same-day check that doesn't depend on local-time math.
function ymdInTz(d: Date, tz?: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: tz,
  }).format(d);
}

function isSameDay(a: Date, b: Date, tz?: string): boolean {
  return ymdInTz(a, tz) === ymdInTz(b, tz);
}

// Returns the tz offset (in minutes) for `date` in `tz`. Positive = east of
// UTC, e.g. Europe/Stockholm CET → +60. Tolerates "GMT", "GMT+05", and
// "GMT+05:30" formats from Intl.DateTimeFormat.
function tzOffsetMinutes(date: Date, tz: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    timeZoneName: 'longOffset',
  }).formatToParts(date);
  const name = parts.find((p) => p.type === 'timeZoneName')?.value ?? 'GMT';
  const m = /GMT(?:([+-])(\d{1,2})(?::?(\d{2}))?)?/.exec(name);
  if (!m?.[1]) return 0;
  const sign = m[1] === '+' ? 1 : -1;
  const hours = Number.parseInt(m[2] ?? '0', 10);
  const mins = Number.parseInt(m[3] ?? '0', 10);
  return sign * (hours * 60 + mins);
}

function addDays(d: Date, delta: number, tz?: string): Date {
  if (!tz) {
    // No tz: step the calendar day in the browser's local timezone (DST-safe
    // there because setDate honors local DST transitions).
    const c = new Date(d);
    c.setDate(c.getDate() + delta);
    return c;
  }
  // tz-aware: advance 24h, then correct for any DST shift between the
  // original day and the target day so the *wall clock* in `tz` lands on the
  // same hour:minute on the next/previous calendar day.
  const offsetBefore = tzOffsetMinutes(d, tz);
  const candidate = new Date(d.getTime() + delta * 86_400_000);
  const offsetAfter = tzOffsetMinutes(candidate, tz);
  return new Date(candidate.getTime() + (offsetBefore - offsetAfter) * 60_000);
}

function fmtDate(d: Date, tz?: string): string {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: tz,
  }).format(d);
}

export function DateSwitcher({ value, now, tz, onChange, className }: DateSwitcherProps) {
  const isToday = isSameDay(value, now, tz);
  const goPrev = () => onChange(addDays(value, -1, tz));
  const goNext = () => onChange(addDays(value, 1, tz));

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <button
        type="button"
        aria-label="Previous day"
        onClick={goPrev}
        className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
      </button>

      <div className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm">
        <Calendar className="size-3.5 text-muted-foreground" />
        <span className="font-medium">{fmtDate(value, tz)}</span>
        {isToday && (
          <span className="ml-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-success">
            today
          </span>
        )}
      </div>

      <button
        type="button"
        aria-label="Next day"
        disabled={isToday}
        onClick={goNext}
        className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
