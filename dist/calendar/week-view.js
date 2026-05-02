'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { cn } from '../lib/utils.js';
import { formatDayOfWeek, formatHour, getDateKey, getHoursOfDay, getWeekDays, isToday, } from './internal/date.js';
import { TimeSlot } from './internal/time-slot.js';
import { DEFAULT_CALENDAR_LABELS } from './types.js';
export function WeekView({ date, events, onEventClick, onSlotClick, onDateClick, weekStartsOn = 0, locale = 'en-US', labels: labelOverrides, className, renderEvent, }) {
    const labels = { ...DEFAULT_CALENDAR_LABELS, ...labelOverrides };
    const weekDays = useMemo(() => getWeekDays(date, weekStartsOn), [date, weekStartsOn]);
    const hours = useMemo(() => getHoursOfDay(), []);
    const eventsByDateHour = useMemo(() => {
        const map = new Map();
        for (const event of events) {
            if (event.allDay)
                continue;
            const dateKey = getDateKey(event.start);
            const hour = event.start.getHours();
            const key = `${dateKey}-${hour}`;
            const existing = map.get(key) ?? [];
            existing.push(event);
            map.set(key, existing);
        }
        for (const [key, slot] of map.entries()) {
            slot.sort((a, b) => a.start.getTime() - b.start.getTime());
            map.set(key, slot);
        }
        return map;
    }, [events]);
    return (_jsxs("section", { "data-slot": "calendar-week-view", "aria-label": labels.weekView, className: cn('@container/calendar overflow-hidden rounded-lg border border-border bg-background', className), children: [_jsxs("div", { className: "sticky top-0 z-10 grid grid-cols-[64px_repeat(7,minmax(0,1fr))] border-border border-b bg-muted/50", children: [_jsx("div", { className: "border-border border-r px-2 py-3" }), weekDays.map((d) => {
                        const isTodayDate = isToday(d);
                        const isInteractive = typeof onDateClick === 'function';
                        const dayLabel = formatDayOfWeek(d, locale, 'short');
                        const node = (_jsxs(_Fragment, { children: [_jsx("div", { className: "font-medium text-muted-foreground text-[11px]", children: dayLabel }), _jsx("div", { className: cn('mt-0.5 font-semibold text-base', isTodayDate ? 'text-primary' : 'text-foreground'), children: d.getDate() })] }));
                        return isInteractive ? (_jsx("button", { type: "button", onClick: () => onDateClick?.(d), className: cn('min-h-[44px] border-border border-r px-2 py-3 text-center transition-colors last:border-r-0', 'hover:bg-accent/50', isTodayDate && 'bg-primary/5'), children: node }, `header-${getDateKey(d)}`)) : (_jsx("div", { className: cn('min-h-[44px] border-border border-r px-2 py-3 text-center last:border-r-0', isTodayDate && 'bg-primary/5'), children: node }, `header-${getDateKey(d)}`));
                    })] }), _jsx("div", { 
                // biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable region needs keyboard focus per WCAG (axe scrollable-region-focusable)
                tabIndex: 0, className: "max-h-[36rem] overflow-y-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-primary", children: hours.map((hour) => (_jsxs("div", { className: "grid grid-cols-[64px_repeat(7,minmax(0,1fr))]", children: [_jsx("div", { className: "border-border border-r border-b px-2 py-2 text-right text-muted-foreground text-[11px]", children: formatHour(hour, locale) }), weekDays.map((d) => (_jsx(TimeSlot, { date: d, hour: hour, events: eventsByDateHour.get(`${getDateKey(d)}-${hour}`) ?? [], onSlotClick: onSlotClick, onEventClick: onEventClick, renderEvent: renderEvent, variant: "week" }, `slot-${getDateKey(d)}-${hour}`)))] }, `row-${hour}`))) })] }));
}
