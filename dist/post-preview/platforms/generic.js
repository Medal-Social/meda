'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils.js';
import { Avatar } from '../internal/avatar.js';
import { PLATFORM_META } from '../internal/platform-meta.js';
import { Textarea } from '../internal/textarea.js';
export const DEFAULT_GENERIC_LABELS = {
    placeholderTemplate: (platform) => `Write your ${platform} post...`,
    badgeTemplate: (platform) => `${platform} preview`,
    moreOptions: 'More options',
};
function resolvePlatformName(platform) {
    if (platform in PLATFORM_META) {
        return PLATFORM_META[platform].displayName;
    }
    return platform;
}
/**
 * Generic preview. Used as a fallback for any platform without a dedicated
 * component. Layout is intentionally neutral so it composes well inside
 * `PlatformChrome` if a consumer wants to add device framing.
 */
export function GenericPreview({ platform, displayName, username, avatarUrl, content, mediaUrls, editable = false, onContentChange, className, labels, }) {
    const l = { ...DEFAULT_GENERIC_LABELS, ...labels };
    const platformName = resolvePlatformName(platform);
    return (_jsxs("div", { "data-slot": "post-preview", "data-platform": "generic", "data-generic-platform": platform, className: cn('@container bg-white p-4 text-gray-900 @[420px]:text-[14px] dark:bg-neutral-950 dark:text-neutral-100', className), children: [_jsxs("div", { className: "flex gap-3", children: [_jsx(Avatar, { src: avatarUrl, displayName: displayName, className: "h-10 w-10 flex-shrink-0" }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsxs("div", { className: "flex items-center justify-between gap-2", children: [_jsxs("div", { className: "flex min-w-0 items-center gap-2", children: [_jsx("span", { className: "truncate font-semibold text-[14px]", children: displayName }), _jsxs("span", { className: "truncate text-[13px] text-gray-500", children: ["@", username] })] }), _jsx("button", { type: "button", "aria-label": l.moreOptions, className: "-m-1.5 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800", children: _jsx(MoreHorizontal, { className: "h-4 w-4" }) })] }), editable ? (_jsx(Textarea, { value: content, onChange: (e) => onContentChange?.(e.target.value), placeholder: l.placeholderTemplate(platformName), className: "mt-2 min-h-[60px] text-[14px] placeholder:text-gray-500" })) : (_jsx("p", { className: "mt-2 whitespace-pre-wrap break-words text-[14px]", children: content })), mediaUrls && mediaUrls.length > 0 && (_jsx("div", { className: "mt-3 overflow-hidden rounded-lg", children: mediaUrls.length === 1 ? (_jsx("div", { className: "aspect-video bg-gray-200", children: _jsx("img", { src: mediaUrls[0], alt: "Post media", loading: "lazy", decoding: "async", className: "h-full w-full object-cover" }) })) : (_jsx("div", { className: "grid grid-cols-2 gap-1", children: mediaUrls.slice(0, 4).map((url, i) => (_jsx("div", { className: "aspect-square bg-gray-200", children: _jsx("img", { src: url, alt: `Media ${i + 1}`, loading: "lazy", decoding: "async", className: "h-full w-full object-cover" }) }, url))) })) }))] })] }), _jsx("div", { className: "mt-3 border-gray-200 border-t pt-3 dark:border-neutral-800", children: _jsx("p", { className: "text-gray-500 text-xs", children: l.badgeTemplate(platformName) }) })] }));
}
