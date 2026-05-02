'use client';

import { Globe, MessageCircle, MoreHorizontal, Share2, ThumbsUp } from 'lucide-react';
import { cn } from '../../lib/utils.js';
import { Avatar } from '../internal/avatar.js';
import { Textarea } from '../internal/textarea.js';
import type { PostPreviewBaseProps } from '../types.js';

/**
 * Facebook preview labels. Override individual entries via the `labels` prop.
 */
export interface FacebookLabels {
  justNow: string;
  placeholder: string;
  comments: (count: number) => string;
  shares: (count: number) => string;
  like: string;
  comment: string;
  share: string;
  moreOptions: string;
}

export const DEFAULT_FACEBOOK_LABELS: FacebookLabels = {
  justNow: 'Just now',
  placeholder: "What's on your mind?",
  comments: (count) => `${count} comments`,
  shares: (count) => `${count} shares`,
  like: 'Like',
  comment: 'Comment',
  share: 'Share',
  moreOptions: 'More options',
};

export interface FacebookPreviewProps extends PostPreviewBaseProps {
  labels?: Partial<FacebookLabels>;
}

/**
 * Facebook feed-card preview. Renders displayName, avatar, content, optional
 * media grid, and the standard Like/Comment/Share footer.
 */
export function FacebookPreview({
  displayName,
  username: _username,
  avatarUrl,
  content,
  mediaUrls,
  editable = false,
  onContentChange,
  className,
  labels,
}: FacebookPreviewProps) {
  const l = { ...DEFAULT_FACEBOOK_LABELS, ...labels };

  return (
    <div
      data-slot="post-preview"
      data-platform="facebook"
      className={cn('@container bg-white text-gray-900 @[420px]:text-[15px]', className)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            <Avatar src={avatarUrl} displayName={displayName} className="h-10 w-10" />
            <div>
              <p className="cursor-pointer font-semibold text-[15px] text-gray-900 hover:underline">
                {displayName}
              </p>
              <div className="flex items-center gap-1 text-[13px] text-gray-500">
                <span>{l.justNow}</span>
                <span>·</span>
                <Globe className="h-3 w-3" aria-hidden="true" />
              </div>
            </div>
          </div>
          <button
            type="button"
            aria-label={l.moreOptions}
            className="-m-2 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full p-2 text-gray-500 hover:bg-gray-100"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>

        {editable ? (
          <Textarea
            value={content}
            onChange={(e) => onContentChange?.(e.target.value)}
            placeholder={l.placeholder}
            className="mt-3 min-h-[60px] text-[15px] text-gray-900 placeholder:text-gray-500"
          />
        ) : (
          <p className="mt-3 whitespace-pre-wrap break-words text-[15px]">{content}</p>
        )}
      </div>

      {mediaUrls && mediaUrls.length > 0 && (
        <div
          className={cn(
            'bg-gray-100',
            mediaUrls.length === 1 && 'aspect-video',
            mediaUrls.length === 2 && 'grid grid-cols-2 gap-0.5',
            mediaUrls.length === 3 && 'grid grid-cols-2 gap-0.5',
            mediaUrls.length >= 4 && 'grid grid-cols-2 gap-0.5'
          )}
        >
          {mediaUrls.slice(0, 4).map((url, i) => (
            <div
              key={url}
              className={cn(
                'relative bg-gray-200',
                mediaUrls.length === 1 && 'aspect-video',
                mediaUrls.length === 2 && 'aspect-square',
                mediaUrls.length === 3 && i === 0 && 'row-span-2',
                mediaUrls.length >= 4 && 'aspect-square'
              )}
            >
              <img
                src={url}
                alt={`Media ${i + 1}`}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
              {mediaUrls.length > 4 && i === 3 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <span className="font-semibold text-2xl text-white">+{mediaUrls.length - 4}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-2 text-[13px] text-gray-500">
        <div className="flex items-center gap-1">
          <div className="flex -space-x-1">
            <div className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#1877F2]">
              <ThumbsUp className="h-2.5 w-2.5 text-white" fill="currentColor" />
            </div>
            <div className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-red-500">
              <span className="text-[10px]" aria-hidden="true">
                ♥
              </span>
            </div>
          </div>
          <span>0</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{l.comments(0)}</span>
          <span>{l.shares(0)}</span>
        </div>
      </div>

      <div className="mx-4 border-gray-200 border-t" />

      <div className="flex items-center justify-around px-2 py-1">
        <button
          type="button"
          className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg py-2 text-gray-600 hover:bg-gray-100"
        >
          <ThumbsUp className="h-5 w-5" />
          <span className="font-semibold text-[15px]">{l.like}</span>
        </button>
        <button
          type="button"
          className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg py-2 text-gray-600 hover:bg-gray-100"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="font-semibold text-[15px]">{l.comment}</span>
        </button>
        <button
          type="button"
          className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg py-2 text-gray-600 hover:bg-gray-100"
        >
          <Share2 className="h-5 w-5" />
          <span className="font-semibold text-[15px]">{l.share}</span>
        </button>
      </div>
    </div>
  );
}
