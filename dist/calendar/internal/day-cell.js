'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo } from 'react';
import { cn } from '../../lib/utils.js';
import { isPast, isSameMonth, isToday } from './date.js';
import { EventPill } from './event-pill.js';
const MAX_VISIBLE_ITEMS = 3;
function DayCellBase({ date, currentMonth, events, onCellClick, onEventClick, onMoreClick, labels, renderEvent, }) {
    const isCurrentMonth = isSameMonth(date, currentMonth);
    const isTodayDate = isToday(date);
    const isPastDate = isPast(date);
    const dayNumber = date.getDate();
    const visibleEvents = events.slice(0, MAX_VISIBLE_ITEMS);
    const hiddenCount = events.length - MAX_VISIBLE_ITEMS;
    const isCellInteractive = typeof onCellClick === 'function';
    return (_jsxs("div", { "data-slot": "calendar-day-cell", "data-today": isTodayDate ? 'true' : undefined, onClick: isCellInteractive
            ? (event) => {
                const target = event.target;
                if (target.closest('[data-calendar-item="true"]'))
                    return;
                onCellClick(date);
            }
            : undefined, className: cn('group relative flex min-h-[5.5rem] flex-col gap-1 border-border border-r border-b p-1.5 transition-colors', '@md/calendar:min-h-[6.75rem]', isCurrentMonth ? 'bg-background' : 'bg-muted/30', isPastDate && isCurrentMonth && 'bg-muted/20', isTodayDate && 'border-primary/30 bg-primary/5', 'hover:bg-accent/30', isCellInteractive && 'cursor-pointer'), children: [_jsx("div", { className: "flex items-center justify-between", children: _jsx("span", { className: cn('inline-flex size-6 items-center justify-center rounded-full font-medium text-xs', isTodayDate
                        ? 'border border-primary/40 bg-primary/15 text-primary'
                        : isCurrentMonth
                            ? 'text-foreground'
                            : 'text-muted-foreground'), children: dayNumber }) }), _jsxs("div", { className: "flex flex-col gap-0.5", children: [visibleEvents.map((event) => (_jsx("div", { children: renderEvent ? renderEvent(event) : _jsx(EventPill, { event: event, onClick: onEventClick }) }, event.id))), hiddenCount > 0 && (_jsx("button", { type: "button", onClick: (event) => {
                            event.stopPropagation();
                            onMoreClick?.(date, event.currentTarget);
                        }, className: cn('min-h-[24px] w-full rounded px-1 py-0.5 text-left font-medium text-[11px]', 'text-primary transition-colors hover:bg-primary/10'), children: labels.moreCount(hiddenCount) }))] })] }));
}
export const DayCell = memo(DayCellBase);
