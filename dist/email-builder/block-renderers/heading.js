'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { createElement } from 'react';
export function HeadingBlock({ props }) {
    const tag = `h${props.level}`;
    const style = {
        margin: 0,
        color: props.color,
        fontSize: props.fontSize,
        fontWeight: props.fontWeight,
        fontFamily: props.fontFamily || undefined,
        lineHeight: 1.3,
    };
    const wrapperStyle = {
        padding: `${props.padding.top}px ${props.padding.right}px ${props.padding.bottom}px ${props.padding.left}px`,
        textAlign: props.alignment,
    };
    return (_jsx("div", { "data-slot": "email-block-heading", style: wrapperStyle, children: createElement(tag, { style }, props.text) }));
}
