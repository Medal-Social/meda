'use client';
import { jsx as _jsx } from "react/jsx-runtime";
const SIZES = {
    sm: { paddingX: 16, paddingY: 8, fontSize: 14 },
    md: { paddingX: 24, paddingY: 12, fontSize: 16 },
    lg: { paddingX: 32, paddingY: 16, fontSize: 18 },
};
export function ButtonBlock({ props }) {
    const s = SIZES[props.size];
    const wrapperStyle = {
        padding: `${props.padding.top}px ${props.padding.right}px ${props.padding.bottom}px ${props.padding.left}px`,
        textAlign: props.alignment,
    };
    const linkStyle = {
        display: 'inline-block',
        backgroundColor: props.backgroundColor,
        color: props.textColor,
        borderRadius: props.borderRadius,
        padding: `${s.paddingY}px ${s.paddingX}px`,
        fontSize: s.fontSize,
        fontWeight: 600,
        textDecoration: 'none',
        width: props.fullWidth ? '100%' : undefined,
    };
    return (_jsx("div", { "data-slot": "email-block-button", style: wrapperStyle, children: _jsx("a", { href: props.url, style: linkStyle, rel: "noopener noreferrer", children: props.text }) }));
}
