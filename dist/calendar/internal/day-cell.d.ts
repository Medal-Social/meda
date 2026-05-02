import { type ReactNode } from 'react';
import type { CalendarEvent, CalendarLabels } from '../types.js';
interface DayCellProps {
    date: Date;
    currentMonth: Date;
    events: CalendarEvent[];
    onCellClick?: (date: Date) => void;
    onEventClick?: (event: CalendarEvent) => void;
    onMoreClick?: (date: Date, anchorEl?: HTMLElement) => void;
    labels: CalendarLabels;
    renderEvent?: (event: CalendarEvent) => ReactNode;
}
declare function DayCellBase({ date, currentMonth, events, onCellClick, onEventClick, onMoreClick, labels, renderEvent, }: DayCellProps): import("react/jsx-runtime").JSX.Element;
export declare const DayCell: import("react").MemoExoticComponent<typeof DayCellBase>;
export {};
