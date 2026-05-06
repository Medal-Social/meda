'use client';

import { Heart, MessageCircle, MoreHorizontal, Repeat2, Send } from 'lucide-react';
import { cn } from '../../lib/utils.js';
import { Avatar } from '../internal/avatar.js';
import { Textarea } from '../internal/textarea.js';
import type { PostPreviewBaseProps } from '../types.js';

export interface ThreadsLabels {
  placeholder: string;
  replies: (count: number) => string;
  like: string;
  comment: string;
  repost: string;
  share: string;
  moreOptions: string;
}

export const DEFAULT_THREADS_LABELS: ThreadsLabels = {
  placeholder: 'Start a thread...',
  replies: (count) => `${count} replies`,
  like: 'Like',
  comment: 'Comment',
  repost: 'Repost',
  share: 'Share',
  moreOptions: 'More options',
};

export interface ThreadsPreviewProps extends PostPreviewBaseProps {
  labels?: Partial<ThreadsLabels>;
}

/**
 * Threads feed-card preview. Honors a parent `.dark` class for the dark
 * variant the platform itself uses.
 */
/* v8 ignore next 11 — v8 phantom duplicate function record */
export function ThreadsPreview({
  displayName,
  username,
  avatarUrl,
  content,
  mediaUrls,
  editable = false,
  onContentChange,
  className,
  labels,
}: ThreadsPreviewProps) {
  const l = { ...DEFAULT_THREADS_LABELS, ...labels };
  const formattedUsername = username.startsWith('@') ? username.slice(1) : username;
  /* v8 ignore next — v8 phantom duplicate function body record */
  return (
    <div
      data-slot="post-preview"
      data-platform="threads"
      className={cn(
        '@container bg-white p-4 text-gray-900 @[420px]:text-[15px] dark:bg-[#101010] dark:text-white',
        className
      )}
    >
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <Avatar src={avatarUrl} displayName={displayName} className="h-9 w-9" />
          <div className="mt-2 min-h-[20px] w-0.5 flex-1 bg-gray-200 dark:bg-gray-700" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-[15px]">{formattedUsername}</span>
              <span className="text-[15px] text-gray-500">· now</span>
            </div>
            <button
              type="button"
              aria-label={l.moreOptions}
              className="-m-1.5 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          {editable ? (
            <Textarea
              value={content}
              onChange={(e) => onContentChange?.(e.target.value)}
              placeholder={l.placeholder}
              className="mt-1 min-h-[60px] text-[15px] placeholder:text-gray-500"
            />
          ) : (
            <p className="mt-1 whitespace-pre-wrap break-words text-[15px]">{content}</p>
          )}

          {mediaUrls && mediaUrls.length > 0 && (
            <div
              className={cn(
                'mt-3 overflow-hidden rounded-xl',
                mediaUrls.length === 1 && 'aspect-video',
                mediaUrls.length === 2 && 'grid grid-cols-2 gap-1',
                mediaUrls.length >= 3 && 'grid grid-cols-2 gap-1'
              )}
            >
              {mediaUrls.slice(0, 4).map((url, i) => (
                <div
                  key={url}
                  className={cn(
                    'bg-gray-100 dark:bg-gray-800',
                    mediaUrls.length === 1 && 'aspect-video',
                    mediaUrls.length >= 2 && 'aspect-square'
                  )}
                >
                  <img
                    src={url}
                    alt={`Media ${i + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full rounded-lg object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center gap-4 text-gray-500">
            <button
              type="button"
              aria-label={l.like}
              className="-m-2 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Heart className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label={l.comment}
              className="-m-2 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <MessageCircle className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label={l.repost}
              className="-m-2 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Repeat2 className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label={l.share}
              className="-m-2 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 ml-12 flex items-center gap-3">
        <div className="flex -space-x-1.5">
          <div className="h-5 w-5 rounded-full border-2 border-white bg-gray-300 dark:border-[#101010] dark:bg-gray-600" />
          <div className="h-5 w-5 rounded-full border-2 border-white bg-gray-400 dark:border-[#101010] dark:bg-gray-500" />
        </div>
        <span className="text-[15px] text-gray-500">{l.replies(0)}</span>
      </div>
    </div>
  );
}
