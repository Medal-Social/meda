'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function FooterBlock({ props }) {
    const wrapperStyle = {
        padding: `${props.padding.top}px ${props.padding.right}px ${props.padding.bottom}px ${props.padding.left}px`,
        textAlign: props.alignment,
        color: props.textColor,
        fontSize: props.fontSize,
        lineHeight: 1.5,
    };
    return (_jsxs("div", { "data-slot": "email-block-footer", style: wrapperStyle, children: [props.companyName ? _jsx("div", { children: props.companyName }) : null, props.address ? _jsx("div", { children: props.address }) : null, props.customText ? _jsx("div", { children: props.customText }) : null, props.unsubscribeText ? (_jsx("div", { style: { marginTop: 8 }, children: _jsx("a", { href: "#unsubscribe", style: { color: props.textColor, textDecoration: 'underline' }, children: props.unsubscribeText }) })) : null] }));
}
