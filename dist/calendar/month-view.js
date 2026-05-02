'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { cn } from '../lib/utils.js';
import { addDays, formatDayOfWeek, getDateKey, getMonthCalendarDays, startOfWeek, } from './internal/date.js';
import { DayCell } from './internal/day-cell.js';
import { DEFAULT_CALENDAR_LABELS } from './types.js';
export function MonthView({ date, events, onEventClick, onDateClick, onSlotClick, weekStartsOn = 0, locale = 'en-US', labels: labelOverrides, className, renderEvent, }) {
    const labels = { ...DEFAULT_CALENDAR_LABELS, ...labelOverrides };
    const calendarDays = useMemo(() => getMonthCalendarDays(date, weekStartsOn), [date, weekStartsOn]);
    const eventsByDate = useMemo(() => {
        const map = new Map();
        for (const event of events) {
            const key = getDateKey(event.start);
            const existing = map.get(key) ?? [];
            existing.push(event);
            map.set(key, existing);
        }
        for (const [key, dayEvents] of map.entries()) {
            dayEvents.sort((a, b) => a.start.getTime() - b.start.getTime());
            map.set(key, dayEvents);
        }
        return map;
    }, [events]);
    const weekDays = useMemo(() => {
        const baseDate = startOfWeek(new Date(2024, 0, 7), weekStartsOn);
        return Array.from({ length: 7 }, (_, i) => formatDayOfWeek(addDays(baseDate, i), locale, 'short'));
    }, [locale, weekStartsOn]);
    const cellClick = onDateClick
        ? (d) => onDateClick(d)
        : onSlotClick
            ? (d) => {
                const start = new Date(d);
                start.setHours(0, 0, 0, 0);
                const end = new Date(d);
                end.setHours(23, 59, 59, 999);
                onSlotClick({ start, end });
            }
            : undefined;
    return (_jsxs("div", { "data-slot": "calendar-month-view", className: cn('@container/calendar overflow-hidden rounded-md border border-border bg-background', className), children: [_jsx("div", { className: "grid grid-cols-7 border-border border-b bg-muted/40", children: weekDays.map((day) => (_jsx("div", { className: "border-border border-r px-1 py-1.5 text-center font-medium text-muted-foreground text-[11px] uppercase tracking-wide last:border-r-0", children: day }, `header-${day}`))) }), _jsx("div", { className: "grid grid-cols-7", children: calendarDays.map((d) => (_jsx(DayCell, { date: d, currentMonth: date, events: eventsByDate.get(getDateKey(d)) ?? [], onCellClick: cellClick, onEventClick: onEventClick, onMoreClick: onDateClick, labels: labels, renderEvent: renderEvent }, `day-${getDateKey(d)}`))) })] }));
}
