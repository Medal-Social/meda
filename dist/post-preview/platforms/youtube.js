'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MoreVertical, ThumbsDown, ThumbsUp } from 'lucide-react';
import { cn } from '../../lib/utils.js';
import { Avatar } from '../internal/avatar.js';
import { Textarea } from '../internal/textarea.js';
export const DEFAULT_YOUTUBE_LABELS = {
    placeholder: 'Create a post...',
    justNow: 'just now',
    like: 'Like',
    dislike: 'Dislike',
    share: 'Share',
    moreOptions: 'More options',
};
/**
 * YouTube community-post preview. Honors `.dark` for the dark variant.
 */
export function YouTubePreview({ displayName, username: _username, avatarUrl, content, mediaUrls, editable = false, onContentChange, className, labels, }) {
    const l = { ...DEFAULT_YOUTUBE_LABELS, ...labels };
    return (_jsxs("div", { "data-slot": "post-preview", "data-platform": "youtube", className: cn('@container bg-white p-4 text-gray-900 @[420px]:text-[14px] dark:bg-[#0f0f0f] dark:text-white', className), children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex gap-3", children: [_jsx(Avatar, { src: avatarUrl, displayName: displayName, className: "h-10 w-10" }), _jsx("div", { children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-medium text-[14px]", children: displayName }), _jsx("span", { className: "text-[12px] text-gray-500 dark:text-gray-400", children: l.justNow })] }) })] }), _jsx("button", { type: "button", "aria-label": l.moreOptions, className: "-m-2 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800", children: _jsx(MoreVertical, { className: "h-5 w-5" }) })] }), editable ? (_jsx(Textarea, { value: content, onChange: (e) => onContentChange?.(e.target.value), placeholder: l.placeholder, className: "mt-3 min-h-[60px] text-[14px] placeholder:text-gray-500" })) : (_jsx("p", { className: "mt-3 whitespace-pre-wrap break-words text-[14px]", children: content })), mediaUrls && mediaUrls.length > 0 && (_jsx("div", { className: "mt-3 overflow-hidden rounded-xl", children: _jsx("div", { className: "aspect-video bg-gray-100 dark:bg-gray-800", children: _jsx("img", { src: mediaUrls[0], alt: "Media 1", loading: "lazy", decoding: "async", className: "h-full w-full object-cover" }) }) })), _jsxs("div", { className: "mt-4 flex items-center gap-2", children: [_jsxs("button", { type: "button", className: "inline-flex min-h-11 items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700", "aria-label": l.like, children: [_jsx(ThumbsUp, { className: "h-4 w-4" }), _jsx("span", { className: "font-medium text-[13px]", children: "0" })] }), _jsx("button", { type: "button", "aria-label": l.dislike, className: "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-gray-100 p-2 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700", children: _jsx(ThumbsDown, { className: "h-4 w-4" }) }), _jsxs("button", { type: "button", "aria-label": l.share, className: "inline-flex min-h-11 items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700", children: [_jsx("svg", { className: "h-4 w-4", viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true", children: _jsx("path", { d: "M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z" }) }), _jsx("span", { className: "font-medium text-[13px]", children: "0" })] })] })] }));
}
