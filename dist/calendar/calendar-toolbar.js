'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils.js';
import { formatMonthYear } from './internal/date.js';
import { DEFAULT_CALENDAR_LABELS } from './types.js';
const VIEW_ORDER = ['day', 'week', 'month'];
export function CalendarToolbar({ date, view, onPrev, onNext, onToday, onViewChange, periodLabel, showViewSwitcher = true, locale = 'en-US', labels: labelOverrides, className, }) {
    const labels = { ...DEFAULT_CALENDAR_LABELS, ...labelOverrides };
    const title = periodLabel ?? formatMonthYear(date, locale);
    const viewLabel = {
        day: labels.dayView,
        week: labels.weekView,
        month: labels.monthView,
    };
    return (_jsxs("div", { "data-slot": "calendar-toolbar", className: cn('flex flex-wrap items-center gap-2 border-border/70 border-b pb-2 text-left', className), children: [_jsxs("div", { className: "flex min-w-0 flex-1 flex-wrap items-center gap-1.5", children: [_jsx("button", { type: "button", onClick: onToday, className: cn('inline-flex h-9 min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-border bg-background px-3 font-medium text-xs', 'hover:bg-accent hover:text-accent-foreground'), children: labels.today }), _jsxs("div", { className: "inline-flex items-center rounded-md border border-border/70", children: [_jsx("button", { type: "button", onClick: onPrev, "aria-label": labels.previous, className: cn('inline-flex size-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-l-md', 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'), children: _jsx(ChevronLeft, { className: "size-4" }) }), _jsx("button", { type: "button", onClick: onNext, "aria-label": labels.next, className: cn('inline-flex size-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-r-md border-border border-l', 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'), children: _jsx(ChevronRight, { className: "size-4" }) })] }), _jsx("div", { className: "min-w-0", children: _jsx("p", { className: "truncate font-semibold text-foreground text-sm leading-tight @md/calendar:text-base", children: title }) })] }), showViewSwitcher && onViewChange && (_jsx("div", { className: "inline-flex rounded-md border border-border/70", children: VIEW_ORDER.map((v) => {
                    const isActive = v === view;
                    return (_jsx("button", { type: "button", "aria-pressed": isActive, onClick: () => onViewChange(v), className: cn('inline-flex h-9 min-h-[44px] min-w-[44px] items-center justify-center px-3 font-medium text-xs', 'first:rounded-l-md last:rounded-r-md not-last:border-border not-last:border-r', isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'), children: viewLabel[v] }, v));
                }) }))] }));
}
