'use client';

import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Music,
  Send,
} from 'lucide-react';
import type { KeyboardEvent } from 'react';
import { useCallback, useState } from 'react';
import { cn } from '../../lib/utils.js';
import { Avatar } from '../internal/avatar.js';
import { Textarea } from '../internal/textarea.js';
import { useSwipe } from '../internal/use-swipe.js';
import type { PostPreviewBaseProps } from '../types.js';

export type InstagramPostType = 'feed' | 'carousel' | 'reel' | 'story';

export interface InstagramLabels {
  placeholder: string;
  justNow: string;
  likes: (count: number) => string;
  addImage: string;
  moreOptions: string;
  like: string;
  comment: string;
  share: string;
  save: string;
  carouselPrev: string;
  carouselNext: string;
  carouselCounter: (current: number, total: number) => string;
  reelLabel: string;
  reelAudio: string;
  storyLabel: string;
  storySendMessage: string;
}

export const DEFAULT_INSTAGRAM_LABELS: InstagramLabels = {
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

export interface InstagramPreviewProps extends PostPreviewBaseProps {
  labels?: Partial<InstagramLabels>;
  /** Override the layout. Auto-detects to `carousel` for >1 media. */
  instagramPostType?: InstagramPostType;
}

/**
 * Instagram preview supporting Feed / Carousel / Reel / Story layouts.
 * Auto-detects `carousel` when more than one media URL is present.
 */
export function InstagramPreview({
  displayName,
  username,
  avatarUrl,
  content,
  mediaUrls,
  editable = false,
  onContentChange,
  className,
  labels,
  instagramPostType,
}: InstagramPreviewProps) {
  const l = { ...DEFAULT_INSTAGRAM_LABELS, ...labels };
  const formattedUsername = username.startsWith('@') ? username.slice(1) : username;
  const hasMedia = mediaUrls !== undefined && mediaUrls.length > 0;

  const postType: InstagramPostType =
    instagramPostType ?? (mediaUrls && mediaUrls.length > 1 ? 'carousel' : 'feed');

  if (postType === 'reel') {
    return (
      <ReelPreview
        displayName={displayName}
        username={formattedUsername}
        avatarUrl={avatarUrl}
        content={content}
        mediaUrl={hasMedia ? mediaUrls[0] : undefined}
        labels={l}
        className={className}
      />
    );
  }

  if (postType === 'story') {
    return (
      <StoryPreview
        displayName={displayName}
        username={formattedUsername}
        avatarUrl={avatarUrl}
        mediaUrl={hasMedia ? mediaUrls[0] : undefined}
        labels={l}
        className={className}
      />
    );
  }

  return (
    <FeedPreview
      displayName={displayName}
      username={formattedUsername}
      avatarUrl={avatarUrl}
      content={content}
      mediaUrls={mediaUrls}
      editable={editable}
      onContentChange={onContentChange}
      isCarousel={postType === 'carousel'}
      labels={l}
      className={className}
    />
  );
}

// ---------------------------------------------------------------------------
// Feed / Carousel layout
// ---------------------------------------------------------------------------

function FeedPreview({
  displayName,
  username,
  avatarUrl,
  content,
  mediaUrls,
  editable,
  onContentChange,
  isCarousel,
  labels,
  className,
}: {
  displayName: string;
  username: string;
  avatarUrl?: string;
  content: string;
  mediaUrls?: string[];
  editable: boolean;
  onContentChange?: (content: string) => void;
  isCarousel: boolean;
  labels: InstagramLabels;
  className?: string;
}) {
  const hasMedia = mediaUrls !== undefined && mediaUrls.length > 0;
  const [carouselIndex, setCarouselIndex] = useState(0);

  const goToPrev = useCallback(() => {
    setCarouselIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goToNext = useCallback(() => {
    if (!mediaUrls) return;
    setCarouselIndex((prev) => Math.min(mediaUrls.length - 1, prev + 1));
  }, [mediaUrls]);

  const swipe = useSwipe({ onSwipeLeft: goToNext, onSwipeRight: goToPrev });

  return (
    <div
      data-slot="post-preview"
      data-platform="instagram"
      data-instagram-post-type={isCarousel ? 'carousel' : 'feed'}
      className={cn(
        '@container bg-white text-gray-900 @[420px]:text-[15px] dark:bg-black dark:text-white',
        className
      )}
    >
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <Avatar
            src={avatarUrl}
            displayName={displayName}
            className="h-8 w-8 ring-2 ring-pink-500 ring-offset-2"
          />
          <p className="font-semibold text-[14px]">{username}</p>
        </div>
        <button
          type="button"
          aria-label={labels.moreOptions}
          className="-m-2 inline-flex min-h-11 min-w-11 items-center justify-center p-2"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      {hasMedia ? (
        <div
          data-slot="instagram-carousel-track"
          className="relative aspect-square bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          style={{ touchAction: 'pan-y' }}
          {...(isCarousel && mediaUrls.length > 1
            ? {
                role: 'region' as const,
                'aria-label': labels.carouselCounter(carouselIndex + 1, mediaUrls.length),
                tabIndex: 0,
                onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
                  if (event.key === 'ArrowLeft') {
                    event.preventDefault();
                    event.stopPropagation();
                    goToPrev();
                  } else if (event.key === 'ArrowRight') {
                    event.preventDefault();
                    event.stopPropagation();
                    goToNext();
                  }
                },
              }
            : {})}
          {...swipe}
        >
          <img
            src={mediaUrls[isCarousel ? carouselIndex : 0]}
            alt="Post"
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />

          {isCarousel && mediaUrls.length > 1 && (
            <>
              {carouselIndex > 0 && (
                <button
                  type="button"
                  onClick={goToPrev}
                  aria-label={labels.carouselPrev}
                  className="-translate-y-1/2 absolute top-1/2 left-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}
              {carouselIndex < mediaUrls.length - 1 && (
                <button
                  type="button"
                  onClick={goToNext}
                  aria-label={labels.carouselNext}
                  className="-translate-y-1/2 absolute top-1/2 right-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
              <div className="absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-0.5 font-medium text-white text-xs">
                {labels.carouselCounter(carouselIndex + 1, mediaUrls.length)}
              </div>
              <div className="-translate-x-1/2 absolute bottom-4 left-1/2 flex gap-1">
                {mediaUrls.slice(0, 5).map((url, i) => (
                  <button
                    key={url}
                    type="button"
                    aria-label={`Go to slide ${i + 1}`}
                    {...(i === carouselIndex ? { 'aria-current': 'true' as const } : {})}
                    onClick={() => setCarouselIndex(i)}
                    className={cn(
                      // Visible dot stays small; expand the touch target via padding so the
                      // hit area is at least 44x44px without breaking the IG visual.
                      'inline-flex min-h-11 min-w-11 items-center justify-center p-2'
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'h-1.5 w-1.5 rounded-full transition-colors',
                        i === carouselIndex ? 'bg-blue-500' : 'bg-white/60'
                      )}
                    />
                  </button>
                ))}
                {mediaUrls.length > 5 && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white/40" aria-hidden="true" />
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <MediaPlaceholder label={labels.addImage} />
      )}

      <div className="p-3">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label={labels.like}
              className="-m-1 inline-flex min-h-11 min-w-11 items-center justify-center p-1 hover:opacity-60"
            >
              <Heart className="h-6 w-6" />
            </button>
            <button
              type="button"
              aria-label={labels.comment}
              className="-m-1 inline-flex min-h-11 min-w-11 items-center justify-center p-1 hover:opacity-60"
            >
              <MessageCircle className="-scale-x-100 h-6 w-6" />
            </button>
            <button
              type="button"
              aria-label={labels.share}
              className="-m-1 inline-flex min-h-11 min-w-11 items-center justify-center p-1 hover:opacity-60"
            >
              <Send className="-rotate-12 h-6 w-6" />
            </button>
          </div>
          <button
            type="button"
            aria-label={labels.save}
            className="-m-1 inline-flex min-h-11 min-w-11 items-center justify-center p-1 hover:opacity-60"
          >
            <Bookmark className="h-6 w-6" />
          </button>
        </div>

        <p className="mb-1 font-semibold text-[14px]">{labels.likes(0)}</p>

        <div className="text-[14px]">
          <span className="mr-1 font-semibold">{username}</span>
          {editable ? (
            <Textarea
              value={content}
              onChange={(e) => onContentChange?.(e.target.value)}
              placeholder={labels.placeholder}
              className="mt-1 inline min-h-[40px] w-full text-[14px] text-gray-900 placeholder:text-gray-500"
            />
          ) : (
            <span className="whitespace-pre-wrap break-words">{content}</span>
          )}
        </div>

        <p className="mt-2 text-[10px] text-gray-400 uppercase tracking-wide">{labels.justNow}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reel layout
// ---------------------------------------------------------------------------

function ReelPreview({
  displayName,
  username,
  avatarUrl,
  content,
  mediaUrl,
  labels,
  className,
}: {
  displayName: string;
  username: string;
  avatarUrl?: string;
  content: string;
  mediaUrl?: string;
  labels: InstagramLabels;
  className?: string;
}) {
  return (
    <div
      data-slot="post-preview"
      data-platform="instagram"
      data-instagram-post-type="reel"
      className={cn(
        '@container relative aspect-[9/16] overflow-hidden rounded-lg bg-black @[420px]:rounded-xl',
        className
      )}
    >
      {mediaUrl ? (
        <img
          src={mediaUrl}
          alt="Reel"
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900">
          <div className="text-center text-gray-500">
            <div className="mx-auto mb-2 h-16 w-16 rounded-full border-2 border-gray-600 border-dashed" />
            <p className="text-sm">{labels.reelLabel}</p>
          </div>
        </div>
      )}

      <div className="absolute top-4 right-3 font-semibold text-sm text-white drop-shadow-lg">
        {labels.reelLabel}
      </div>

      <div className="absolute right-3 bottom-20 flex flex-col items-center gap-5">
        <button
          type="button"
          aria-label={labels.like}
          className="inline-flex min-h-11 min-w-11 flex-col items-center gap-0.5"
        >
          <Heart className="h-7 w-7 text-white drop-shadow-lg" />
          <span className="text-[11px] text-white drop-shadow-lg">0</span>
        </button>
        <button
          type="button"
          aria-label={labels.comment}
          className="inline-flex min-h-11 min-w-11 flex-col items-center gap-0.5"
        >
          <MessageCircle className="-scale-x-100 h-7 w-7 text-white drop-shadow-lg" />
          <span className="text-[11px] text-white drop-shadow-lg">0</span>
        </button>
        <button
          type="button"
          aria-label={labels.share}
          className="inline-flex min-h-11 min-w-11 flex-col items-center gap-0.5"
        >
          <Send className="-rotate-12 h-7 w-7 text-white drop-shadow-lg" />
        </button>
        <button
          type="button"
          aria-label={labels.moreOptions}
          className="inline-flex min-h-11 min-w-11 flex-col items-center gap-0.5"
        >
          <MoreHorizontal className="h-7 w-7 text-white drop-shadow-lg" />
        </button>
        <Avatar
          src={avatarUrl}
          displayName={displayName}
          className="h-8 w-8 rounded-md border-2 border-white/40"
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 pb-5">
        <div className="mb-2 flex items-center gap-2">
          <Avatar src={avatarUrl} displayName={displayName} className="h-8 w-8" />
          <span className="font-semibold text-sm text-white">{username}</span>
        </div>
        {content ? <p className="line-clamp-2 text-sm text-white/90">{content}</p> : null}
        <div className="mt-3 flex items-center gap-2">
          <Music className="h-3 w-3 text-white/80" aria-hidden="true" />
          <p className="flex-1 truncate text-white/80 text-xs">
            {labels.reelAudio} · {username}
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Story layout
// ---------------------------------------------------------------------------

function StoryPreview({
  displayName,
  username,
  avatarUrl,
  mediaUrl,
  labels,
  className,
}: {
  displayName: string;
  username: string;
  avatarUrl?: string;
  mediaUrl?: string;
  labels: InstagramLabels;
  className?: string;
}) {
  return (
    <div
      data-slot="post-preview"
      data-platform="instagram"
      data-instagram-post-type="story"
      className={cn(
        '@container relative aspect-[9/16] overflow-hidden rounded-lg bg-black @[420px]:rounded-xl',
        className
      )}
    >
      {mediaUrl ? (
        <img
          src={mediaUrl}
          alt="Story"
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900">
          <div className="text-center text-gray-500">
            <div className="mx-auto mb-2 h-16 w-16 rounded-full border-2 border-gray-600 border-dashed" />
            <p className="text-sm">{labels.storyLabel}</p>
          </div>
        </div>
      )}

      <div className="absolute inset-x-0 top-0 px-2 pt-2">
        <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/30">
          <div className="h-full w-1/3 rounded-full bg-white" />
        </div>
      </div>

      <div className="absolute inset-x-0 top-3 flex items-center gap-2 px-4 pt-1">
        <Avatar
          src={avatarUrl}
          displayName={displayName}
          className="h-8 w-8 ring-2 ring-white/60"
        />
        <span className="font-semibold text-sm text-white drop-shadow-lg">{username}</span>
        <span className="text-white/70 text-xs drop-shadow-lg">{labels.justNow}</span>
        <div className="ml-auto">
          <MoreHorizontal className="h-5 w-5 text-white drop-shadow-lg" aria-hidden="true" />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4 pt-8">
        <div className="flex items-center gap-3">
          <div className="flex-1 rounded-full border border-white/40 px-4 py-2">
            <span className="text-sm text-white/60">{labels.storySendMessage}</span>
          </div>
          <Heart className="h-6 w-6 text-white" aria-hidden="true" />
          <Send className="-rotate-12 h-6 w-6 text-white" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

function MediaPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="text-center text-gray-400">
        <svg
          className="mx-auto mb-2 h-16 w-16"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-sm">{label}</p>
      </div>
    </div>
  );
}
