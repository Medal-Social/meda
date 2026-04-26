import type { ReactNode } from 'react';
/** What kind of timeline entry this is. */
export type TimelineEventKind = 'session' | 'sub-event' | 'scheduled' | 'error';
/**
 * Generic timeline entry. Apps map their domain (a phone call, a chat session, a workflow run)
 * onto this shape and pass an array to <TimelineRail/>.
 */
export interface TimelineEvent {
    /** Stable identifier across re-renders. */
    id: string;
    /** Unix ms — when the event began. */
    startedAt: number;
    /** Unix ms — when the event ended. Omit for live or instantaneous events. */
    endedAt?: number;
    /** Coarse category — drives default styling. */
    kind: TimelineEventKind;
    /** Optional narrower tag for app-specific styling, e.g. "tool-call", "barge-in". */
    variant?: string;
    /** Card primary line content (typically a name). */
    primary?: ReactNode;
    /** Card secondary line content (typically meta — counts, cost). */
    secondary?: ReactNode;
    /** Highlight as currently selected. */
    selected?: boolean;
    /** Render with the live treatment (green pulse, etc). */
    isLive?: boolean;
    /**
     * Optional override for the tape segment color expressed as a CSS color value.
     * Defaults derived from kind + isLive + variant.
     */
    fillColor?: string;
}
/** Marks rendered along the per-conversation <ScrubBar/>. */
export interface ScrubMark {
    id: string;
    /** Position along the bar, 0..100. */
    positionPct: number;
    kind: 'turn' | 'tool' | 'barge' | 'error';
    label?: string;
}
