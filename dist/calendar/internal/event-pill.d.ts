import type { CalendarEvent } from '../types.js';
interface EventPillProps {
    event: CalendarEvent;
    onClick?: (event: CalendarEvent) => void;
    variant?: 'compact' | 'full';
    className?: string;
}
/**
 * Default compact event pill used inside calendar cells/slots when the
 * consumer does not pass a custom `renderEvent` callback.
 */
export declare function EventPill({ event, onClick, variant, className }: EventPillProps): import("react/jsx-runtime").JSX.Element;
export {};
