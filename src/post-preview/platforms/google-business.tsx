'use client';

import { Building2, ExternalLink, MoreVertical, ThumbsUp } from 'lucide-react';
import { cn } from '../../lib/utils.js';
import { Avatar } from '../internal/avatar.js';
import { Textarea } from '../internal/textarea.js';
import type { PostPreviewBaseProps } from '../types.js';

export interface GoogleBusinessLabels {
  placeholder: string;
  postedJustNow: string;
  learnMore: string;
  like: string;
  share: string;
  moreOptions: string;
}

export const DEFAULT_GOOGLE_BUSINESS_LABELS: GoogleBusinessLabels = {
  placeholder: 'Share an update about your business...',
  postedJustNow: 'Posted just now',
  learnMore: 'Learn more',
  like: 'Like',
  share: 'Share',
  moreOptions: 'More options',
};

export interface GoogleBusinessPreviewProps extends PostPreviewBaseProps {
  labels?: Partial<GoogleBusinessLabels>;
}

/**
 * Google Business Profile update-post preview. Renders the business name,
 * timestamp, content, optional media, and a Learn-more CTA button.
 */
export function GoogleBusinessPreview({
  displayName,
  username: _username,
  avatarUrl,
  content,
  mediaUrls,
  editable = false,
  onContentChange,
  className,
  labels,
}: GoogleBusinessPreviewProps) {
  const l = { ...DEFAULT_GOOGLE_BUSINESS_LABELS, ...labels };

  return (
    <div
      data-slot="post-preview"
      data-platform="google_business"
      className={cn(
        '@container overflow-hidden rounded-lg border border-gray-200 bg-white text-gray-900 @[420px]:text-[14px] dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100',
        className
      )}
    >
      <div className="flex items-start justify-between p-4">
        <div className="flex gap-3">
          {avatarUrl ? (
            <Avatar src={avatarUrl} displayName={displayName} className="h-10 w-10 rounded" />
          ) : (
            <span
              role="img"
              aria-label={displayName}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded bg-[#4285F4] text-white"
            >
              <Building2 className="h-5 w-5" />
            </span>
          )}
          <div>
            <p className="font-medium text-[14px] text-gray-900">{displayName}</p>
            <p className="text-[12px] text-gray-500">{l.postedJustNow}</p>
          </div>
        </div>
        <button
          type="button"
          aria-label={l.moreOptions}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full p-1 text-gray-500 hover:bg-gray-100"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>

      <div className="px-4 pb-3">
        {editable ? (
          <Textarea
            value={content}
            onChange={(e) => onContentChange?.(e.target.value)}
            placeholder={l.placeholder}
            className="min-h-[80px] text-[14px] text-gray-900 placeholder:text-gray-500"
          />
        ) : (
          <p className="whitespace-pre-wrap break-words text-[14px]">{content}</p>
        )}
      </div>

      {mediaUrls && mediaUrls.length > 0 && (
        <div className="aspect-video bg-gray-100">
          <img
            src={mediaUrls[0]}
            alt="Post media"
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="border-gray-100 border-t p-4">
        <button
          type="button"
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-[#1A73E8] px-4 py-2 font-medium text-[14px] text-white hover:bg-[#1557B0]"
        >
          <span>{l.learnMore}</span>
          <ExternalLink className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-4 px-4 pb-4">
        <button
          type="button"
          className="inline-flex min-h-11 items-center gap-1.5 text-gray-600 hover:text-[#1A73E8]"
          aria-label={l.like}
        >
          <ThumbsUp className="h-4 w-4" />
          <span className="text-[13px]">{l.like}</span>
        </button>
        <button
          type="button"
          aria-label={l.share}
          className="inline-flex min-h-11 items-center gap-1.5 text-gray-600 hover:text-[#1A73E8]"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
          </svg>
          <span className="text-[13px]">{l.share}</span>
        </button>
      </div>
    </div>
  );
}
