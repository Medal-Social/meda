import { type ReactNode } from 'react';
import type { CalendarEvent } from '../types.js';
interface TimeSlotProps {
    date: Date;
    hour: number;
    events: CalendarEvent[];
    onSlotClick?: (slot: {
        start: Date;
        end: Date;
    }) => void;
    onEventClick?: (event: CalendarEvent) => void;
    renderEvent?: (event: CalendarEvent) => ReactNode;
    variant?: 'week' | 'day';
}
declare function TimeSlotBase({ date, hour, events, onSlotClick, onEventClick, renderEvent, variant, }: TimeSlotProps): import("react/jsx-runtime").JSX.Element;
export declare const TimeSlot: import("react").MemoExoticComponent<typeof TimeSlotBase>;
export {};
