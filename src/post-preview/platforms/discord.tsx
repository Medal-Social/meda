'use client';

import { MoreHorizontal, Plus, Smile } from 'lucide-react';
import { cn } from '../../lib/utils.js';
import { Avatar } from '../internal/avatar.js';
import { Textarea } from '../internal/textarea.js';
import type { PostPreviewBaseProps } from '../types.js';

/**
 * Discord embed draft. Mirrors the Discord webhook embed shape.
 */
export interface DiscordEmbedDraft {
  title?: string;
  description?: string;
  /** 0xRRGGBB integer (Discord wire format). */
  color?: number;
  url?: string;
  thumbnailUrl?: string;
  imageUrl?: string;
  authorName?: string;
  authorIconUrl?: string;
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
  footerText?: string;
  /** ISO 8601 timestamp. */
  timestamp?: string;
}

export interface DiscordLabels {
  placeholder: string;
  timestamp: string;
  embedsSuppressed: string;
  reply: string;
  close: string;
  moreOptions: string;
  addReaction: string;
}

export const DEFAULT_DISCORD_LABELS: DiscordLabels = {
  placeholder: 'Message #channel',
  timestamp: 'Today at 12:00 PM',
  embedsSuppressed: 'Embeds are hidden in this preview.',
  reply: 'React',
  close: 'Close',
  moreOptions: 'More options',
  addReaction: 'Add reaction',
};

export interface DiscordPreviewProps extends PostPreviewBaseProps {
  labels?: Partial<DiscordLabels>;
  embeds?: DiscordEmbedDraft[];
  /** Hide rendered embeds (matches Discord's "Suppress Embeds" message option). */
  suppressEmbeds?: boolean;
}

/**
 * Discord channel message preview. Renders the user message followed by
 * any embeds (unless `suppressEmbeds` is true).
 */
export function DiscordPreview({
  displayName,
  username: _username,
  avatarUrl,
  content,
  mediaUrls,
  editable = false,
  onContentChange,
  className,
  labels,
  embeds,
  suppressEmbeds,
}: DiscordPreviewProps) {
  const l = { ...DEFAULT_DISCORD_LABELS, ...labels };

  const visibleEmbeds = (embeds ?? []).filter((embed) =>
    [embed.title, embed.description, embed.url, embed.imageUrl].some(
      (field) => typeof field === 'string' && field.trim().length > 0
    )
  );

  return (
    <div
      data-slot="post-preview"
      data-platform="discord"
      className={cn(
        '@container min-h-[150px] bg-white text-[#313338] @[420px]:text-[15px]',
        className
      )}
    >
      <div className="group relative px-4 py-1 hover:bg-[#F2F3F5]">
        <div className="-top-4 absolute right-4 hidden items-center rounded border border-[#DDDEE1] bg-white shadow-lg group-hover:flex">
          <button
            type="button"
            aria-label={l.reply}
            className="inline-flex min-h-11 min-w-11 items-center justify-center p-1.5 text-[#747681] hover:bg-[#F2F3F5] hover:text-[#313338]"
          >
            <Smile className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label={l.moreOptions}
            className="inline-flex min-h-11 min-w-11 items-center justify-center p-1.5 text-[#747681] hover:bg-[#F2F3F5] hover:text-[#313338]"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-4 py-0.5">
          <Avatar
            src={avatarUrl}
            displayName={displayName}
            className="mt-0.5 h-10 w-10 flex-shrink-0"
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <span className="cursor-pointer font-medium text-[#060607] text-[15px] hover:underline">
                {displayName}
              </span>
              <span className="text-[#5C5E66] text-[11px]">{l.timestamp}</span>
            </div>

            {editable ? (
              <Textarea
                value={content}
                onChange={(e) => onContentChange?.(e.target.value)}
                placeholder={l.placeholder}
                className="mt-0.5 min-h-[40px] text-[#313338] text-[15px] placeholder:text-[#747681]"
              />
            ) : (
              <p className="mt-0.5 whitespace-pre-wrap break-words text-[#313338] text-[15px]">
                {content}
              </p>
            )}

            {mediaUrls && mediaUrls.length > 0 && (
              <div className="mt-2 max-w-md">
                <div
                  className={cn(
                    'overflow-hidden rounded',
                    mediaUrls.length === 1 && 'max-w-[400px]',
                    mediaUrls.length >= 2 && 'grid max-w-[400px] grid-cols-2 gap-1'
                  )}
                >
                  {mediaUrls.slice(0, 4).map((url, i) => (
                    <div
                      key={url}
                      className={cn(
                        'overflow-hidden rounded bg-[#F2F3F5]',
                        mediaUrls.length === 1 && 'aspect-video',
                        mediaUrls.length >= 2 && 'aspect-square'
                      )}
                    >
                      <img
                        src={url}
                        alt={`Media ${i + 1}`}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full cursor-pointer object-cover hover:opacity-90"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!suppressEmbeds && visibleEmbeds.length > 0 && (
              <div data-slot="discord-embeds" className="mt-3 flex max-w-[520px] flex-col gap-2">
                {visibleEmbeds.map((embed, index) => (
                  <DiscordEmbedCard key={embedKey(embed, index)} embed={embed} />
                ))}
              </div>
            )}

            {suppressEmbeds && (
              <p data-slot="discord-embeds-suppressed" className="mt-2 text-[#5C5E66] text-xs">
                {l.embedsSuppressed}
              </p>
            )}

            <div className="mt-2 flex items-center gap-1">
              <button
                type="button"
                className="flex min-h-11 items-center gap-1 rounded border border-transparent bg-[#F2F3F5] px-3 py-0.5 text-[14px] hover:border-[#5865F2] hover:bg-[#E8E9EB]"
              >
                <span aria-hidden="true">👍</span>
                <span className="text-[#5C5E66] text-[12px]">1</span>
              </button>
              <button
                type="button"
                aria-label={l.addReaction}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded border border-transparent bg-[#F2F3F5] hover:border-[#5865F2] hover:bg-[#E8E9EB]"
              >
                <Plus className="h-4 w-4 text-[#747681]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function embedKey(embed: DiscordEmbedDraft, index: number) {
  return `${embed.title ?? ''}::${embed.url ?? ''}::${embed.imageUrl ?? ''}::${index}`;
}

/* v8 ignore next — v8 phantom duplicate function record */
function DiscordEmbedCard({ embed }: { embed: DiscordEmbedDraft }) {
  const accent =
    typeof embed.color === 'number' ? `#${embed.color.toString(16).padStart(6, '0')}` : '#5865f2';
  const href = embed.url?.trim();
  /* v8 ignore next — v8 phantom duplicate function body record */
  return (
    <div
      data-slot="discord-embed"
      className="overflow-hidden rounded-md border border-[#DDDEE1] border-l-4 bg-[#F2F3F5]"
      style={{ borderLeftColor: accent }}
    >
      <div className="p-3">
        {embed.title ? (
          <p className="font-medium text-[#060607] text-sm">
            {href ? (
              <a href={href} target="_blank" rel="noreferrer" className="hover:underline">
                {embed.title}
              </a>
            ) : (
              embed.title
            )}
          </p>
        ) : null}
        {embed.description ? (
          <p className="mt-1 whitespace-pre-wrap text-[#313338] text-sm">{embed.description}</p>
        ) : null}
        {href ? <p className="mt-2 truncate text-[#0068e0] text-xs">{href}</p> : null}
      </div>
      {embed.imageUrl ? (
        <img
          src={embed.imageUrl}
          alt={embed.title ?? 'Discord embed'}
          loading="lazy"
          decoding="async"
          className="w-full object-cover"
        />
      ) : null}
    </div>
  );
}
