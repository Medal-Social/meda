'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo } from 'react';
import { cn } from '../../lib/utils.js';
import { isPast, isToday, setHours } from './date.js';
import { EventPill } from './event-pill.js';
function TimeSlotBase({ date, hour, events, onSlotClick, onEventClick, renderEvent, variant = 'week', }) {
    const slotStart = setHours(date, hour);
    const slotEnd = setHours(date, hour + 1);
    const isPastSlot = isPast(slotStart) || (isToday(date) && hour < new Date().getHours());
    const isTodayDate = isToday(date);
    const isCurrentHour = isTodayDate && hour === new Date().getHours();
    const isInteractive = typeof onSlotClick === 'function';
    return (_jsxs("div", { "data-slot": "calendar-time-slot", "data-current-hour": isCurrentHour ? 'true' : undefined, onClick: isInteractive
            ? (event) => {
                const target = event.target;
                if (target.closest('[data-calendar-item="true"]'))
                    return;
                onSlotClick({ start: slotStart, end: slotEnd });
            }
            : undefined, className: cn('group relative border-border border-b p-1 transition-colors', variant === 'week' ? 'min-h-[44px] border-r last:border-r-0' : 'min-h-[60px]', isPastSlot ? 'bg-muted/20' : 'bg-background', isCurrentHour && 'bg-primary/5', !isPastSlot && 'hover:bg-accent/30', isInteractive && 'cursor-pointer'), children: [isCurrentHour && (_jsx("div", { className: "pointer-events-none absolute top-1/2 right-0 left-0 z-10 -translate-y-1/2", children: _jsx("div", { className: "relative h-0.5 bg-primary", children: _jsx("div", { className: "absolute -top-1 -left-1 size-2.5 rounded-full bg-primary" }) }) })), _jsx("div", { className: "flex flex-col gap-1", children: events.map((event) => (_jsx("div", { children: renderEvent ? renderEvent(event) : _jsx(EventPill, { event: event, onClick: onEventClick }) }, event.id))) })] }));
}
export const TimeSlot = memo(TimeSlotBase);
