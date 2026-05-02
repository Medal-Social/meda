'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ImageOff } from 'lucide-react';
export function ImageBlock({ props }) {
    const wrapperStyle = {
        padding: `${props.padding.top}px ${props.padding.right}px ${props.padding.bottom}px ${props.padding.left}px`,
        textAlign: props.alignment,
    };
    if (!props.src) {
        return (_jsx("div", { "data-slot": "email-block-image", style: wrapperStyle, children: _jsxs("div", { className: "mx-auto flex items-center justify-center rounded-md border border-border border-dashed bg-muted/50 text-muted-foreground", style: {
                    width: '100%',
                    maxWidth: props.width,
                    height: 120,
                }, children: [_jsx(ImageOff, { className: "size-6", "aria-hidden": true }), _jsx("span", { className: "ml-2 text-sm", children: "No image selected" })] }) }));
    }
    const img = (_jsx("img", { src: props.src, alt: props.alt, width: props.width, height: props.height === 'auto' ? undefined : props.height, style: { display: 'block', width: '100%', maxWidth: props.width, height: 'auto' } }));
    return (_jsx("div", { "data-slot": "email-block-image", style: wrapperStyle, children: props.linkUrl ? (_jsx("a", { href: props.linkUrl, rel: "noopener noreferrer", children: img })) : (img) }));
}
