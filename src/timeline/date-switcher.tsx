import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

export interface DateSwitcherProps {
  /** Currently selected date. */
  value: Date;
  /** Reference for "today" comparison and forward-disable. */
  now: Date;
  onChange: (next: Date) => void;
  className?: string;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(d: Date): number {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c.getTime();
}

function isSameDay(a: Date, b: Date): boolean {
  return startOfDay(a) === startOfDay(b);
}

function fmtDate(d: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export function DateSwitcher({ value, now, onChange, className }: DateSwitcherProps) {
  const isToday = isSameDay(value, now);
  const goPrev = () => onChange(new Date(value.getTime() - ONE_DAY_MS));
  const goNext = () => onChange(new Date(value.getTime() + ONE_DAY_MS));

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
        <span className="font-medium">{fmtDate(value)}</span>
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
