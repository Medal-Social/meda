'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { cn } from '../lib/utils.js';
import { LaneRow } from './lane.js';
import { defaultLaneTimelineLabels, } from './lane-timeline-types.js';
import { TimeAxis } from './time-axis.js';
const LABEL_GUTTER_PX = 140;
const RANGE_MS = {
    '1h': 60 * 60_000,
    '6h': 6 * 60 * 60_000,
    '24h': 24 * 60 * 60_000,
    '7d': 7 * 24 * 60 * 60_000,
};
export function LaneTimeline({ lanes, now, defaultRange = '6h', range: controlledRange, onRangeChange, selectedDate: controlledDate, onDateChange, title, groupChip, activeCount, legend, selectedBarId, onSelectBar, labels, className, }) {
    const resolvedLabels = { ...defaultLaneTimelineLabels, ...(labels ?? {}) };
    const [internalRange, setInternalRange] = useState(defaultRange);
    const [internalDate, setInternalDate] = useState(() => new Date());
    const range = controlledRange ?? internalRange;
    const selectedDate = controlledDate ?? internalDate;
    const referenceNow = now ?? new Date();
    const { windowStart, windowEnd } = useMemo(() => {
        const rangeMs = RANGE_MS[range];
        const futurePadMs = Math.max(rangeMs / 6, 5 * 60_000);
        const isToday = selectedDate.toDateString() === referenceNow.toDateString();
        const end = isToday ? new Date(referenceNow.getTime() + futurePadMs) : endOfDay(selectedDate);
        const start = new Date(end.getTime() - rangeMs - futurePadMs);
        return { windowStart: start, windowEnd: end };
    }, [range, selectedDate, referenceNow]);
    const ticks = useMemo(() => buildTicks(windowStart, windowEnd, range), [windowStart, windowEnd, range]);
    const handleRange = (r) => {
        if (controlledRange === undefined)
            setInternalRange(r);
        onRangeChange?.(r);
    };
    const handleDate = (d) => {
        if (controlledDate === undefined)
            setInternalDate(d);
        onDateChange?.(d);
    };
    const showNowLine = referenceNow.getTime() >= windowStart.getTime() &&
        referenceNow.getTime() <= windowEnd.getTime();
    const nowPositionPct = showNowLine
        ? ((referenceNow.getTime() - windowStart.getTime()) /
            (windowEnd.getTime() - windowStart.getTime())) *
            100
        : 0;
    return (_jsxs("section", { className: cn('flex flex-col rounded-lg border border-border bg-card p-4', className), children: [_jsx(TimeAxis, { range: range, onRangeChange: handleRange, selectedDate: selectedDate, onDateChange: handleDate, title: title, groupChip: groupChip, activeCount: activeCount, labels: resolvedLabels, ticks: ticks, labelGutterPx: LABEL_GUTTER_PX }), _jsxs("div", { className: "relative", children: [lanes.map((lane) => (_jsx(LaneRow, { lane: lane, windowStart: windowStart, windowEnd: windowEnd, labelGutterPx: LABEL_GUTTER_PX, selectedBarId: selectedBarId, onSelectBar: onSelectBar }, lane.id))), showNowLine && (_jsx("div", { "aria-hidden": "true", className: "pointer-events-none absolute top-0 bottom-0 w-px bg-primary", style: {
                            left: `calc(${LABEL_GUTTER_PX}px + (100% - ${LABEL_GUTTER_PX}px) * ${nowPositionPct / 100})`,
                        }, children: _jsx("div", { className: "-translate-x-1/2 -top-1 absolute size-2 rounded-full bg-primary" }) }))] }), legend && legend.length > 0 && (_jsxs("div", { className: "mt-3 flex items-center gap-4 border-border/40 border-t pt-3 text-muted-foreground text-xs", children: [_jsx("span", { className: "uppercase tracking-wider", children: "Legend" }), legend.map((item) => (_jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: cn('inline-block size-2 rounded-sm', item.swatchClass) }), item.label] }, item.label))), showNowLine && (_jsxs("span", { className: "ml-auto flex items-center gap-1.5", children: [_jsx("span", { className: "inline-block size-2 rounded-full bg-primary" }), resolvedLabels.now, " \u00B7 ", formatTime(referenceNow)] }))] }))] }));
}
function endOfDay(d) {
    const e = new Date(d);
    e.setHours(23, 59, 59, 999);
    return e;
}
function formatTime(d) {
    return new Intl.DateTimeFormat(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(d);
}
function buildTicks(start, end, range) {
    const span = end.getTime() - start.getTime();
    const tickCount = range === '7d' ? 7 : range === '24h' ? 8 : 7;
    const out = [];
    for (let i = 0; i <= tickCount; i++) {
        const t = new Date(start.getTime() + (span * i) / tickCount);
        out.push({ position: (i / tickCount) * 100, label: formatTickLabel(t, range) });
    }
    return out;
}
function formatTickLabel(d, range) {
    if (range === '7d') {
        return new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(d);
    }
    return new Intl.DateTimeFormat(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(d);
}
