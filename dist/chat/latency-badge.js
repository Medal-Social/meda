import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const KIND = {
    stt: { label: 'STT', tone: 'text-sky-400' },
    claude: { label: 'Claude', tone: 'text-primary' },
    tts: { label: 'TTS', tone: 'text-emerald-500' },
};
function fmt(ms) {
    if (ms >= 1000)
        return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.round(ms)}ms`;
}
export function LatencyBadge({ kind, ms, className }) {
    const meta = KIND[kind];
    return (_jsxs("span", { "data-kind": kind, className: [
            'inline-flex items-center gap-1.5 text-[11px] tabular-nums',
            meta.tone,
            className ?? '',
        ].join(' '), children: [_jsx("span", { "aria-hidden": "true", className: "size-1 rounded-full bg-current" }), meta.label, " ", fmt(ms)] }));
}
