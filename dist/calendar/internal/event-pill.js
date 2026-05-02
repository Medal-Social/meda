'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../../lib/utils.js';
/**
 * Default compact event pill used inside calendar cells/slots when the
 * consumer does not pass a custom `renderEvent` callback.
 */
export function EventPill({ event, onClick, variant = 'compact', className }) {
    const isInteractive = typeof onClick === 'function';
    // Apply consumer color as the left-border accent only — using it as a
    // background risks color-contrast failures with the default foreground
    // text. Consumers wanting full color fills should pass a custom renderEvent.
    const style = event.color ? { borderLeftColor: event.color } : undefined;
    const content = variant === 'compact' ? (_jsx("span", { className: "block truncate font-medium text-[11px] leading-tight", children: event.title })) : (_jsxs(_Fragment, { children: [_jsx("span", { className: "block truncate font-medium text-xs leading-tight", children: event.title }), event.allDay ? null : (_jsx("span", { className: "block text-[10px] text-muted-foreground tabular-nums", children: formatRange(event) }))] }));
    if (isInteractive) {
        return (_jsx("button", { type: "button", "data-slot": "calendar-event", "data-calendar-item": "true", onClick: (e) => {
                e.stopPropagation();
                onClick(event);
            }, style: style, className: cn('block w-full min-h-[24px] rounded border-l-2 bg-accent px-1.5 py-0.5 text-left', 'border-primary text-accent-foreground transition-colors', 'hover:bg-accent/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary', className), children: content }));
    }
    return (_jsx("div", { "data-slot": "calendar-event", "data-calendar-item": "true", style: style, className: cn('block w-full min-h-[24px] rounded border-l-2 bg-accent px-1.5 py-0.5', 'border-primary text-accent-foreground', className), children: content }));
}
function formatRange(event) {
    const start = event.start;
    const end = event.end;
    const fmt = (d) => new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(d);
    if (!end)
        return fmt(start);
    return `${fmt(start)} – ${fmt(end)}`;
}
