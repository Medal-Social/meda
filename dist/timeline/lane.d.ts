import type { Lane, LaneBar } from './lane-timeline-types.js';
export interface LaneRowProps {
    lane: Lane;
    windowStart: Date;
    windowEnd: Date;
    labelGutterPx: number;
    selectedBarId?: string;
    onSelectBar?: (bar: LaneBar, lane: Lane) => void;
}
export declare function LaneRow({ lane, windowStart, windowEnd, labelGutterPx, selectedBarId, onSelectBar, }: LaneRowProps): import("react/jsx-runtime").JSX.Element;
