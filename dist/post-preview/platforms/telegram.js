'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Eye, Pin, Share2 } from 'lucide-react';
import { cn } from '../../lib/utils.js';
import { Avatar } from '../internal/avatar.js';
import { Textarea } from '../internal/textarea.js';
export const DEFAULT_TELEGRAM_LABELS = {
    placeholder: 'Type a message...',
    pinnedMessage: 'Pinned message',
    share: 'Share',
    buttonFallback: 'Button',
    pollOptionPlaceholder: (number) => `Option ${number}`,
};
/**
 * Telegram channel post preview. Renders a chat bubble with optional
 * poll, pinned indicator, and inline keyboard.
 */
export function TelegramPreview({ displayName, username: _username, avatarUrl, content, mediaUrls, editable = false, onContentChange, className, labels, poll, pinMessage, replyMarkup, }) {
    const l = { ...DEFAULT_TELEGRAM_LABELS, ...labels };
    return (_jsx("div", { "data-slot": "post-preview", "data-platform": "telegram", className: cn('@container min-h-[200px] bg-[#E7EBF0] p-4 text-gray-900 @[420px]:p-5', className), children: _jsxs("div", { className: "max-w-md", children: [_jsxs("div", { className: "mb-2 flex items-center gap-2", children: [_jsx(Avatar, { src: avatarUrl, displayName: displayName, className: "h-8 w-8" }), _jsx("span", { className: "font-medium text-[14px] text-[#168ACD]", children: displayName })] }), _jsxs("div", { className: "overflow-hidden rounded-xl rounded-tl-sm bg-white shadow-sm", children: [pinMessage ? (_jsxs("div", { "data-slot": "telegram-pinned", className: "flex items-center gap-1 border-gray-200 border-b px-3 py-2 text-[11px] text-gray-500", children: [_jsx(Pin, { className: "h-3 w-3", "aria-hidden": "true" }), _jsx("span", { children: l.pinnedMessage })] })) : null, mediaUrls && mediaUrls.length > 0 && (_jsx("div", { className: cn(mediaUrls.length === 1 && 'aspect-video', mediaUrls.length >= 2 && 'grid grid-cols-2 gap-0.5'), children: mediaUrls.slice(0, 4).map((url, i) => (_jsx("div", { className: cn('bg-gray-100', mediaUrls.length === 1 && 'aspect-video', mediaUrls.length >= 2 && 'aspect-square'), children: _jsx("img", { src: url, alt: `Media ${i + 1}`, loading: "lazy", decoding: "async", className: "h-full w-full object-cover" }) }, url))) })), _jsxs("div", { className: "p-3", children: [renderBody({ poll, editable, content, onContentChange, labels: l }), replyMarkup?.inline_keyboard?.length ? (_jsx("div", { className: "mt-3 space-y-1", children: replyMarkup.inline_keyboard.map((row) => {
                                        const rowKey = row
                                            .map((b) => `${b.text}|${b.url ?? b.callbackData ?? ''}`)
                                            .join('::');
                                        return (_jsx("div", { className: "flex gap-1", children: row.map((button) => (_jsx("a", { href: button.url ?? '#', target: "_blank", rel: "noreferrer", className: "flex-1 rounded bg-[#168ACD] px-3 py-1.5 text-center text-white text-xs", children: button.text || l.buttonFallback }, `${button.text}-${button.url ?? button.callbackData ?? ''}`))) }, rowKey));
                                    }) })) : null, _jsxs("div", { className: "mt-2 flex items-center justify-end gap-1 text-[12px] text-gray-500", children: [_jsx(Eye, { className: "h-3 w-3", "aria-hidden": "true" }), _jsx("span", { children: "0" }), _jsx("span", { className: "ml-2", children: "12:00" })] })] })] }), _jsxs("div", { className: "mt-2 flex items-center gap-2", children: [_jsxs("button", { type: "button", className: "inline-flex min-h-11 items-center gap-1 rounded-full bg-white px-3 py-1 text-[13px] shadow-sm", children: [_jsx("span", { "aria-hidden": "true", children: "\uD83D\uDC4D" }), _jsx("span", { className: "text-gray-500", children: "0" })] }), _jsxs("button", { type: "button", className: "inline-flex min-h-11 items-center gap-1 rounded-full bg-white px-3 py-1 text-[13px] shadow-sm", children: [_jsx("span", { "aria-hidden": "true", children: "\u2764\uFE0F" }), _jsx("span", { className: "text-gray-500", children: "0" })] }), _jsx("button", { type: "button", "aria-label": l.share, className: "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white p-1.5 shadow-sm", children: _jsx(Share2, { className: "h-4 w-4 text-gray-500" }) })] })] }) }));
}
function renderBody({ poll, editable, content, onContentChange, labels, }) {
    if (poll) {
        return (_jsxs("div", { "data-slot": "telegram-poll", className: "space-y-2", children: [_jsx("p", { className: "font-medium", children: poll.question }), poll.options.map((option, index) => {
                    // Options can repeat / be empty during composing; combine with stable index in a non-positional way
                    // by counting prior empties so the key remains unique without leaking positional intent.
                    const key = option
                        ? `opt-${option}`
                        : `placeholder-${labels.pollOptionPlaceholder(index + 1)}`;
                    return (_jsx("div", { className: "rounded bg-gray-50 px-3 py-2 text-sm", children: option || labels.pollOptionPlaceholder(index + 1) }, key));
                })] }));
    }
    if (editable) {
        return (_jsx(Textarea, { value: content, onChange: (e) => onContentChange?.(e.target.value), placeholder: labels.placeholder, className: "min-h-[60px] text-[15px] placeholder:text-gray-500" }));
    }
    return _jsx("p", { className: "whitespace-pre-wrap break-words text-[15px]", children: content });
}
