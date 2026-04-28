import type { ReactNode } from 'react';
import type { LaneTimelineLabels, LaneTimelineRange, TimeTick } from './lane-timeline-types.js';
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
export declare function TimeAxis({ range, onRangeChange, selectedDate, onDateChange, title, groupChip, activeCount, labels, ticks, labelGutterPx, }: TimeAxisProps): import("react/jsx-runtime").JSX.Element;
