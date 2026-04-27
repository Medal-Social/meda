'use client';

import { formatClock } from '../lib/format-time.js';
import { cn } from '../lib/utils.js';

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
      className={cn('relative h-0 pointer-events-none', className)}
    >
      {/* bg-success-700 (vs. -600) so white 11px bold clears WCAG AA. */}
      <span className="pointer-events-auto absolute left-0 top-0 inline-flex items-center rounded-md bg-success-700 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-[0_6px_18px_rgba(16,185,129,0.35)]">
        LIVE
      </span>
      <span
        aria-hidden="true"
        className="absolute right-0 top-1/2 left-[60px] h-px bg-gradient-to-r from-success via-success/30 to-transparent"
      />
      {/* success-700 (vs. success/600) so the 10px clock label clears
          WCAG AA on the white card. */}
      <span className="absolute right-1.5 top-[-2px] text-[10px] font-semibold tabular-nums text-success-700">
        {formatClock(now, { tz })}
      </span>
    </div>
  );
}
