import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Zap } from 'lucide-react';
function safeStringify(v) {
    // Tolerate values JSON.stringify can't handle (BigInt, circular refs, etc.)
    // so a malformed tool arg never crashes the transcript view.
    try {
        const out = JSON.stringify(v);
        return out === undefined ? String(v) : out;
    }
    catch {
        return String(v);
    }
}
export function ToolCallBlock({ call, className }) {
    return (_jsxs("div", { className: [
            'mt-3 rounded-md border border-border border-l-2 border-l-amber-500 bg-card p-3 font-mono text-xs',
            className ?? '',
        ].join(' '), children: [_jsxs("div", { className: "mb-1.5 flex items-center gap-2 text-[11px]", children: [_jsx(Zap, { className: "size-3 text-amber-500" }), _jsx("strong", { className: "font-semibold text-foreground", children: call.name }), call.latencyMs != null && (_jsxs("span", { className: "ml-auto tabular-nums text-muted-foreground", children: [call.latencyMs, "ms"] }))] }), _jsxs("div", { className: "text-muted-foreground", children: [Object.entries(call.args && typeof call.args === 'object' ? call.args : {}).map(([k, v], i) => (_jsxs("span", { children: [i > 0 && ', ', _jsx("span", { className: "text-primary", children: k }), ": ", '', _jsx("span", { className: "text-emerald-500", children: safeStringify(v) })] }, k))), call.resultSummary && (_jsxs("span", { className: "text-muted-foreground", children: [" \u2192 ", call.resultSummary] }))] })] }));
}
