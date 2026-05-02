'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function TextBlock({ props }) {
    const wrapperStyle = {
        padding: `${props.padding.top}px ${props.padding.right}px ${props.padding.bottom}px ${props.padding.left}px`,
        textAlign: props.alignment,
        color: props.color,
        fontSize: props.fontSize,
        fontWeight: props.fontWeight,
        fontFamily: props.fontFamily || undefined,
        lineHeight: 1.55,
        wordBreak: 'break-word',
    };
    // Render as paragraphs split on blank lines.
    const paragraphs = props.content.split(/\n{2,}/);
    return (_jsx("div", { "data-slot": "email-block-text", style: wrapperStyle, children: paragraphs.map((para, i) => (_jsx("p", { style: { margin: i > 0 ? '12px 0 0 0' : 0 }, children: para.split('\n').map((line, lineIdx, lines) => (_jsxs("span", { children: [line, lineIdx < lines.length - 1 ? _jsx("br", {}) : null] }, lineIdx))) }, i))) }));
}
