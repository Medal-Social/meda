import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { formatClock } from '../lib/format-time.js';
export function LiveIndicator({ now, tz, className }) {
    return (_jsxs("div", { role: "status", "aria-live": "polite", className: ['relative h-0 pointer-events-none', className ?? ''].join(' '), children: [_jsx("span", { className: "pointer-events-auto absolute left-0 top-0 inline-flex items-center rounded-md bg-emerald-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-[0_6px_18px_rgba(16,185,129,0.35)]", children: "LIVE" }), _jsx("span", { "aria-hidden": "true", className: "absolute right-0 top-1/2 left-[60px] h-px bg-gradient-to-r from-emerald-500 via-emerald-500/30 to-transparent" }), _jsx("span", { className: "absolute right-1.5 top-[-2px] text-[10px] font-semibold tabular-nums text-emerald-500", children: formatClock(now, { tz }) })] }));
}
