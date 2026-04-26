import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LatencyBadge } from './latency-badge.js';
export function LatencyBreakdown({ sttMs, claudeMs, ttsMs, showLegend = true, className, }) {
    const total = Math.max(1, sttMs + claudeMs + ttsMs);
    const sttPct = (sttMs / total) * 100;
    const claudePct = (claudeMs / total) * 100;
    const ttsPct = (ttsMs / total) * 100;
    return (_jsxs("div", { className: className, children: [_jsxs("div", { className: "flex h-1.5 gap-0.5 overflow-hidden rounded-sm bg-muted", children: [_jsx("span", { "data-segment": "stt", className: "block bg-sky-400", style: { width: `${sttPct}%` } }), _jsx("span", { "data-segment": "claude", className: "block bg-primary", style: { width: `${claudePct}%` } }), _jsx("span", { "data-segment": "tts", className: "block bg-emerald-500", style: { width: `${ttsPct}%` } })] }), showLegend && (_jsxs("div", { className: "mt-1.5 flex flex-wrap gap-3 text-[11px] tabular-nums text-muted-foreground", children: [_jsx(LatencyBadge, { kind: "stt", ms: sttMs }), _jsx(LatencyBadge, { kind: "claude", ms: claudeMs }), _jsx(LatencyBadge, { kind: "tts", ms: ttsMs })] }))] }));
}
