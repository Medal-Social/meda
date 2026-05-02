'use client';

import { cn } from '../../lib/utils.js';
import { Avatar } from '../internal/avatar.js';
import { PLATFORM_META } from '../internal/platform-meta.js';
import { Textarea } from '../internal/textarea.js';
import type { PlatformId, PostPreviewBaseProps } from '../types.js';

export interface GenericLabels {
  placeholderTemplate: (platform: string) => string;
  badgeTemplate: (platform: string) => string;
  moreOptions: string;
}

export const DEFAULT_GENERIC_LABELS: GenericLabels = {
  placeholderTemplate: (platform) => `Write your ${platform} post...`,
  badgeTemplate: (platform) => `${platform} preview`,
  moreOptions: 'More options',
};

export interface GenericPreviewProps extends PostPreviewBaseProps {
  /**
   * The platform this preview represents. Accepts a known `PlatformId` (in
   * which case the per-platform display name is used) or any free-form
   * string for unknown platforms.
   */
  platform: PlatformId | (string & {});
  labels?: Partial<GenericLabels>;
}

function resolvePlatformName(platform: PlatformId | string): string {
  if (platform in PLATFORM_META) {
    return PLATFORM_META[platform as PlatformId].displayName;
  }
  return platform;
}

/**
 * Generic preview. Used as a fallback for any platform without a dedicated
 * component. Layout is intentionally neutral so it composes well inside
 * `PlatformChrome` if a consumer wants to add device framing.
 */
export function GenericPreview({
  platform,
  displayName,
  username,
  avatarUrl,
  content,
  mediaUrls,
  editable = false,
  onContentChange,
  className,
  labels,
}: GenericPreviewProps) {
  const l = { ...DEFAULT_GENERIC_LABELS, ...labels };
  const platformName = resolvePlatformName(platform);

  return (
    <div
      data-slot="post-preview"
      data-platform="generic"
      data-generic-platform={platform}
      className={cn(
        '@container bg-white p-4 text-gray-900 @[420px]:text-[14px] dark:bg-neutral-950 dark:text-neutral-100',
        className
      )}
    >
      <div className="flex gap-3">
        <Avatar src={avatarUrl} displayName={displayName} className="h-10 w-10 flex-shrink-0" />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[14px]">{displayName}</span>
            <span className="text-[13px] text-gray-500">@{username}</span>
          </div>

          {editable ? (
            <Textarea
              value={content}
              onChange={(e) => onContentChange?.(e.target.value)}
              placeholder={l.placeholderTemplate(platformName)}
              className="mt-2 min-h-[60px] text-[14px] placeholder:text-gray-500"
            />
          ) : (
            <p className="mt-2 whitespace-pre-wrap break-words text-[14px]">{content}</p>
          )}

          {mediaUrls && mediaUrls.length > 0 && (
            <div className="mt-3 overflow-hidden rounded-lg">
              {mediaUrls.length === 1 ? (
                <div className="aspect-video bg-gray-200">
                  <img
                    src={mediaUrls[0]}
                    alt="Post media"
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-1">
                  {mediaUrls.slice(0, 4).map((url, i) => (
                    <div key={url} className="aspect-square bg-gray-200">
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
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 border-gray-200 border-t pt-3 dark:border-neutral-800">
        <p className="text-gray-500 text-xs">{l.badgeTemplate(platformName)}</p>
      </div>
    </div>
  );
}
