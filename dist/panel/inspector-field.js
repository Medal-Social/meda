import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function InspectorField({ label, value, hint, className }) {
    return (_jsxs("div", { className: ['border-b border-border py-3 last:border-b-0', className ?? ''].join(' '), children: [_jsx("div", { className: "mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", children: label }), _jsxs("div", { className: "text-[13px] tabular-nums text-foreground", children: [value, hint != null && _jsxs("span", { className: "text-[12px] text-muted-foreground", children: [" ", hint] })] })] }));
}
