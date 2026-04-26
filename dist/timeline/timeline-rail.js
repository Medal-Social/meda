import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Archive } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DateSwitcher } from './date-switcher.js';
import { LiveIndicator } from './live-indicator.js';
import { TimelineTape } from './timeline-tape.js';
const FUTURE_PAD_SEC = 300;
const PAST_SPAN_SEC = 6 * 60 * 60;
const STICKY_TOP_PX = 12;
export function TimelineRail({ date, now, events, zoom = 1.2, followLive = true, tz, onZoomChange, onDateChange, onSelect, onFollowChange, onManageRetention, className, }) {
    const scrollRef = useRef(null);
    const [isFollowing, setIsFollowing] = useState(followLive);
    // Mirror parent prop changes into local state so a controlled toggle of
    // `followLive` from outside actually flips auto-follow.
    useEffect(() => {
        setIsFollowing(followLive);
    }, [followLive]);
    const liveCount = useMemo(() => events.filter((e) => e.isLive).length, [events]);
    const totalCalls = useMemo(() => events.filter((e) => e.kind === 'session').length, [events]);
    // NOW y inside the tape canvas
    const nowY = FUTURE_PAD_SEC * zoom;
    // Keep LIVE pinned by auto-scrolling when isFollowing
    useEffect(() => {
        const el = scrollRef.current;
        if (!el)
            return;
        if (isFollowing) {
            el.scrollTop = nowY - STICKY_TOP_PX;
        }
    }, [isFollowing, nowY]);
    // Detect manual scroll-away → flip off auto-follow
    useEffect(() => {
        const el = scrollRef.current;
        if (!el)
            return;
        const onScroll = () => {
            if (!el)
                return;
            const expected = nowY - STICKY_TOP_PX;
            const drift = Math.abs(el.scrollTop - expected);
            if (drift > 32 && isFollowing) {
                setIsFollowing(false);
                onFollowChange?.(false);
            }
        };
        el.addEventListener('scroll', onScroll, { passive: true });
        return () => el.removeEventListener('scroll', onScroll);
    }, [nowY, isFollowing, onFollowChange]);
    const jumpToLive = () => {
        setIsFollowing(true);
        onFollowChange?.(true);
    };
    return (_jsxs("aside", { className: [
            'relative flex h-full flex-col border-r border-border bg-card text-sm',
            className ?? '',
        ].join(' '), "data-meda-component": "timeline-rail", children: [_jsx("div", { className: "px-3.5 pb-2.5 pt-3.5", children: _jsx(DateSwitcher, { value: date, now: now, onChange: (d) => onDateChange?.(d) }) }), _jsxs("div", { className: "flex items-center gap-2.5 px-3.5 pb-3", children: [_jsx(ZoomBtn, { label: "\u2212", onClick: () => onZoomChange?.(Math.max(0.2, zoom - 0.4)) }), _jsx(ZoomTrack, { value: zoom, min: 0.2, max: 6 }), _jsx(ZoomBtn, { label: "+", onClick: () => onZoomChange?.(Math.min(6, zoom + 0.4)) })] }), _jsxs("div", { className: "flex items-center gap-2 border-b border-border px-3.5 pb-2.5 text-[11px] tabular-nums text-muted-foreground", children: [liveCount > 0 && (_jsxs("span", { className: "inline-flex items-center gap-1.5 font-semibold text-emerald-500", children: [_jsx("span", { className: "size-1.5 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.18)]" }), liveCount, " live"] })), _jsxs("span", { className: "ml-auto", children: [_jsx("strong", { className: "font-semibold text-foreground", children: totalCalls }), " sessions"] })] }), _jsxs("div", { ref: scrollRef, className: "relative flex-1 overflow-y-auto overflow-x-hidden pb-16", children: [_jsx("div", { className: "sticky top-3 z-10 mx-3.5", children: _jsx(LiveIndicator, { now: now, tz: tz }) }), _jsx(TimelineTape, { now: now, events: events, pxPerSec: zoom, futurePadSec: FUTURE_PAD_SEC, pastSpanSec: PAST_SPAN_SEC, tz: tz, onSelect: onSelect })] }), !isFollowing && (_jsx("button", { type: "button", onClick: jumpToLive, className: "absolute right-3 top-32 z-20 inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-semibold text-white shadow-md hover:bg-emerald-600", children: "Jump to live" })), _jsxs("button", { type: "button", onClick: () => onManageRetention?.(), className: "absolute inset-x-0 bottom-0 z-20 flex items-center justify-center gap-1.5 bg-gradient-to-t from-card via-card/85 to-transparent px-3.5 py-2.5 text-[12px] text-primary hover:text-primary/80", children: [_jsx(Archive, { className: "size-3.5" }), " Manage retention"] })] }));
}
function ZoomBtn({ label, onClick }) {
    return (_jsx("button", { type: "button", onClick: onClick, className: "inline-flex size-5 items-center justify-center rounded bg-muted text-sm leading-none text-muted-foreground hover:text-foreground", children: label }));
}
function ZoomTrack({ value, min, max }) {
    const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
    return (_jsx("div", { tabIndex: 0, role: "slider", "aria-label": "Zoom", "aria-valuemin": min, "aria-valuemax": max, "aria-valuenow": value, className: "relative h-1 flex-1 rounded-sm bg-muted", children: _jsx("span", { className: "absolute -top-[3px] size-2.5 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_0_4px_rgba(137,117,255,0.18)]", style: { left: `${pct}%` } }) }));
}
