'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { cn } from '../lib/utils.js';
import { formatDate, formatHour, getDateKey, getHoursOfDay, isToday } from './internal/date.js';
import { TimeSlot } from './internal/time-slot.js';
import { DEFAULT_CALENDAR_LABELS } from './types.js';
export function DayView({ date, events, onEventClick, onSlotClick, locale = 'en-US', labels: labelOverrides, className, renderEvent, }) {
    const labels = { ...DEFAULT_CALENDAR_LABELS, ...labelOverrides };
    const hours = useMemo(() => getHoursOfDay(), []);
    const isTodayDate = isToday(date);
    const eventsByHour = useMemo(() => {
        const map = new Map();
        const dateKey = getDateKey(date);
        for (const event of events) {
            if (event.allDay)
                continue;
            if (getDateKey(event.start) !== dateKey)
                continue;
            const hour = event.start.getHours();
            const existing = map.get(hour) ?? [];
            existing.push(event);
            map.set(hour, existing);
        }
        for (const [hour, items] of map.entries()) {
            items.sort((a, b) => a.start.getTime() - b.start.getTime());
            map.set(hour, items);
        }
        return map;
    }, [events, date]);
    const totalEvents = useMemo(() => {
        let count = 0;
        for (const list of eventsByHour.values())
            count += list.length;
        return count;
    }, [eventsByHour]);
    return (_jsxs("section", { "data-slot": "calendar-day-view", "aria-label": labels.dayView, className: cn('@container/calendar overflow-hidden rounded-lg border border-border bg-background', className), children: [_jsx("div", { className: cn('border-border border-b bg-muted/50 px-4 py-3', isTodayDate && 'bg-primary/5'), children: _jsxs("div", { className: "flex items-center justify-between gap-2", children: [_jsxs("div", { children: [_jsx("h3", { className: cn('font-semibold text-lg', isTodayDate ? 'text-primary' : 'text-foreground'), children: formatDate(date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }, locale) }), isTodayDate && (_jsx("span", { className: "font-medium text-primary text-xs", children: labels.today }))] }), _jsx("div", { className: "text-muted-foreground text-sm", children: labels.eventCountLabel(totalEvents) })] }) }), _jsx("div", { 
                // biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable region needs keyboard focus per WCAG (axe scrollable-region-focusable)
                tabIndex: 0, className: "max-h-[36rem] overflow-y-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-primary", children: hours.map((hour) => (_jsxs("div", { className: "grid grid-cols-[80px_1fr]", children: [_jsx("div", { className: "border-border border-r border-b px-3 py-3 text-right text-muted-foreground text-xs", children: formatHour(hour, locale) }), _jsx(TimeSlot, { date: date, hour: hour, events: eventsByHour.get(hour) ?? [], onSlotClick: onSlotClick, onEventClick: onEventClick, renderEvent: renderEvent, variant: "day" })] }, `row-${hour}`))) })] }));
}
