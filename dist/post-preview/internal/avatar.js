'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { cn } from '../../lib/utils.js';
function initialOf(name) {
    const trimmed = name.trim();
    if (!trimmed)
        return '?';
    return trimmed.charAt(0).toUpperCase();
}
/**
 * Internal avatar primitive used by post-preview platforms.
 * Plain `<img>` with an initials fallback; deliberately not exported
 * from the public surface so we don't lock consumers in. Consumers
 * who want a richer Avatar primitive should pull one from elsewhere.
 */
export function Avatar({ src, displayName, className }) {
    const [errored, setErrored] = useState(false);
    const showFallback = !src || errored;
    return (_jsx("span", { "data-slot": "post-preview-avatar", className: cn('inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-medium text-muted-foreground', className), children: showFallback ? (_jsx("span", { role: "img", "aria-label": displayName, children: initialOf(displayName) })) : (_jsx("img", { src: src, alt: displayName, loading: "lazy", decoding: "async", onError: () => setErrored(true), className: "h-full w-full object-cover" })) }));
}
