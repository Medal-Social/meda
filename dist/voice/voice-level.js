import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
const BAR_COUNT = 9;
export function VoiceLevel({ level, variant = 'bars', width = 140, height = 48, className, }) {
    const historyRef = React.useRef(Array(BAR_COUNT).fill(0));
    const [, force] = React.useState(0);
    React.useEffect(() => {
        historyRef.current = [...historyRef.current.slice(1), Math.min(1, Math.max(0, level))];
        force((v) => v + 1);
    }, [level]);
    if (variant === 'bars') {
        return (_jsx("div", { role: "presentation", className: ['flex items-end gap-1', className ?? ''].join(' '), style: { width, height }, children: historyRef.current.map((v, i) => (_jsx("span", { className: "flex-1 rounded-sm bg-primary", style: { height: `${15 + v * 85}%`, opacity: 0.4 + v * 0.6 } }, i))) }));
    }
    if (variant === 'ring') {
        const r = Math.min(width, height) / 2 - 4;
        const c = 2 * Math.PI * r;
        const filled = c * Math.min(1, Math.max(0, level));
        return (_jsxs("svg", { width: width, height: height, className: className, role: "presentation", children: [_jsx("circle", { cx: width / 2, cy: height / 2, r: r, stroke: "hsl(var(--border))", strokeWidth: "3", fill: "none" }), _jsx("circle", { cx: width / 2, cy: height / 2, r: r, stroke: "hsl(var(--primary))", strokeWidth: "3", fill: "none", strokeDasharray: `${filled} ${c}`, strokeLinecap: "round", transform: `rotate(-90 ${width / 2} ${height / 2})` })] }));
    }
    // 'wave' — simple bezier that scales with level
    const peak = height / 2 - 2;
    const amp = peak * Math.min(1, Math.max(0, level));
    return (_jsx("svg", { width: width, height: height, className: className, role: "presentation", children: _jsx("path", { d: `M 0 ${height / 2} Q ${width / 4} ${height / 2 - amp}, ${width / 2} ${height / 2} T ${width} ${height / 2}`, stroke: "hsl(var(--primary))", strokeWidth: "2", fill: "none" }) }));
}
