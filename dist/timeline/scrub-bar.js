import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { useRef } from 'react';
import { formatDuration } from '../lib/format-time.js';
const KIND_COLOR = {
    turn: 'bg-primary',
    tool: 'bg-amber-500',
    barge: 'bg-emerald-500',
    error: 'bg-destructive',
};
export function ScrubBar({ durationMs, positionMs, isLive = false, marks, onSeek, isPlaying, onPlayPause, onSkipBack, onSkipForward, className, }) {
    const trackRef = useRef(null);
    const showPlayPause = isPlaying !== undefined;
    const isPlayingValue = isPlaying ?? false;
    const fillPct = durationMs > 0 ? Math.min(100, (positionMs / durationMs) * 100) : 0;
    const handleSeek = (e) => {
        const rect = trackRef.current?.getBoundingClientRect();
        if (!rect || rect.width === 0)
            return;
        const x = e.clientX - rect.left;
        const pct = Math.max(0, Math.min(1, x / rect.width));
        onSeek(pct * durationMs);
    };
    const handleKeyDown = (e) => {
        const step = durationMs / 100;
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            onSeek(Math.max(0, positionMs - step));
        }
        else if (e.key === 'ArrowRight') {
            e.preventDefault();
            onSeek(Math.min(durationMs, positionMs + step));
        }
    };
    return (_jsxs("div", { className: ['rounded-2xl border border-border bg-card p-3.5', className ?? ''].join(' '), children: [_jsxs("div", { className: "mb-2.5 flex items-center justify-between", children: [_jsx("span", { className: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Timeline \u00B7 this call" }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsxs("span", { className: "px-1.5 text-[11px] tabular-nums text-muted-foreground", children: [formatDuration(positionMs), isLive ? ' / live' : ` / ${formatDuration(durationMs)}`] }), onSkipBack && (_jsx(TransportBtn, { label: "Skip back", onClick: onSkipBack, children: _jsx(SkipBack, { className: "size-3.5" }) })), showPlayPause && (_jsx(TransportBtn, { label: isPlayingValue ? 'Pause' : 'Play', variant: "primary", onClick: onPlayPause ?? (() => { }), children: isPlayingValue ? _jsx(Pause, { className: "size-3.5" }) : _jsx(Play, { className: "size-3.5" }) })), onSkipForward && (_jsx(TransportBtn, { label: "Skip forward", onClick: onSkipForward, children: _jsx(SkipForward, { className: "size-3.5" }) }))] })] }), _jsxs("div", { ref: trackRef, role: "slider", "aria-label": "Conversation position", "aria-valuemin": 0, "aria-valuemax": durationMs, "aria-valuenow": positionMs, onClick: handleSeek, onKeyDown: handleKeyDown, tabIndex: 0, className: "relative h-8 cursor-pointer overflow-hidden rounded-md bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50", children: [_jsx("span", { "aria-hidden": "true", className: "absolute inset-y-0 left-0 bg-primary/10", style: { width: `${fillPct}%` } }), marks.map((m) => (_jsx("span", { "data-mark-kind": m.kind, title: m.label ?? m.kind, className: ['absolute inset-y-1 w-0.5 rounded-sm', KIND_COLOR[m.kind]].join(' '), style: { left: `${m.positionPct}%` } }, m.id))), _jsx("span", { "aria-hidden": "true", className: "absolute -inset-y-0.5 w-0.5 bg-foreground", style: { left: `${fillPct}%` } })] }), _jsxs("div", { className: "flex justify-between pt-2 text-[10px] tabular-nums text-muted-foreground", children: [_jsx("span", { children: "0:00" }), _jsx("span", { children: isLive ? 'now' : formatDuration(durationMs) })] })] }));
}
function TransportBtn({ label, onClick, variant, children, }) {
    return (_jsx("button", { type: "button", "aria-label": label, onClick: onClick, className: [
            'inline-flex size-6 items-center justify-center rounded',
            variant === 'primary'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        ].join(' '), children: children }));
}
