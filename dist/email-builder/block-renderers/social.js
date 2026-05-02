'use client';
import { jsx as _jsx } from "react/jsx-runtime";
export function SocialBlock({ props }) {
    const visible = props.links.filter((l) => Boolean(l.url));
    const wrapperStyle = {
        padding: `${props.padding.top}px ${props.padding.right}px ${props.padding.bottom}px ${props.padding.left}px`,
        textAlign: props.alignment,
    };
    return (_jsx("div", { "data-slot": "email-block-social", style: wrapperStyle, children: _jsx("div", { style: {
                display: 'inline-flex',
                gap: props.spacing,
                alignItems: 'center',
                justifyContent: 'center',
            }, children: visible.map((link, i) => (_jsx("a", { href: link.url, rel: "noopener noreferrer", "aria-label": link.platform, className: "inline-flex items-center justify-center rounded bg-muted px-3 py-1 text-foreground text-xs no-underline", style: {
                    width: link.iconUrl ? props.iconSize : undefined,
                    height: link.iconUrl ? props.iconSize : undefined,
                    padding: link.iconUrl ? 0 : undefined,
                }, children: link.iconUrl ? (_jsx("img", { src: link.iconUrl, alt: link.platform, width: props.iconSize, height: props.iconSize, style: { display: 'block' } })) : (link.platform) }, `${link.platform}-${i}`))) }) }));
}
