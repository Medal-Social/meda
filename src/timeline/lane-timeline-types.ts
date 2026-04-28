import type { ReactNode } from 'react';

export type LaneTimelineRange = '1h' | '6h' | '24h' | '7d';

export interface LaneBar {
  id: string;
  start: Date;
  end: Date;
  label: string;
  /** Tailwind class for the bar fill, e.g. 'bg-success-500/80'. */
  fillClass: string;
  /** Optional left-edge accent class, e.g. 'border-l-4 border-l-success-700'. */
  accentClass?: string;
}

export interface Lane {
  id: string;
  label: string;
  /** Optional secondary line under label (e.g. "3 sessions" or "offline"). */
  sublabel?: string;
  /** Tailwind class for the leading status dot (e.g. 'bg-success-500'). */
  statusDotClass?: string;
  bars: LaneBar[];
  /** Render lane label muted; bars still render. */
  muted?: boolean;
}

export interface LaneLegendItem {
  label: string;
  swatchClass: string;
}

export interface LaneTimelineLabels {
  previousDate: string;
  nextDate: string;
  now: string;
  /** "{n} active" — `{n}` replaced at render. */
  activeCount: string;
}

export const defaultLaneTimelineLabels: LaneTimelineLabels = {
  previousDate: 'Previous day',
  nextDate: 'Next day',
  now: 'now',
  activeCount: '{n} active',
};

export interface TimeTick {
  /** Display label, e.g. "09:00". */
  label: string;
  /** Position as percentage 0–100 along the time axis. */
  position: number;
}

export interface LaneTimelineProps {
  lanes: Lane[];
  /** Reference time for now-line + window end. Defaults to `new Date()`. */
  now?: Date;
  defaultRange?: LaneTimelineRange;
  range?: LaneTimelineRange;
  onRangeChange?: (range: LaneTimelineRange) => void;
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
  title?: ReactNode;
  /** Render-prop slot for a "Group: …" chip in the header. */
  groupChip?: ReactNode;
  /** Number of currently-active bars; powers the "● {n} active" indicator. */
  activeCount?: number;
  legend?: LaneLegendItem[];
  selectedBarId?: string;
  onSelectBar?: (bar: LaneBar, lane: Lane) => void;
  labels?: Partial<LaneTimelineLabels>;
  className?: string;
}
