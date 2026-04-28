'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../lib/utils.js';
export function LaneRow({ lane, windowStart, windowEnd, labelGutterPx, selectedBarId, onSelectBar, }) {
    return (_jsxs("div", { className: "grid items-center gap-0 border-border/40 border-b py-3", style: { gridTemplateColumns: `${labelGutterPx}px 1fr` }, children: [_jsxs("div", { className: "flex flex-col gap-0.5 pr-3", children: [_jsxs("div", { className: cn('flex items-center gap-2 text-sm', lane.muted && 'text-muted-foreground'), children: [lane.statusDotClass && (_jsx("span", { className: cn('inline-block size-2 rounded-full', lane.statusDotClass, lane.muted && 'opacity-40') })), _jsx("span", { className: "font-medium", children: lane.label })] }), lane.sublabel && _jsx("div", { className: "text-muted-foreground text-xs", children: lane.sublabel })] }), _jsx("div", { className: "relative h-7", children: lane.bars.map((bar) => {
                    const placement = placeBar(bar, windowStart, windowEnd);
                    if (!placement)
                        return null;
                    const selected = selectedBarId === bar.id;
                    const isSelectable = !!onSelectBar;
                    const barClassName = cn('absolute top-0 flex h-full items-center overflow-hidden rounded-md px-2 text-left text-xs text-white', bar.fillClass, bar.accentClass, isSelectable && [
                        'data-[selected]:ring-2 data-[selected]:ring-primary data-[selected]:ring-offset-1 data-[selected]:ring-offset-background',
                        'hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    ]);
                    const barStyle = { left: `${placement.left}%`, width: `${placement.width}%` };
                    const ariaLabel = `${lane.label} — ${bar.label}`;
                    if (!isSelectable) {
                        return (_jsx("div", { role: "img", "aria-label": ariaLabel, className: barClassName, style: barStyle, children: _jsx("span", { "aria-hidden": "true", className: "truncate", children: bar.label }) }, bar.id));
                    }
                    return (_jsx("button", { type: "button", onClick: () => onSelectBar(bar, lane), "data-selected": selected || undefined, className: barClassName, style: barStyle, "aria-label": ariaLabel, children: _jsx("span", { "aria-hidden": "true", className: "truncate", children: bar.label }) }, bar.id));
                }) })] }));
}
function placeBar(bar, windowStart, windowEnd) {
    const ws = windowStart.getTime();
    const we = windowEnd.getTime();
    const span = we - ws;
    if (span <= 0)
        return null;
    const bs = bar.start.getTime();
    const be = bar.end.getTime();
    // Bar entirely outside the window (or exactly touching boundary) — skip.
    if (be <= ws || bs >= we)
        return null;
    const clampedStart = Math.max(bs, ws);
    const clampedEnd = Math.min(be, we);
    const left = ((clampedStart - ws) / span) * 100;
    const width = Math.max(((clampedEnd - clampedStart) / span) * 100, 0.5);
    return { left, width };
}
