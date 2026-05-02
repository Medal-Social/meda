'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Globe, MessageSquare, MoreHorizontal, Repeat2, Send, ThumbsUp } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { cn } from '../../lib/utils.js';
import { Avatar } from '../internal/avatar.js';
import { Textarea } from '../internal/textarea.js';
export const DEFAULT_LINKEDIN_LABELS = {
    placeholder: 'Share your thoughts...',
    now: 'now',
    moreOptions: 'More options',
    comments: (count) => `${count} comments`,
    reposts: (count) => `${count} reposts`,
    like: 'Like',
    comment: 'Comment',
    repost: 'Repost',
    send: 'Send',
};
function useLinkedInMentionTrigger(textareaRef, value, onChange, mentions, onMentionsChange) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const triggerStartRef = useRef(null);
    const close = useCallback(() => {
        setIsOpen(false);
        setQuery('');
        triggerStartRef.current = null;
    }, []);
    const handleInput = useCallback(() => {
        const ta = textareaRef.current;
        if (!ta)
            return;
        const cursor = ta.selectionStart ?? 0;
        const text = ta.value;
        let i = cursor - 1;
        let foundAt = -1;
        while (i >= 0) {
            const ch = text[i];
            if (ch === '@') {
                if (i === 0 || /\s/.test(text[i - 1]))
                    foundAt = i;
                break;
            }
            if (/\s/.test(ch))
                break;
            i -= 1;
        }
        if (foundAt === -1) {
            if (isOpen)
                close();
            return;
        }
        triggerStartRef.current = foundAt;
        setQuery(text.slice(foundAt + 1, cursor));
        setIsOpen(true);
    }, [textareaRef, isOpen, close]);
    const insertMention = useCallback((picked) => {
        const ta = textareaRef.current;
        if (!ta)
            return;
        const start = triggerStartRef.current;
        if (start === null)
            return;
        const cursor = ta.selectionStart ?? 0;
        const before = value.slice(0, start);
        const after = value.slice(cursor);
        const next = `${before}${picked.name} ${after}`;
        onChange?.(next);
        const span = {
            ...picked,
            offset: start,
            length: picked.name.length,
        };
        onMentionsChange?.([...mentions, span]);
        close();
    }, [textareaRef, value, onChange, mentions, onMentionsChange, close]);
    return { isOpen, query, close, insertMention, handleInput };
}
function MentionedContent({ text, mentions }) {
    if (!mentions || mentions.length === 0) {
        return _jsx("span", { className: "whitespace-pre-wrap break-words text-[14px]", children: text });
    }
    // Sort spans by offset and render alternating plain/highlight segments.
    const sorted = [...mentions].sort((a, b) => a.offset - b.offset);
    const segments = [];
    let cursor = 0;
    sorted.forEach((mention, idx) => {
        if (mention.offset > cursor) {
            segments.push({
                key: `t-${cursor}`,
                isMention: false,
                value: text.slice(cursor, mention.offset),
            });
        }
        const end = mention.offset + mention.length;
        segments.push({
            key: `m-${idx}-${mention.urn}`,
            isMention: true,
            value: text.slice(mention.offset, end),
        });
        cursor = end;
    });
    if (cursor < text.length) {
        segments.push({ key: `t-${cursor}`, isMention: false, value: text.slice(cursor) });
    }
    return (_jsx("span", { className: "whitespace-pre-wrap break-words text-[14px]", children: segments.map((seg) => seg.isMention ? (_jsx("span", { "data-slot": "linkedin-mention", className: "font-semibold text-[#0A66C2]", children: seg.value }, seg.key)) : (_jsx("span", { children: seg.value }, seg.key))) }));
}
/**
 * LinkedIn feed-card preview. Renders avatar, name, headline (`username`),
 * content with optional `@mention` highlight spans, media grid, and the
 * standard Like/Comment/Repost/Send footer.
 */
export function LinkedInPreview({ displayName, username, avatarUrl, content, mediaUrls, editable = false, onContentChange, className, labels, mentions = [], onMentionsChange, renderMentionPicker, }) {
    const l = { ...DEFAULT_LINKEDIN_LABELS, ...labels };
    const textareaRef = useRef(null);
    const mention = useLinkedInMentionTrigger(textareaRef, content, onContentChange, mentions, onMentionsChange);
    return (_jsxs("div", { "data-slot": "post-preview", "data-platform": "linkedin", className: cn('@container bg-white text-gray-900 @[420px]:text-[15px]', className), children: [_jsxs("div", { className: "p-4 pb-0", children: [_jsxs("div", { className: "flex gap-3", children: [_jsx(Avatar, { src: avatarUrl, displayName: displayName, className: "h-12 w-12 flex-shrink-0" }), _jsx("div", { className: "min-w-0 flex-1", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold text-[14px] text-gray-900", children: displayName }), _jsx("p", { className: "line-clamp-1 text-[12px] text-gray-500", children: username }), _jsxs("div", { className: "flex items-center gap-1 text-[12px] text-gray-500", children: [_jsx("span", { children: l.now }), _jsx("span", { children: "\u00B7" }), _jsx(Globe, { className: "h-3 w-3", "aria-hidden": "true" })] })] }), _jsx("button", { type: "button", "aria-label": l.moreOptions, className: "-m-1.5 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full p-1.5 text-gray-500 hover:bg-gray-100", children: _jsx(MoreHorizontal, { className: "h-5 w-5" }) })] }) })] }), editable ? (_jsxs("div", { className: "relative", children: [_jsx(Textarea, { ref: textareaRef, value: content, onChange: (e) => onContentChange?.(e.target.value), onInput: mention.handleInput, onKeyUp: mention.handleInput, placeholder: l.placeholder, className: cn('mt-3 min-h-[80px] text-[14px] text-gray-900 placeholder:text-gray-500') }), renderMentionPicker && mention.isOpen
                                ? renderMentionPicker({
                                    query: mention.query,
                                    onPick: mention.insertMention,
                                    onCancel: mention.close,
                                })
                                : null] })) : (_jsx("p", { className: "mt-3", children: _jsx(MentionedContent, { text: content, mentions: mentions }) }))] }), mediaUrls && mediaUrls.length > 0 && (_jsx("div", { className: "mt-3", children: mediaUrls.length === 1 ? (_jsx("div", { className: "aspect-video bg-gray-100", children: _jsx("img", { src: mediaUrls[0], alt: "Post media", loading: "lazy", decoding: "async", className: "h-full w-full object-cover" }) })) : (_jsx(LinkedInMultiImageGrid, { mediaUrls: mediaUrls })) })), _jsxs("div", { className: "flex items-center justify-between border-gray-200 border-b px-4 py-2 text-[12px] text-gray-500", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsxs("div", { className: "flex -space-x-1", children: [_jsx("span", { role: "img", "aria-label": "Like", className: "inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white", children: _jsx(ThumbsUp, { className: "h-2.5 w-2.5", fill: "currentColor" }) }), _jsx("span", { role: "img", "aria-label": "Love", className: "inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white", children: "\u2665" })] }), _jsx("span", { className: "ml-1", children: "0" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { children: l.comments(0) }), _jsx("span", { children: "\u00B7" }), _jsx("span", { children: l.reposts(0) })] })] }), _jsxs("div", { className: "flex items-center justify-around px-2 py-1", children: [_jsxs("button", { type: "button", className: "flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg py-3 text-gray-600 hover:bg-gray-100", children: [_jsx(ThumbsUp, { className: "h-5 w-5" }), _jsx("span", { className: "font-medium text-[14px]", children: l.like })] }), _jsxs("button", { type: "button", className: "flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg py-3 text-gray-600 hover:bg-gray-100", children: [_jsx(MessageSquare, { className: "h-5 w-5" }), _jsx("span", { className: "font-medium text-[14px]", children: l.comment })] }), _jsxs("button", { type: "button", className: "flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg py-3 text-gray-600 hover:bg-gray-100", children: [_jsx(Repeat2, { className: "h-5 w-5" }), _jsx("span", { className: "font-medium text-[14px]", children: l.repost })] }), _jsxs("button", { type: "button", className: "flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg py-3 text-gray-600 hover:bg-gray-100", children: [_jsx(Send, { className: "h-5 w-5" }), _jsx("span", { className: "font-medium text-[14px]", children: l.send })] })] })] }));
}
function LinkedInMultiImageGrid({ mediaUrls }) {
    if (mediaUrls.length === 3) {
        return (_jsxs("div", { className: "grid gap-0.5", children: [_jsx("div", { className: "aspect-video bg-gray-100", children: _jsx("img", { src: mediaUrls[0], alt: "Media 1", loading: "lazy", decoding: "async", className: "h-full w-full object-cover" }) }), _jsx("div", { className: "grid grid-cols-2 gap-0.5", children: mediaUrls.slice(1, 3).map((url, i) => (_jsx("div", { className: "relative aspect-square bg-gray-100", children: _jsx("img", { src: url, alt: `Media ${i + 2}`, loading: "lazy", decoding: "async", className: "h-full w-full object-cover" }) }, url))) })] }));
    }
    return (_jsx("div", { className: "grid grid-cols-2 gap-0.5", children: mediaUrls.slice(0, 4).map((url, i) => (_jsxs("div", { className: "relative aspect-square bg-gray-100", children: [_jsx("img", { src: url, alt: `Media ${i + 1}`, loading: "lazy", decoding: "async", className: "h-full w-full object-cover" }), i === 3 && mediaUrls.length > 4 && (_jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-black/60", children: _jsxs("span", { className: "font-semibold text-2xl text-white", children: ["+", mediaUrls.length - 4] }) }))] }, url))) }));
}
