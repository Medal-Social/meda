import type { ReactNode } from 'react';
import type { ResolvedWeekStartsOn } from './internal/date.js';
export type CalendarView = 'month' | 'week' | 'day';
export interface CalendarEvent {
    id: string;
    title: string;
    /** Event start time. */
    start: Date;
    /** Event end time. Optional; defaults to start + 1h when used. */
    end?: Date;
    /** Optional brand color, any CSS color string (hex, rgb, var()). */
    color?: string;
    /** Render as an all-day event (skips hour bucketing in week/day views). */
    allDay?: boolean;
    /** Consumer-defined extra payload — passed back via callbacks. */
    data?: unknown;
}
export interface CalendarLabels {
    today: string;
    previous: string;
    next: string;
    monthView: string;
    weekView: string;
    dayView: string;
    noEvents: string;
    /** Called as `moreCount(n)` to render "+N more" labels. */
    moreCount: (count: number) => string;
    /** Called as `eventCountLabel(n)` to render "N events" descriptions. */
    eventCountLabel: (count: number) => string;
    addEvent: string;
    viewDay: string;
    close: string;
}
export declare const DEFAULT_CALENDAR_LABELS: CalendarLabels;
export interface CalendarProps {
    view?: CalendarView;
    /** Currently focused date. */
    date: Date;
    events: CalendarEvent[];
    onDateChange?: (date: Date) => void;
    onViewChange?: (view: CalendarView) => void;
    onEventClick?: (event: CalendarEvent) => void;
    /** Fires when the user clicks a free time slot (week/day view) or a date cell (month view). */
    onSlotClick?: (slot: {
        start: Date;
        end: Date;
    }) => void;
    /** First day of the week. 0 = Sunday, 1 = Monday. Default 0. */
    weekStartsOn?: ResolvedWeekStartsOn;
    /** BCP-47 locale for header formatting. Default 'en-US'. */
    locale?: string;
    labels?: Partial<CalendarLabels>;
    className?: string;
    /** Optional custom event renderer. */
    renderEvent?: (event: CalendarEvent) => ReactNode;
}
export interface MonthViewProps {
    date: Date;
    events: CalendarEvent[];
    onEventClick?: (event: CalendarEvent) => void;
    onDateClick?: (date: Date) => void;
    onSlotClick?: (slot: {
        start: Date;
        end: Date;
    }) => void;
    weekStartsOn?: ResolvedWeekStartsOn;
    locale?: string;
    labels?: Partial<CalendarLabels>;
    className?: string;
    renderEvent?: (event: CalendarEvent) => ReactNode;
}
export interface WeekViewProps {
    date: Date;
    events: CalendarEvent[];
    onEventClick?: (event: CalendarEvent) => void;
    onSlotClick?: (slot: {
        start: Date;
        end: Date;
    }) => void;
    onDateClick?: (date: Date) => void;
    weekStartsOn?: ResolvedWeekStartsOn;
    locale?: string;
    labels?: Partial<CalendarLabels>;
    className?: string;
    renderEvent?: (event: CalendarEvent) => ReactNode;
}
export interface DayViewProps {
    date: Date;
    events: CalendarEvent[];
    onEventClick?: (event: CalendarEvent) => void;
    onSlotClick?: (slot: {
        start: Date;
        end: Date;
    }) => void;
    locale?: string;
    labels?: Partial<CalendarLabels>;
    className?: string;
    renderEvent?: (event: CalendarEvent) => ReactNode;
}
export interface CalendarToolbarProps {
    date: Date;
    view: CalendarView;
    onPrev: () => void;
    onNext: () => void;
    onToday: () => void;
    onViewChange?: (view: CalendarView) => void;
    /** Override the auto-formatted period title (e.g. "April 2026"). */
    periodLabel?: string;
    showViewSwitcher?: boolean;
    locale?: string;
    labels?: Partial<CalendarLabels>;
    className?: string;
}
