'use client';

import { useMemo, useState } from 'react';
import { cn } from '../lib/utils.js';
import { LaneRow } from './lane.js';
import {
  defaultLaneTimelineLabels,
  type LaneTimelineLabels,
  type LaneTimelineProps,
  type LaneTimelineRange,
  type TimeTick,
} from './lane-timeline-types.js';
import { TimeAxis } from './time-axis.js';

const LABEL_GUTTER_PX = 140;

const RANGE_MS: Record<LaneTimelineRange, number> = {
  '1h': 60 * 60_000,
  '6h': 6 * 60 * 60_000,
  '24h': 24 * 60 * 60_000,
  '7d': 7 * 24 * 60 * 60_000,
};

export function LaneTimeline({
  lanes,
  now,
  defaultRange = '6h',
  range: controlledRange,
  onRangeChange,
  selectedDate: controlledDate,
  onDateChange,
  title,
  groupChip,
  activeCount,
  legend,
  selectedBarId,
  onSelectBar,
  labels,
  className,
}: LaneTimelineProps) {
  const resolvedLabels: LaneTimelineLabels = { ...defaultLaneTimelineLabels, ...(labels ?? {}) };
  const [internalRange, setInternalRange] = useState<LaneTimelineRange>(defaultRange);
  const [internalDate, setInternalDate] = useState<Date>(() => now ?? new Date());
  const range = controlledRange ?? internalRange;
  const selectedDate = controlledDate ?? internalDate;
  const referenceNow = now ?? new Date();

  const { windowStart, windowEnd } = useMemo(() => {
    const rangeMs = RANGE_MS[range];
    const futurePadMs = Math.max(rangeMs / 6, 5 * 60_000);
    const isToday = selectedDate.toDateString() === referenceNow.toDateString();
    const end = isToday ? new Date(referenceNow.getTime() + futurePadMs) : endOfDay(selectedDate);
    // futurePadMs is only relevant for the "today" path (gives the now-line breathing room).
    // Historical days should render exactly rangeMs of window — no asymmetric pad.
    const start = new Date(end.getTime() - rangeMs - (isToday ? futurePadMs : 0));
    return { windowStart: start, windowEnd: end };
  }, [range, selectedDate, referenceNow]);

  const ticks = useMemo(
    () => buildTicks(windowStart, windowEnd, range),
    [windowStart, windowEnd, range]
  );

  const handleRange = (r: LaneTimelineRange) => {
    if (controlledRange === undefined) setInternalRange(r);
    onRangeChange?.(r);
  };
  const handleDate = (d: Date) => {
    if (controlledDate === undefined) setInternalDate(d);
    onDateChange?.(d);
  };

  const showNowLine =
    referenceNow.getTime() >= windowStart.getTime() &&
    referenceNow.getTime() <= windowEnd.getTime();
  const nowPositionPct = showNowLine
    ? ((referenceNow.getTime() - windowStart.getTime()) /
        (windowEnd.getTime() - windowStart.getTime())) *
      100
    : 0;

  return (
    <section className={cn('flex flex-col rounded-lg border border-border bg-card p-4', className)}>
      <TimeAxis
        range={range}
        onRangeChange={handleRange}
        selectedDate={selectedDate}
        onDateChange={handleDate}
        now={referenceNow}
        title={title}
        groupChip={groupChip}
        activeCount={activeCount}
        labels={resolvedLabels}
        ticks={ticks}
        labelGutterPx={LABEL_GUTTER_PX}
      />
      <div className="relative">
        {lanes.map((lane) => (
          <LaneRow
            key={lane.id}
            lane={lane}
            windowStart={windowStart}
            windowEnd={windowEnd}
            labelGutterPx={LABEL_GUTTER_PX}
            selectedBarId={selectedBarId}
            onSelectBar={onSelectBar}
          />
        ))}
        {showNowLine && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 bottom-0 w-px bg-primary"
            style={{
              left: `calc(${LABEL_GUTTER_PX}px + (100% - ${LABEL_GUTTER_PX}px) * ${nowPositionPct / 100})`,
            }}
          >
            <div className="-translate-x-1/2 -top-1 absolute size-2 rounded-full bg-primary" />
          </div>
        )}
      </div>
      {legend && legend.length > 0 && (
        <div className="mt-3 flex items-center gap-4 border-border/40 border-t pt-3 text-muted-foreground text-xs">
          <span className="uppercase tracking-wider">Legend</span>
          {legend.map((item) => (
            <span key={item.label} className="flex items-center gap-1.5">
              <span className={cn('inline-block size-2 rounded-sm', item.swatchClass)} />
              {item.label}
            </span>
          ))}
          {showNowLine && (
            <span className="ml-auto flex items-center gap-1.5">
              <span className="inline-block size-2 rounded-full bg-primary" />
              {resolvedLabels.now} · {formatTime(referenceNow)}
            </span>
          )}
        </div>
      )}
    </section>
  );
}

function endOfDay(d: Date): Date {
  const e = new Date(d);
  e.setHours(23, 59, 59, 999);
  return e;
}

function formatTime(d: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
}

function buildTicks(start: Date, end: Date, range: LaneTimelineRange): TimeTick[] {
  const span = end.getTime() - start.getTime();
  const tickCount = range === '7d' ? 7 : range === '24h' ? 8 : 7;
  const out: TimeTick[] = [];
  for (let i = 0; i <= tickCount; i++) {
    const t = new Date(start.getTime() + (span * i) / tickCount);
    out.push({ position: (i / tickCount) * 100, label: formatTickLabel(t, range) });
  }
  return out;
}

function formatTickLabel(d: Date, range: LaneTimelineRange): string {
  if (range === '7d') {
    return new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(d);
  }
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
}
