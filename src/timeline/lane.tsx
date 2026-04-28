'use client';

import { cn } from '../lib/utils.js';
import type { Lane, LaneBar } from './lane-timeline-types.js';

export interface LaneRowProps {
  lane: Lane;
  windowStart: Date;
  windowEnd: Date;
  labelGutterPx: number;
  selectedBarId?: string;
  onSelectBar?: (bar: LaneBar, lane: Lane) => void;
}

export function LaneRow({
  lane,
  windowStart,
  windowEnd,
  labelGutterPx,
  selectedBarId,
  onSelectBar,
}: LaneRowProps) {
  return (
    <div
      className="grid items-center gap-0 border-border/40 border-b py-3"
      style={{ gridTemplateColumns: `${labelGutterPx}px 1fr` }}
    >
      <div className={cn('flex flex-col gap-0.5 pr-3', lane.muted && 'opacity-50')}>
        <div className="flex items-center gap-2 text-sm">
          {lane.statusDotClass && (
            <span className={cn('inline-block size-2 rounded-full', lane.statusDotClass)} />
          )}
          <span className="font-medium">{lane.label}</span>
        </div>
        {lane.sublabel && <div className="text-muted-foreground text-xs">{lane.sublabel}</div>}
      </div>
      <div className="relative h-7">
        {lane.bars.map((bar) => {
          const placement = placeBar(bar, windowStart, windowEnd);
          if (!placement) return null;
          const selected = selectedBarId === bar.id;
          return (
            <button
              key={bar.id}
              type="button"
              onClick={() => onSelectBar?.(bar, lane)}
              data-selected={selected || undefined}
              className={cn(
                'absolute top-0 flex h-full items-center overflow-hidden rounded-md px-2 text-left text-xs',
                bar.fillClass,
                bar.accentClass,
                'data-[selected]:ring-2 data-[selected]:ring-primary data-[selected]:ring-offset-1 data-[selected]:ring-offset-background',
                'hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              )}
              style={{ left: `${placement.left}%`, width: `${placement.width}%` }}
              aria-label={`${lane.label} — ${bar.label}`}
            >
              <span className="truncate">{bar.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface BarPlacement {
  left: number;
  width: number;
}

function placeBar(bar: LaneBar, windowStart: Date, windowEnd: Date): BarPlacement | null {
  const ws = windowStart.getTime();
  const we = windowEnd.getTime();
  const span = we - ws;
  if (span <= 0) return null;
  const bs = bar.start.getTime();
  const be = bar.end.getTime();
  // Bar entirely outside the window — skip.
  if (be < ws || bs > we) return null;
  const clampedStart = Math.max(bs, ws);
  const clampedEnd = Math.min(be, we);
  const left = ((clampedStart - ws) / span) * 100;
  const width = Math.max(((clampedEnd - clampedStart) / span) * 100, 0.5);
  return { left, width };
}
