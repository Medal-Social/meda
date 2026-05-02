'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Bookmark, ChevronLeft, ChevronRight, Heart, MessageCircle, MoreHorizontal, Music, Send, } from 'lucide-react';
import { useCallback, useState } from 'react';
import { cn } from '../../lib/utils.js';
import { Avatar } from '../internal/avatar.js';
import { Textarea } from '../internal/textarea.js';
import { useSwipe } from '../internal/use-swipe.js';
export const DEFAULT_INSTAGRAM_LABELS = {
    placeholder: 'Write a caption...',
    justNow: 'Just now',
    likes: (count) => `${count} likes`,
    addImage: 'Add an image to preview',
    moreOptions: 'More options',
    like: 'Like',
    comment: 'Comment',
    share: 'Share',
    save: 'Save',
    carouselPrev: 'Previous slide',
    carouselNext: 'Next slide',
    carouselCounter: (current, total) => `${current} / ${total}`,
    reelLabel: 'Reels',
    reelAudio: 'Original audio',
    storyLabel: 'Story',
    storySendMessage: 'Send message',
};
/**
 * Instagram preview supporting Feed / Carousel / Reel / Story layouts.
 * Auto-detects `carousel` when more than one media URL is present.
 */
export function InstagramPreview({ displayName, username, avatarUrl, content, mediaUrls, editable = false, onContentChange, className, labels, instagramPostType, }) {
    const l = { ...DEFAULT_INSTAGRAM_LABELS, ...labels };
    const formattedUsername = username.startsWith('@') ? username.slice(1) : username;
    const hasMedia = mediaUrls !== undefined && mediaUrls.length > 0;
    const postType = instagramPostType ?? (mediaUrls && mediaUrls.length > 1 ? 'carousel' : 'feed');
    if (postType === 'reel') {
        return (_jsx(ReelPreview, { displayName: displayName, username: formattedUsername, avatarUrl: avatarUrl, content: content, mediaUrl: hasMedia ? mediaUrls[0] : undefined, labels: l, className: className }));
    }
    if (postType === 'story') {
        return (_jsx(StoryPreview, { displayName: displayName, username: formattedUsername, avatarUrl: avatarUrl, mediaUrl: hasMedia ? mediaUrls[0] : undefined, labels: l, className: className }));
    }
    return (_jsx(FeedPreview, { displayName: displayName, username: formattedUsername, avatarUrl: avatarUrl, content: content, mediaUrls: mediaUrls, editable: editable, onContentChange: onContentChange, isCarousel: postType === 'carousel', labels: l, className: className }));
}
// ---------------------------------------------------------------------------
// Feed / Carousel layout
// ---------------------------------------------------------------------------
function FeedPreview({ displayName, username, avatarUrl, content, mediaUrls, editable, onContentChange, isCarousel, labels, className, }) {
    const hasMedia = mediaUrls !== undefined && mediaUrls.length > 0;
    const [carouselIndex, setCarouselIndex] = useState(0);
    const goToPrev = useCallback(() => {
        setCarouselIndex((prev) => Math.max(0, prev - 1));
    }, []);
    const goToNext = useCallback(() => {
        if (!mediaUrls)
            return;
        setCarouselIndex((prev) => Math.min(mediaUrls.length - 1, prev + 1));
    }, [mediaUrls]);
    const swipe = useSwipe({ onSwipeLeft: goToNext, onSwipeRight: goToPrev });
    return (_jsxs("div", { "data-slot": "post-preview", "data-platform": "instagram", "data-instagram-post-type": isCarousel ? 'carousel' : 'feed', className: cn('@container bg-white text-gray-900 @[420px]:text-[15px]', className), children: [_jsxs("div", { className: "flex items-center justify-between p-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Avatar, { src: avatarUrl, displayName: displayName, className: "h-8 w-8 ring-2 ring-pink-500 ring-offset-2" }), _jsx("p", { className: "font-semibold text-[14px]", children: username })] }), _jsx("button", { type: "button", "aria-label": labels.moreOptions, className: "-m-2 inline-flex min-h-11 min-w-11 items-center justify-center p-2", children: _jsx(MoreHorizontal, { className: "h-5 w-5" }) })] }), hasMedia ? (_jsxs("div", { "data-slot": "instagram-carousel-track", className: "relative aspect-square bg-gray-100", ...swipe, children: [_jsx("img", { src: mediaUrls[isCarousel ? carouselIndex : 0], alt: "Post", loading: "lazy", decoding: "async", className: "h-full w-full object-cover" }), isCarousel && mediaUrls.length > 1 && (_jsxs(_Fragment, { children: [carouselIndex > 0 && (_jsx("button", { type: "button", onClick: goToPrev, "aria-label": labels.carouselPrev, className: "-translate-y-1/2 absolute top-1/2 left-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70", children: _jsx(ChevronLeft, { className: "h-4 w-4" }) })), carouselIndex < mediaUrls.length - 1 && (_jsx("button", { type: "button", onClick: goToNext, "aria-label": labels.carouselNext, className: "-translate-y-1/2 absolute top-1/2 right-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70", children: _jsx(ChevronRight, { className: "h-4 w-4" }) })), _jsx("div", { className: "absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-0.5 font-medium text-white text-xs", children: labels.carouselCounter(carouselIndex + 1, mediaUrls.length) }), _jsxs("div", { className: "-translate-x-1/2 absolute bottom-4 left-1/2 flex gap-1", children: [mediaUrls.slice(0, 5).map((url, i) => (_jsx("span", { role: "img", "aria-label": `Go to slide ${i + 1}`, ...(i === carouselIndex ? { 'aria-current': 'true' } : {}), className: cn('h-1.5 w-1.5 rounded-full transition-colors', i === carouselIndex ? 'bg-blue-500' : 'bg-white/60') }, url))), mediaUrls.length > 5 && (_jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-white/40", "aria-hidden": "true" }))] })] }))] })) : (_jsx(MediaPlaceholder, { label: labels.addImage })), _jsxs("div", { className: "p-3", children: [_jsxs("div", { className: "mb-3 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("button", { type: "button", "aria-label": labels.like, className: "-m-1 inline-flex min-h-11 min-w-11 items-center justify-center p-1 hover:opacity-60", children: _jsx(Heart, { className: "h-6 w-6" }) }), _jsx("button", { type: "button", "aria-label": labels.comment, className: "-m-1 inline-flex min-h-11 min-w-11 items-center justify-center p-1 hover:opacity-60", children: _jsx(MessageCircle, { className: "-scale-x-100 h-6 w-6" }) }), _jsx("button", { type: "button", "aria-label": labels.share, className: "-m-1 inline-flex min-h-11 min-w-11 items-center justify-center p-1 hover:opacity-60", children: _jsx(Send, { className: "-rotate-12 h-6 w-6" }) })] }), _jsx("button", { type: "button", "aria-label": labels.save, className: "-m-1 inline-flex min-h-11 min-w-11 items-center justify-center p-1 hover:opacity-60", children: _jsx(Bookmark, { className: "h-6 w-6" }) })] }), _jsx("p", { className: "mb-1 font-semibold text-[14px]", children: labels.likes(0) }), _jsxs("div", { className: "text-[14px]", children: [_jsx("span", { className: "mr-1 font-semibold", children: username }), editable ? (_jsx(Textarea, { value: content, onChange: (e) => onContentChange?.(e.target.value), placeholder: labels.placeholder, className: "mt-1 inline min-h-[40px] w-full text-[14px] text-gray-900 placeholder:text-gray-500" })) : (_jsx("span", { className: "whitespace-pre-wrap break-words", children: content }))] }), _jsx("p", { className: "mt-2 text-[10px] text-gray-400 uppercase tracking-wide", children: labels.justNow })] })] }));
}
// ---------------------------------------------------------------------------
// Reel layout
// ---------------------------------------------------------------------------
function ReelPreview({ displayName, username, avatarUrl, content, mediaUrl, labels, className, }) {
    return (_jsxs("div", { "data-slot": "post-preview", "data-platform": "instagram", "data-instagram-post-type": "reel", className: cn('@container relative aspect-[9/16] overflow-hidden rounded-lg bg-black @[420px]:rounded-xl', className), children: [mediaUrl ? (_jsx("img", { src: mediaUrl, alt: "Reel", loading: "lazy", decoding: "async", className: "h-full w-full object-cover" })) : (_jsx("div", { className: "flex h-full w-full items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900", children: _jsxs("div", { className: "text-center text-gray-500", children: [_jsx("div", { className: "mx-auto mb-2 h-16 w-16 rounded-full border-2 border-gray-600 border-dashed" }), _jsx("p", { className: "text-sm", children: labels.reelLabel })] }) })), _jsx("div", { className: "absolute top-4 right-3 font-semibold text-sm text-white drop-shadow-lg", children: labels.reelLabel }), _jsxs("div", { className: "absolute right-3 bottom-20 flex flex-col items-center gap-5", children: [_jsxs("button", { type: "button", "aria-label": labels.like, className: "inline-flex min-h-11 min-w-11 flex-col items-center gap-0.5", children: [_jsx(Heart, { className: "h-7 w-7 text-white drop-shadow-lg" }), _jsx("span", { className: "text-[11px] text-white drop-shadow-lg", children: "0" })] }), _jsxs("button", { type: "button", "aria-label": labels.comment, className: "inline-flex min-h-11 min-w-11 flex-col items-center gap-0.5", children: [_jsx(MessageCircle, { className: "-scale-x-100 h-7 w-7 text-white drop-shadow-lg" }), _jsx("span", { className: "text-[11px] text-white drop-shadow-lg", children: "0" })] }), _jsx("button", { type: "button", "aria-label": labels.share, className: "inline-flex min-h-11 min-w-11 flex-col items-center gap-0.5", children: _jsx(Send, { className: "-rotate-12 h-7 w-7 text-white drop-shadow-lg" }) }), _jsx("button", { type: "button", "aria-label": labels.moreOptions, className: "inline-flex min-h-11 min-w-11 flex-col items-center gap-0.5", children: _jsx(MoreHorizontal, { className: "h-7 w-7 text-white drop-shadow-lg" }) }), _jsx(Avatar, { src: avatarUrl, displayName: displayName, className: "h-8 w-8 rounded-md border-2 border-white/40" })] }), _jsxs("div", { className: "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 pb-5", children: [_jsxs("div", { className: "mb-2 flex items-center gap-2", children: [_jsx(Avatar, { src: avatarUrl, displayName: displayName, className: "h-8 w-8" }), _jsx("span", { className: "font-semibold text-sm text-white", children: username })] }), content ? _jsx("p", { className: "line-clamp-2 text-sm text-white/90", children: content }) : null, _jsxs("div", { className: "mt-3 flex items-center gap-2", children: [_jsx(Music, { className: "h-3 w-3 text-white/80", "aria-hidden": "true" }), _jsxs("p", { className: "flex-1 truncate text-white/80 text-xs", children: [labels.reelAudio, " \u00B7 ", username] })] })] })] }));
}
// ---------------------------------------------------------------------------
// Story layout
// ---------------------------------------------------------------------------
function StoryPreview({ displayName, username, avatarUrl, mediaUrl, labels, className, }) {
    return (_jsxs("div", { "data-slot": "post-preview", "data-platform": "instagram", "data-instagram-post-type": "story", className: cn('@container relative aspect-[9/16] overflow-hidden rounded-lg bg-black @[420px]:rounded-xl', className), children: [mediaUrl ? (_jsx("img", { src: mediaUrl, alt: "Story", loading: "lazy", decoding: "async", className: "h-full w-full object-cover" })) : (_jsx("div", { className: "flex h-full w-full items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900", children: _jsxs("div", { className: "text-center text-gray-500", children: [_jsx("div", { className: "mx-auto mb-2 h-16 w-16 rounded-full border-2 border-gray-600 border-dashed" }), _jsx("p", { className: "text-sm", children: labels.storyLabel })] }) })), _jsx("div", { className: "absolute inset-x-0 top-0 px-2 pt-2", children: _jsx("div", { className: "h-0.5 w-full overflow-hidden rounded-full bg-white/30", children: _jsx("div", { className: "h-full w-1/3 rounded-full bg-white" }) }) }), _jsxs("div", { className: "absolute inset-x-0 top-3 flex items-center gap-2 px-4 pt-1", children: [_jsx(Avatar, { src: avatarUrl, displayName: displayName, className: "h-8 w-8 ring-2 ring-white/60" }), _jsx("span", { className: "font-semibold text-sm text-white drop-shadow-lg", children: username }), _jsx("span", { className: "text-white/70 text-xs drop-shadow-lg", children: labels.justNow }), _jsx("div", { className: "ml-auto", children: _jsx(MoreHorizontal, { className: "h-5 w-5 text-white drop-shadow-lg", "aria-hidden": "true" }) })] }), _jsx("div", { className: "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4 pt-8", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex-1 rounded-full border border-white/40 px-4 py-2", children: _jsx("span", { className: "text-sm text-white/60", children: labels.storySendMessage }) }), _jsx(Heart, { className: "h-6 w-6 text-white", "aria-hidden": "true" }), _jsx(Send, { className: "-rotate-12 h-6 w-6 text-white", "aria-hidden": "true" })] }) })] }));
}
// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------
function MediaPlaceholder({ label }) {
    return (_jsx("div", { className: "flex aspect-square items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200", children: _jsxs("div", { className: "text-center text-gray-400", children: [_jsx("svg", { className: "mx-auto mb-2 h-16 w-16", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", "aria-hidden": "true", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1, d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" }) }), _jsx("p", { className: "text-sm", children: label })] }) }));
}
