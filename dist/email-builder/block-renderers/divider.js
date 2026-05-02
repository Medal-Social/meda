'use client';
import { jsx as _jsx } from "react/jsx-runtime";
export function DividerBlock({ props }) {
    const wrapperStyle = {
        padding: `${props.padding.top}px ${props.padding.right}px ${props.padding.bottom}px ${props.padding.left}px`,
    };
    const ruleStyle = {
        width: `${props.width}%`,
        margin: '0 auto',
        borderTop: `${props.thickness}px ${props.style} ${props.color}`,
        height: 0,
    };
    return (_jsx("div", { "data-slot": "email-block-divider", style: wrapperStyle, children: _jsx("div", { style: ruleStyle }) }));
}
