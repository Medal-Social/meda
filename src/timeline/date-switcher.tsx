import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

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

function addDays(d: Date, delta: number): Date {
  // Use calendar arithmetic, not fixed-ms offsets, so DST 23h/25h days
  // don't bump the result to the wrong calendar date.
  const c = new Date(d);
  c.setDate(c.getDate() + delta);
  return c;
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
  const goPrev = () => onChange(addDays(value, -1));
  const goNext = () => onChange(addDays(value, 1));

  return (
    <div className={['flex items-center gap-2', className ?? ''].join(' ')}>
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
          <span className="ml-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-500">
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
