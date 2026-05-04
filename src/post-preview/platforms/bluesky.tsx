'use client';

import { Heart, MessageCircle, MoreHorizontal, Repeat2, Share } from 'lucide-react';
import { cn } from '../../lib/utils.js';
import { Avatar } from '../internal/avatar.js';
import { Textarea } from '../internal/textarea.js';
import type { PostPreviewBaseProps } from '../types.js';

export interface BlueSkyLabels {
  placeholder: string;
  share: string;
  moreOptions: string;
}

export const DEFAULT_BLUESKY_LABELS: BlueSkyLabels = {
  placeholder: "What's up?",
  share: 'Share',
  moreOptions: 'More options',
};

export interface BlueSkyPreviewProps extends PostPreviewBaseProps {
  labels?: Partial<BlueSkyLabels>;
}

/**
 * BlueSky feed-card preview. Auto-formats the username with `.bsky.social`
 * if no domain is present.
 */
export function BlueSkyPreview({
  displayName,
  username,
  avatarUrl,
  content,
  mediaUrls,
  editable = false,
  onContentChange,
  className,
  labels,
}: BlueSkyPreviewProps) {
  const l = { ...DEFAULT_BLUESKY_LABELS, ...labels };
  const handle = username.startsWith('@') ? username.slice(1) : username;
  const formattedHandle = handle.includes('.') ? handle : `${handle}.bsky.social`;

  return (
    <div
      data-slot="post-preview"
      data-platform="bluesky"
      className={cn('@container bg-white p-4 text-gray-900 @[420px]:text-[15px]', className)}
    >
      <div className="flex gap-3">
        <Avatar src={avatarUrl} displayName={displayName} className="h-11 w-11 flex-shrink-0" />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="cursor-pointer font-bold text-[15px] text-gray-900 hover:underline">
                {displayName}
              </span>
              <span className="text-[14px] text-gray-500">@{formattedHandle}</span>
              <span className="text-[14px] text-gray-400">· now</span>
            </div>
            <button
              type="button"
              aria-label={l.moreOptions}
              className="-m-1.5 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full p-1.5 text-gray-400 hover:bg-gray-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          {editable ? (
            <Textarea
              value={content}
              onChange={(e) => onContentChange?.(e.target.value)}
              placeholder={l.placeholder}
              className="mt-1 min-h-[60px] text-[15px] text-gray-900 placeholder:text-gray-500"
            />
          ) : (
            <p className="mt-1 whitespace-pre-wrap break-words text-[15px]">{content}</p>
          )}

          {mediaUrls && mediaUrls.length > 0 && (
            <div
              className={cn(
                'mt-3 overflow-hidden rounded-xl border border-gray-200',
                mediaUrls.length === 1 && 'aspect-video',
                mediaUrls.length === 2 && 'grid grid-cols-2 gap-0.5',
                mediaUrls.length >= 3 && 'grid grid-cols-2 gap-0.5'
              )}
            >
              {mediaUrls.slice(0, 4).map((url, i) => (
                <div
                  key={url}
                  className={cn(
                    'bg-gray-100',
                    mediaUrls.length === 1 && 'aspect-video',
                    mediaUrls.length === 2 && 'aspect-square',
                    mediaUrls.length >= 3 && 'aspect-square'
                  )}
                >
                  <img
                    src={url}
                    alt={`Media ${i + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center gap-1 text-gray-500">
            <button
              type="button"
              aria-label="Comments"
              className="-ml-2 inline-flex min-h-11 min-w-11 items-center gap-1.5 rounded-full p-2 hover:bg-blue-50 hover:text-[#1185FE]"
            >
              <MessageCircle className="h-[18px] w-[18px]" />
              <span className="text-[13px]">0</span>
            </button>
            <button
              type="button"
              aria-label="Repost"
              className="inline-flex min-h-11 min-w-11 items-center gap-1.5 rounded-full p-2 hover:bg-green-50 hover:text-green-600"
            >
              <Repeat2 className="h-[18px] w-[18px]" />
              <span className="text-[13px]">0</span>
            </button>
            <button
              type="button"
              aria-label="Like"
              className="inline-flex min-h-11 min-w-11 items-center gap-1.5 rounded-full p-2 hover:bg-red-50 hover:text-red-500"
            >
              <Heart className="h-[18px] w-[18px]" />
              <span className="text-[13px]">0</span>
            </button>
            <button
              type="button"
              aria-label={l.share}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full p-2 hover:bg-blue-50 hover:text-[#1185FE]"
            >
              <Share className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
