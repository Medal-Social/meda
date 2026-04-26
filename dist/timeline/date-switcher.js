import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
function startOfDay(d) {
    const c = new Date(d);
    c.setHours(0, 0, 0, 0);
    return c.getTime();
}
function isSameDay(a, b) {
    return startOfDay(a) === startOfDay(b);
}
function addDays(d, delta) {
    // Use calendar arithmetic, not fixed-ms offsets, so DST 23h/25h days
    // don't bump the result to the wrong calendar date.
    const c = new Date(d);
    c.setDate(c.getDate() + delta);
    return c;
}
function fmtDate(d) {
    return new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(d);
}
export function DateSwitcher({ value, now, onChange, className }) {
    const isToday = isSameDay(value, now);
    const goPrev = () => onChange(addDays(value, -1));
    const goNext = () => onChange(addDays(value, 1));
    return (_jsxs("div", { className: ['flex items-center gap-2', className ?? ''].join(' '), children: [_jsx("button", { type: "button", "aria-label": "Previous day", onClick: goPrev, className: "inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground", children: _jsx(ChevronLeft, { className: "size-4" }) }), _jsxs("div", { className: "flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm", children: [_jsx(Calendar, { className: "size-3.5 text-muted-foreground" }), _jsx("span", { className: "font-medium", children: fmtDate(value) }), isToday && (_jsx("span", { className: "ml-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-500", children: "today" }))] }), _jsx("button", { type: "button", "aria-label": "Next day", disabled: isToday, onClick: goNext, className: "inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent", children: _jsx(ChevronRight, { className: "size-4" }) })] }));
}
