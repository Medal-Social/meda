import type { TimelineEvent } from './types.js';
export interface TimelineTapeProps {
    /** "Now" reference; canvas top represents `now + futurePadSec`. */
    now: Date;
    /** Event list. Order doesn't matter — placement uses startedAt. */
    events: TimelineEvent[];
    /** px per second of vertical scroll. Default 1.2 = 72 px/min. */
    pxPerSec?: number;
    /** Seconds of "future" rendered above NOW. Default 300 (5 min). */
    futurePadSec?: number;
    /** Total seconds visible past NOW (governs canvas height). Default 6h. */
    pastSpanSec?: number;
    /** Timezone for tick labels (caller's local tz by default). */
    tz?: string;
    /** Selection callback. */
    onSelect?: (event: TimelineEvent) => void;
    className?: string;
}
export declare function TimelineTape({ now, events, pxPerSec, futurePadSec, pastSpanSec, tz, onSelect, className, }: TimelineTapeProps): import("react/jsx-runtime").JSX.Element;
