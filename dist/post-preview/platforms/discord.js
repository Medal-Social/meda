'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MoreHorizontal, Plus, Smile } from 'lucide-react';
import { cn } from '../../lib/utils.js';
import { Avatar } from '../internal/avatar.js';
import { Textarea } from '../internal/textarea.js';
export const DEFAULT_DISCORD_LABELS = {
    placeholder: 'Message #channel',
    timestamp: 'Today at 12:00 PM',
    embedsSuppressed: 'Embeds are hidden in this preview.',
    reply: 'React',
    close: 'Close',
    moreOptions: 'More options',
    addReaction: 'Add reaction',
};
/**
 * Discord channel message preview. Renders the user message followed by
 * any embeds (unless `suppressEmbeds` is true).
 */
export function DiscordPreview({ displayName, username: _username, avatarUrl, content, mediaUrls, editable = false, onContentChange, className, labels, embeds, suppressEmbeds, }) {
    const l = { ...DEFAULT_DISCORD_LABELS, ...labels };
    const visibleEmbeds = (embeds ?? []).filter((embed) => [embed.title, embed.description, embed.url, embed.imageUrl].some((field) => typeof field === 'string' && field.trim().length > 0));
    return (_jsx("div", { "data-slot": "post-preview", "data-platform": "discord", className: cn('@container min-h-[150px] bg-white text-[#313338] @[420px]:text-[15px]', className), children: _jsxs("div", { className: "group relative px-4 py-1 hover:bg-[#F2F3F5]", children: [_jsxs("div", { className: "-top-4 absolute right-4 hidden items-center rounded border border-[#DDDEE1] bg-white shadow-lg group-hover:flex", children: [_jsx("button", { type: "button", "aria-label": l.reply, className: "p-1.5 text-[#747681] hover:bg-[#F2F3F5] hover:text-[#313338]", children: _jsx(Smile, { className: "h-5 w-5" }) }), _jsx("button", { type: "button", "aria-label": l.moreOptions, className: "p-1.5 text-[#747681] hover:bg-[#F2F3F5] hover:text-[#313338]", children: _jsx(MoreHorizontal, { className: "h-5 w-5" }) })] }), _jsxs("div", { className: "flex gap-4 py-0.5", children: [_jsx(Avatar, { src: avatarUrl, displayName: displayName, className: "mt-0.5 h-10 w-10 flex-shrink-0" }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsxs("div", { className: "flex items-baseline gap-2", children: [_jsx("span", { className: "cursor-pointer font-medium text-[#060607] text-[15px] hover:underline", children: displayName }), _jsx("span", { className: "text-[#5C5E66] text-[11px]", children: l.timestamp })] }), editable ? (_jsx(Textarea, { value: content, onChange: (e) => onContentChange?.(e.target.value), placeholder: l.placeholder, className: "mt-0.5 min-h-[40px] text-[#313338] text-[15px] placeholder:text-[#747681]" })) : (_jsx("p", { className: "mt-0.5 whitespace-pre-wrap break-words text-[#313338] text-[15px]", children: content })), mediaUrls && mediaUrls.length > 0 && (_jsx("div", { className: "mt-2 max-w-md", children: _jsx("div", { className: cn('overflow-hidden rounded', mediaUrls.length === 1 && 'max-w-[400px]', mediaUrls.length >= 2 && 'grid max-w-[400px] grid-cols-2 gap-1'), children: mediaUrls.slice(0, 4).map((url, i) => (_jsx("div", { className: cn('overflow-hidden rounded bg-[#F2F3F5]', mediaUrls.length === 1 && 'aspect-video', mediaUrls.length >= 2 && 'aspect-square'), children: _jsx("img", { src: url, alt: `Media ${i + 1}`, loading: "lazy", decoding: "async", className: "h-full w-full cursor-pointer object-cover hover:opacity-90" }) }, url))) }) })), !suppressEmbeds && visibleEmbeds.length > 0 && (_jsx("div", { "data-slot": "discord-embeds", className: "mt-3 flex max-w-[520px] flex-col gap-2", children: visibleEmbeds.map((embed, index) => (_jsx(DiscordEmbedCard, { embed: embed }, embedKey(embed, index)))) })), suppressEmbeds && (_jsx("p", { "data-slot": "discord-embeds-suppressed", className: "mt-2 text-[#5C5E66] text-xs", children: l.embedsSuppressed })), _jsxs("div", { className: "mt-2 flex items-center gap-1", children: [_jsxs("button", { type: "button", className: "flex items-center gap-1 rounded border border-transparent bg-[#F2F3F5] px-2 py-0.5 text-[14px] hover:border-[#5865F2] hover:bg-[#E8E9EB]", children: [_jsx("span", { "aria-hidden": "true", children: "\uD83D\uDC4D" }), _jsx("span", { className: "text-[#5C5E66] text-[12px]", children: "1" })] }), _jsx("button", { type: "button", "aria-label": l.addReaction, className: "inline-flex h-6 w-6 items-center justify-center rounded border border-transparent bg-[#F2F3F5] hover:border-[#5865F2] hover:bg-[#E8E9EB]", children: _jsx(Plus, { className: "h-4 w-4 text-[#747681]" }) })] })] })] })] }) }));
}
function embedKey(embed, index) {
    return `${embed.title ?? ''}::${embed.url ?? ''}::${embed.imageUrl ?? ''}::${index}`;
}
function DiscordEmbedCard({ embed }) {
    const accent = typeof embed.color === 'number' ? `#${embed.color.toString(16).padStart(6, '0')}` : '#5865f2';
    const href = embed.url?.trim();
    return (_jsxs("div", { "data-slot": "discord-embed", className: "overflow-hidden rounded-md border border-[#DDDEE1] border-l-4 bg-[#F2F3F5]", style: { borderLeftColor: accent }, children: [_jsxs("div", { className: "p-3", children: [embed.title ? (_jsx("p", { className: "font-medium text-[#060607] text-sm", children: href ? (_jsx("a", { href: href, target: "_blank", rel: "noreferrer", className: "hover:underline", children: embed.title })) : (embed.title) })) : null, embed.description ? (_jsx("p", { className: "mt-1 whitespace-pre-wrap text-[#313338] text-sm", children: embed.description })) : null, href ? _jsx("p", { className: "mt-2 truncate text-[#0068e0] text-xs", children: href }) : null] }), embed.imageUrl ? (_jsx("img", { src: embed.imageUrl, alt: embed.title ?? 'Discord embed', loading: "lazy", decoding: "async", className: "w-full object-cover" })) : null] }));
}
