import type { TimelineEvent } from './types.js';
export type EventCardSize = 'default' | 'tiny';
export interface EventCardProps {
    event: TimelineEvent;
    size?: EventCardSize;
    onSelect?: (event: TimelineEvent) => void;
    className?: string;
}
export declare function EventCard({ event, size, onSelect, className }: EventCardProps): import("react/jsx-runtime").JSX.Element;
