import { formatClock } from '../lib/format-time.js';

export interface LiveIndicatorProps {
  now: Date;
  /** Optional IANA timezone for the displayed clock. */
  tz?: string;
  className?: string;
}

export function LiveIndicator({ now, tz, className }: LiveIndicatorProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={['relative h-0 pointer-events-none', className ?? ''].join(' ')}
    >
      <span className="pointer-events-auto absolute left-0 top-0 inline-flex items-center rounded-md bg-emerald-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-[0_6px_18px_rgba(16,185,129,0.35)]">
        LIVE
      </span>
      <span
        aria-hidden="true"
        className="absolute right-0 top-1/2 left-[60px] h-px bg-gradient-to-r from-emerald-500 via-emerald-500/30 to-transparent"
      />
      <span className="absolute right-1.5 top-[-2px] text-[10px] font-semibold tabular-nums text-emerald-500">
        {formatClock(now, { tz })}
      </span>
    </div>
  );
}
