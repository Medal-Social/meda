'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils.js';
const RANGES = ['1h', '6h', '24h', '7d'];
export function TimeAxis({ range, onRangeChange, selectedDate, onDateChange, now, title, groupChip, activeCount, labels, ticks, labelGutterPx, }) {
    const stepDate = (delta) => {
        const next = new Date(selectedDate);
        next.setDate(next.getDate() + delta);
        onDateChange(next);
    };
    return (_jsxs("div", { className: "flex flex-col gap-3 border-border border-b pb-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [title && _jsx("div", { className: "font-medium text-sm", children: title }), _jsx("div", { role: "tablist", "aria-label": "Time range", className: "flex items-center gap-1 rounded-md bg-muted p-0.5", children: RANGES.map((r) => (_jsx("button", { type: "button", role: "tab", "aria-selected": r === range, onClick: () => onRangeChange(r), "data-active": r === range || undefined, className: cn('rounded px-2 py-0.5 text-xs', 'data-[active]:bg-background data-[active]:text-foreground', r !== range && 'text-muted-foreground hover:text-foreground'), children: r }, r))) }), groupChip && _jsx("div", { className: "text-muted-foreground text-xs", children: groupChip }), typeof activeCount === 'number' && (_jsxs("div", { className: "text-muted-foreground text-xs", children: [_jsx("span", { className: "mr-1 inline-block size-1.5 rounded-full bg-success-500" }), labels.activeCount.replace('{n}', String(activeCount))] })), _jsxs("div", { className: "ml-auto flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-xs", children: [_jsx("button", { type: "button", "aria-label": labels.previousDate, onClick: () => stepDate(-1), className: "text-muted-foreground hover:text-foreground", children: _jsx(ChevronLeft, { className: "size-3.5" }) }), _jsx("div", { className: "px-1", children: formatDateHeader(selectedDate, now) }), _jsx("button", { type: "button", "aria-label": labels.nextDate, onClick: () => stepDate(1), className: "text-muted-foreground hover:text-foreground", children: _jsx(ChevronRight, { className: "size-3.5" }) })] })] }), _jsxs("div", { className: "grid items-end gap-0", style: { gridTemplateColumns: `${labelGutterPx}px 1fr` }, children: [_jsx("div", {}), _jsx("div", { className: "relative h-5", children: ticks.map((t) => (_jsx("div", { className: "-translate-x-1/2 absolute top-0 text-muted-foreground text-xs", style: { left: `${t.position}%` }, children: t.label }, `${t.position}:${t.label}`))) })] })] }));
}
function formatDateHeader(d, referenceNow) {
    const isToday = d.toDateString() === referenceNow.toDateString();
    const fmt = new Intl.DateTimeFormat(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    }).format(d);
    return isToday ? `Today · ${fmt}` : fmt;
}
