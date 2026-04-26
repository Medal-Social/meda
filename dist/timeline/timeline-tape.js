import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { formatClock } from '../lib/format-time.js';
import { EventCard } from './event-card.js';
const DEFAULT_PX_PER_SEC = 1.2;
const DEFAULT_FUTURE_PAD_SEC = 300;
const DEFAULT_PAST_SPAN_SEC = 6 * 60 * 60;
/** Convert a unix-ms instant to canvas y (px). y=0 at canvas top. */
function instantToY(instantMs, nowMs, pxPerSec, futurePadSec) {
    const secsAfterNow = (instantMs - nowMs) / 1000;
    // future is above now → smaller y. past is below now → larger y.
    return (futurePadSec - secsAfterNow) * pxPerSec;
}
export function TimelineTape({ now, events, pxPerSec = DEFAULT_PX_PER_SEC, futurePadSec = DEFAULT_FUTURE_PAD_SEC, pastSpanSec = DEFAULT_PAST_SPAN_SEC, tz, onSelect, className, }) {
    const nowMs = now.getTime();
    const totalSec = futurePadSec + pastSpanSec;
    const canvasHeight = totalSec * pxPerSec;
    const nowY = instantToY(nowMs, nowMs, pxPerSec, futurePadSec);
    // Compute tick positions at minute boundaries. Start from the future edge, go down.
    const ticks = [];
    const futureEdgeMs = nowMs + futurePadSec * 1000;
    const pastEdgeMs = nowMs - pastSpanSec * 1000;
    const firstTick = new Date(futureEdgeMs);
    firstTick.setSeconds(0, 0);
    for (let t = firstTick.getTime(); t >= pastEdgeMs; t -= 60_000) {
        const y = instantToY(t, nowMs, pxPerSec, futurePadSec);
        if (y < 0 || y > canvasHeight)
            continue;
        ticks.push({
            y,
            label: formatClock(new Date(t), { tz, withSeconds: false }),
            major: true,
        });
        // 5 sub-ticks every 10s under each major
        for (let sub = 1; sub <= 5; sub++) {
            const subT = t - sub * 10_000;
            if (subT < pastEdgeMs)
                break;
            const subY = instantToY(subT, nowMs, pxPerSec, futurePadSec);
            ticks.push({ y: subY, label: '', major: false });
        }
    }
    // Build tape segments + cards
    const segments = events
        .filter((e) => e.kind === 'session' || e.kind === 'error')
        .map((e) => {
        const startY = instantToY(e.startedAt, nowMs, pxPerSec, futurePadSec);
        const endInstant = e.endedAt ?? (e.isLive ? nowMs : e.startedAt + 1000);
        const endY = instantToY(endInstant, nowMs, pxPerSec, futurePadSec);
        // "Top" of the segment is the more recent (smaller y).
        const top = Math.min(startY, endY);
        const height = Math.max(2, Math.abs(endY - startY));
        return { event: e, top, height };
    });
    return (_jsxs("div", { className: ['relative ml-3.5 mr-3', className ?? ''].join(' '), style: { height: `${canvasHeight}px` }, "data-canvas-height": canvasHeight, children: [ticks.map((t) => t.major ? (_jsxs("div", { children: [_jsx("span", { className: "absolute left-0 w-[30px] -translate-y-[7px] text-right text-[11px] font-medium tabular-nums text-muted-foreground", style: { top: `${t.y}px` }, children: t.label }), _jsx("span", { className: "absolute h-px w-2 bg-border", style: { left: 32, top: `${t.y}px` } })] }, `maj-${t.y}`)) : (_jsx("span", { className: "absolute h-px w-1.5 bg-border/40", style: { left: 35, top: `${t.y}px` } }, `min-${t.y}`))), segments.map(({ event, top, height }) => (_jsx("span", { "aria-hidden": "true", "data-tape-segment-id": event.id, "data-tape-segment-live": String(event.isLive ?? false), className: [
                    'absolute w-1 rounded-sm',
                    event.isLive
                        ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                        : event.kind === 'error'
                            ? 'bg-destructive'
                            : 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.35)]',
                ].join(' '), style: { left: 44, top: `${top}px`, height: `${height}px` } }, `seg-${event.id}`))), events.map((event) => {
                const startY = instantToY(event.startedAt, nowMs, pxPerSec, futurePadSec);
                const isSubEvent = event.kind === 'sub-event';
                return (_jsx("div", { "data-event-id": event.id, className: "absolute", style: { top: `${startY}px`, left: 56, right: 0 }, children: _jsx(EventCard, { event: event, size: isSubEvent ? 'tiny' : 'default', onSelect: onSelect }) }, event.id));
            }), _jsx("span", { "aria-hidden": "true", "data-now-y": nowY, className: "absolute", style: { top: `${nowY}px`, left: 0, width: 0, height: 0 } })] }));
}
