'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Building2, ExternalLink, MoreVertical, ThumbsUp } from 'lucide-react';
import { cn } from '../../lib/utils.js';
import { Avatar } from '../internal/avatar.js';
import { Textarea } from '../internal/textarea.js';
export const DEFAULT_GOOGLE_BUSINESS_LABELS = {
    placeholder: 'Share an update about your business...',
    postedJustNow: 'Posted just now',
    learnMore: 'Learn more',
    like: 'Like',
    share: 'Share',
    moreOptions: 'More options',
};
/**
 * Google Business Profile update-post preview. Renders the business name,
 * timestamp, content, optional media, and a Learn-more CTA button.
 */
export function GoogleBusinessPreview({ displayName, username: _username, avatarUrl, content, mediaUrls, editable = false, onContentChange, className, labels, }) {
    const l = { ...DEFAULT_GOOGLE_BUSINESS_LABELS, ...labels };
    return (_jsxs("div", { "data-slot": "post-preview", "data-platform": "google_business", className: cn('@container overflow-hidden rounded-lg border border-gray-200 bg-white text-gray-900 @[420px]:text-[14px] dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100', className), children: [_jsxs("div", { className: "flex items-start justify-between p-4", children: [_jsxs("div", { className: "flex gap-3", children: [avatarUrl ? (_jsx(Avatar, { src: avatarUrl, displayName: displayName, className: "h-10 w-10 rounded" })) : (_jsx("span", { role: "img", "aria-label": displayName, className: "inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded bg-[#4285F4] text-white", children: _jsx(Building2, { className: "h-5 w-5" }) })), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-[14px] text-gray-900", children: displayName }), _jsx("p", { className: "text-[12px] text-gray-500", children: l.postedJustNow })] })] }), _jsx("button", { type: "button", "aria-label": l.moreOptions, className: "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full p-1 text-gray-500 hover:bg-gray-100", children: _jsx(MoreVertical, { className: "h-5 w-5" }) })] }), _jsx("div", { className: "px-4 pb-3", children: editable ? (_jsx(Textarea, { value: content, onChange: (e) => onContentChange?.(e.target.value), placeholder: l.placeholder, className: "min-h-[80px] text-[14px] text-gray-900 placeholder:text-gray-500" })) : (_jsx("p", { className: "whitespace-pre-wrap break-words text-[14px]", children: content })) }), mediaUrls && mediaUrls.length > 0 && (_jsx("div", { className: "aspect-video bg-gray-100", children: _jsx("img", { src: mediaUrls[0], alt: "Post media", loading: "lazy", decoding: "async", className: "h-full w-full object-cover" }) })), _jsx("div", { className: "border-gray-100 border-t p-4", children: _jsxs("button", { type: "button", className: "flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-[#1A73E8] px-4 py-2 font-medium text-[14px] text-white hover:bg-[#1557B0]", children: [_jsx("span", { children: l.learnMore }), _jsx(ExternalLink, { className: "h-4 w-4" })] }) }), _jsxs("div", { className: "flex items-center gap-4 px-4 pb-4", children: [_jsxs("button", { type: "button", className: "inline-flex min-h-11 items-center gap-1.5 text-gray-600 hover:text-[#1A73E8]", "aria-label": l.like, children: [_jsx(ThumbsUp, { className: "h-4 w-4" }), _jsx("span", { className: "text-[13px]", children: l.like })] }), _jsxs("button", { type: "button", "aria-label": l.share, className: "inline-flex min-h-11 items-center gap-1.5 text-gray-600 hover:text-[#1A73E8]", children: [_jsx("svg", { className: "h-4 w-4", viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true", children: _jsx("path", { d: "M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" }) }), _jsx("span", { className: "text-[13px]", children: l.share })] })] })] }));
}
