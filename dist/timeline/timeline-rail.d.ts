import type { TimelineEvent } from './types.js';
export interface TimelineRailProps {
    date: Date;
    now: Date;
    events: TimelineEvent[];
    /** px per second. Default 1.2 (72 px/min). */
    zoom?: number;
    /** When true (default), tape auto-scrolls to keep LIVE pinned. */
    followLive?: boolean;
    tz?: string;
    onZoomChange?: (px: number) => void;
    onDateChange?: (next: Date) => void;
    onSelect?: (event: TimelineEvent) => void;
    onFollowChange?: (following: boolean) => void;
    /** Click target on the "Manage retention" footer. */
    onManageRetention?: () => void;
    className?: string;
}
export declare function TimelineRail({ date, now, events, zoom, followLive, tz, onZoomChange, onDateChange, onSelect, onFollowChange, onManageRetention, className, }: TimelineRailProps): import("react/jsx-runtime").JSX.Element;
