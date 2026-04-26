import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Play } from 'lucide-react';
import { formatClock, formatRelativeOffset } from '../lib/format-time.js';
import { LatencyBadge } from './latency-badge.js';
import { ToolCallBlock } from './tool-call-block.js';
const SPEAKER_LABEL = {
    user: 'You',
    assistant: 'Assistant',
    system: 'System',
};
export function TurnCard({ turn, startedAtRef, tz, onPlay, className }) {
    const label = turn.speakerLabel ?? SPEAKER_LABEL[turn.speaker];
    const offset = turn.startedAt - startedAtRef;
    const speakerColor = turn.speaker === 'assistant'
        ? 'text-primary'
        : turn.speaker === 'system'
            ? 'text-amber-500'
            : 'text-foreground';
    return (_jsxs("div", { className: [
            'grid grid-cols-[64px_1fr] gap-5 border-b border-border py-4 last:border-b-0',
            className ?? '',
        ].join(' '), children: [_jsxs("div", { className: "pt-1 text-[11px] tabular-nums text-muted-foreground", children: [_jsx("strong", { className: "mb-0.5 block text-[12px] font-medium text-muted-foreground", children: formatClock(new Date(turn.startedAt), { tz }) }), formatRelativeOffset(offset)] }), _jsxs("div", { children: [_jsxs("div", { className: "mb-1.5 flex items-center gap-2", children: [_jsx("span", { className: ['text-[11px] font-semibold uppercase tracking-wider', speakerColor].join(' '), children: label }), turn.modelLabel && (_jsx("span", { className: "rounded bg-muted px-1.5 py-px text-[10px] font-medium text-muted-foreground", children: turn.modelLabel })), turn.spokenSeconds != null && turn.speaker === 'user' && (_jsxs("span", { className: "rounded bg-muted px-1.5 py-px text-[10px] font-medium text-muted-foreground", children: ["spoken \u00B7 ", turn.spokenSeconds.toFixed(1), "s"] }))] }), _jsxs("p", { className: "text-[15px] leading-relaxed text-foreground", "data-streaming": String(turn.streaming ?? false), children: [turn.text, turn.streaming && (_jsx("span", { "aria-hidden": "true", className: "ml-0.5 animate-pulse text-primary", children: "\u258D" }))] }), turn.toolCalls?.map((c) => (_jsx(ToolCallBlock, { call: c }, c.id))), (turn.audioUrl || turn.latency) && (_jsxs("div", { className: "mt-2.5 flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground", children: [turn.audioUrl && (_jsx("button", { type: "button", "aria-label": "Play this turn", onClick: () => onPlay?.(turn.id), className: "inline-flex size-6 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground", children: _jsx(Play, { className: "size-3" }) })), turn.latency?.sttMs != null && _jsx(LatencyBadge, { kind: "stt", ms: turn.latency.sttMs }), turn.latency?.claudeMs != null && (_jsx(LatencyBadge, { kind: "claude", ms: turn.latency.claudeMs })), turn.latency?.ttsMs != null && _jsx(LatencyBadge, { kind: "tts", ms: turn.latency.ttsMs })] }))] })] }));
}
