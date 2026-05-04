'use client';

import { Bookmark, Heart, MessageCircle, Share2 } from 'lucide-react';
import { cn } from '../../lib/utils.js';
import { Avatar } from '../internal/avatar.js';
import { Textarea } from '../internal/textarea.js';
import type { PostPreviewBaseProps } from '../types.js';

export interface TikTokLabels {
  placeholder: string;
  share: string;
  originalSound: (name: string) => string;
  like: string;
  comment: string;
  bookmark: string;
}

export const DEFAULT_TIKTOK_LABELS: TikTokLabels = {
  placeholder: 'Add a caption...',
  share: 'Share',
  originalSound: (name) => `Original sound - ${name}`,
  like: 'Like',
  comment: 'Comment',
  bookmark: 'Bookmark',
};

export interface TikTokPreviewProps extends PostPreviewBaseProps {
  labels?: Partial<TikTokLabels>;
}

/**
 * TikTok video-overlay preview. Always renders against a dark background to
 * match the platform's video-first UI.
 */
/* v8 ignore next 10 — v8 phantom duplicate function record */
export function TikTokPreview({
  displayName,
  username,
  avatarUrl,
  content,
  editable = false,
  onContentChange,
  className,
  labels,
}: TikTokPreviewProps) {
  const l = { ...DEFAULT_TIKTOK_LABELS, ...labels };
  const formattedUsername = username.startsWith('@') ? username : `@${username}`;
  /* v8 ignore next — v8 phantom duplicate function body record */
  return (
    <div
      data-slot="post-preview"
      data-platform="tiktok"
      className={cn(
        '@container relative min-h-[300px] bg-black text-white @[420px]:min-h-[420px]',
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      <div className="absolute right-3 bottom-20 flex flex-col items-center gap-4">
        <div className="flex flex-col items-center gap-1">
          <Avatar
            src={avatarUrl}
            displayName={displayName}
            className="h-11 w-11 ring-2 ring-white"
          />
          <div className="-mt-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#FE2C55]">
            <span className="font-bold text-white text-xs" aria-hidden="true">
              +
            </span>
          </div>
        </div>

        <button
          type="button"
          aria-label={l.like}
          className="inline-flex min-h-11 min-w-11 flex-col items-center gap-1"
        >
          <div className="rounded-full bg-gray-800/50 p-2">
            <Heart className="h-7 w-7" fill="white" />
          </div>
          <span className="font-semibold text-xs">0</span>
        </button>

        <button
          type="button"
          aria-label={l.comment}
          className="inline-flex min-h-11 min-w-11 flex-col items-center gap-1"
        >
          <div className="rounded-full bg-gray-800/50 p-2">
            <MessageCircle className="h-7 w-7" fill="white" />
          </div>
          <span className="font-semibold text-xs">0</span>
        </button>

        <button
          type="button"
          aria-label={l.bookmark}
          className="inline-flex min-h-11 min-w-11 flex-col items-center gap-1"
        >
          <div className="rounded-full bg-gray-800/50 p-2">
            <Bookmark className="h-7 w-7" />
          </div>
          <span className="font-semibold text-xs">0</span>
        </button>

        <button
          type="button"
          aria-label={l.share}
          className="inline-flex min-h-11 min-w-11 flex-col items-center gap-1"
        >
          <div className="rounded-full bg-gray-800/50 p-2">
            <Share2 className="h-7 w-7" />
          </div>
          <span className="font-semibold text-xs">{l.share}</span>
        </button>

        <div className="mt-2 flex h-11 w-11 animate-spin items-center justify-center rounded-full border-4 border-gray-700 bg-gray-800">
          <div className="h-4 w-4 rounded-full bg-gray-600" />
        </div>
      </div>

      <div className="absolute right-16 bottom-0 left-0 p-4">
        <p className="mb-1 font-semibold text-[16px]">{formattedUsername}</p>

        {editable ? (
          <Textarea
            value={content}
            onChange={(e) => onContentChange?.(e.target.value)}
            placeholder={l.placeholder}
            className="min-h-[40px] text-[14px] text-white placeholder:text-gray-400"
          />
        ) : (
          <p className="whitespace-pre-wrap break-words text-[14px]">{content}</p>
        )}

        <div className="mt-3 flex items-center gap-2">
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
          <span className="text-[13px]">{l.originalSound(displayName)}</span>
        </div>
      </div>
    </div>
  );
}
