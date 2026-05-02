'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Bookmark, Heart, MessageCircle, Share2 } from 'lucide-react';
import { cn } from '../../lib/utils.js';
import { Avatar } from '../internal/avatar.js';
import { Textarea } from '../internal/textarea.js';
export const DEFAULT_TIKTOK_LABELS = {
    placeholder: 'Add a caption...',
    share: 'Share',
    originalSound: (name) => `Original sound - ${name}`,
    like: 'Like',
    comment: 'Comment',
    bookmark: 'Bookmark',
};
/**
 * TikTok video-overlay preview. Always renders against a dark background to
 * match the platform's video-first UI.
 */
export function TikTokPreview({ displayName, username, avatarUrl, content, editable = false, onContentChange, className, labels, }) {
    const l = { ...DEFAULT_TIKTOK_LABELS, ...labels };
    const formattedUsername = username.startsWith('@') ? username : `@${username}`;
    return (_jsxs("div", { "data-slot": "post-preview", "data-platform": "tiktok", className: cn('@container relative min-h-[300px] bg-black text-white @[420px]:min-h-[420px]', className), children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" }), _jsxs("div", { className: "absolute right-3 bottom-20 flex flex-col items-center gap-4", children: [_jsxs("div", { className: "flex flex-col items-center gap-1", children: [_jsx(Avatar, { src: avatarUrl, displayName: displayName, className: "h-11 w-11 ring-2 ring-white" }), _jsx("div", { className: "-mt-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#FE2C55]", children: _jsx("span", { className: "font-bold text-white text-xs", "aria-hidden": "true", children: "+" }) })] }), _jsxs("button", { type: "button", "aria-label": l.like, className: "inline-flex min-h-11 min-w-11 flex-col items-center gap-1", children: [_jsx("div", { className: "rounded-full bg-gray-800/50 p-2", children: _jsx(Heart, { className: "h-7 w-7", fill: "white" }) }), _jsx("span", { className: "font-semibold text-xs", children: "0" })] }), _jsxs("button", { type: "button", "aria-label": l.comment, className: "inline-flex min-h-11 min-w-11 flex-col items-center gap-1", children: [_jsx("div", { className: "rounded-full bg-gray-800/50 p-2", children: _jsx(MessageCircle, { className: "h-7 w-7", fill: "white" }) }), _jsx("span", { className: "font-semibold text-xs", children: "0" })] }), _jsxs("button", { type: "button", "aria-label": l.bookmark, className: "inline-flex min-h-11 min-w-11 flex-col items-center gap-1", children: [_jsx("div", { className: "rounded-full bg-gray-800/50 p-2", children: _jsx(Bookmark, { className: "h-7 w-7" }) }), _jsx("span", { className: "font-semibold text-xs", children: "0" })] }), _jsxs("button", { type: "button", "aria-label": l.share, className: "inline-flex min-h-11 min-w-11 flex-col items-center gap-1", children: [_jsx("div", { className: "rounded-full bg-gray-800/50 p-2", children: _jsx(Share2, { className: "h-7 w-7" }) }), _jsx("span", { className: "font-semibold text-xs", children: l.share })] }), _jsx("div", { className: "mt-2 flex h-11 w-11 animate-spin items-center justify-center rounded-full border-4 border-gray-700 bg-gray-800", children: _jsx("div", { className: "h-4 w-4 rounded-full bg-gray-600" }) })] }), _jsxs("div", { className: "absolute right-16 bottom-0 left-0 p-4", children: [_jsx("p", { className: "mb-1 font-semibold text-[16px]", children: formattedUsername }), editable ? (_jsx(Textarea, { value: content, onChange: (e) => onContentChange?.(e.target.value), placeholder: l.placeholder, className: "min-h-[40px] text-[14px] text-white placeholder:text-gray-400" })) : (_jsx("p", { className: "whitespace-pre-wrap break-words text-[14px]", children: content })), _jsxs("div", { className: "mt-3 flex items-center gap-2", children: [_jsx("svg", { className: "h-3 w-3", viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true", children: _jsx("path", { d: "M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" }) }), _jsx("span", { className: "text-[13px]", children: l.originalSound(displayName) })] })] })] }));
}
