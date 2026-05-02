// open/meda/src/post-preview/post-preview.tsx
//
// Single discriminated entry point for `@medalsocial/meda/post-preview`.
// Routes to per-platform internals based on the `platform` prop and adds an
// optional edit toolbar that renders consumer-supplied slots.

import type * as React from 'react';
import { BlueSkyPreview } from './platforms/bluesky.js';
import { DiscordPreview } from './platforms/discord.js';
import { FacebookPreview } from './platforms/facebook.js';
import { GenericPreview } from './platforms/generic.js';
import { GoogleBusinessPreview } from './platforms/google-business.js';
import type {
  BlueSkyPreviewProps,
  DiscordPreviewProps,
  FacebookPreviewProps,
  GenericPreviewProps,
  GoogleBusinessPreviewProps,
  InstagramPreviewProps,
  LinkedInPreviewProps,
  TelegramPreviewProps,
  ThreadsPreviewProps,
  TikTokPreviewProps,
  TwitterPreviewProps,
  YouTubePreviewProps,
} from './platforms/index.js';
import { InstagramPreview } from './platforms/instagram.js';
import { LinkedInPreview } from './platforms/linkedin.js';
import { TelegramPreview } from './platforms/telegram.js';
import { ThreadsPreview } from './platforms/threads.js';
import { TikTokPreview } from './platforms/tiktok.js';
import { TwitterPreview } from './platforms/twitter.js';
import { YouTubePreview } from './platforms/youtube.js';
import type { PlatformId, PostPreviewSlots } from './types.js';

export type PostPreviewProps = PostPreviewSlots &
  (
    | ({ platform: 'instagram' } & InstagramPreviewProps)
    | ({ platform: 'twitter' } & TwitterPreviewProps)
    | ({ platform: 'facebook' } & FacebookPreviewProps)
    | ({ platform: 'linkedin' } & LinkedInPreviewProps)
    | ({ platform: 'tiktok' } & TikTokPreviewProps)
    | ({ platform: 'youtube' } & YouTubePreviewProps)
    | ({ platform: 'threads' } & ThreadsPreviewProps)
    | ({ platform: 'bluesky' } & BlueSkyPreviewProps)
    | ({ platform: 'discord' } & DiscordPreviewProps)
    | ({ platform: 'telegram' } & TelegramPreviewProps)
    | ({ platform: 'google_business' } & GoogleBusinessPreviewProps)
    | ({ platform: 'generic' } & GenericPreviewProps)
  );

export function PostPreview(props: PostPreviewProps): React.ReactElement {
  const {
    platform,
    mode,
    renderEditor,
    renderMediaPicker,
    renderEmojiPicker,
    renderMentionPicker,
    onMediaUrlsChange,
    ...rest
  } = props;

  const isEdit = mode === 'edit' || rest.editable === true;
  const showToolbar =
    isEdit &&
    (renderMediaPicker !== undefined ||
      renderEmojiPicker !== undefined ||
      renderMentionPicker !== undefined);

  const platformProps = {
    ...rest,
    editable: isEdit && renderEditor === undefined,
  };

  const editorNode = renderEditor?.({
    platform,
    value: rest.content ?? '',
    onChange: (next: string) => rest.onContentChange?.(next),
  });

  const toolbarNode = showToolbar ? (
    <div className="meda-post-preview__toolbar" role="toolbar" aria-label="Post editor">
      {renderMediaPicker?.({
        platform,
        current: rest.mediaUrls,
        onPick: (next) => onMediaUrlsChange?.(next),
      })}
      {renderEmojiPicker?.({
        onSelect: (emoji) => rest.onContentChange?.((rest.content ?? '') + emoji),
      })}
      {renderMentionPicker?.({
        platform,
        query: '',
        onSelect: () => undefined,
      })}
    </div>
  ) : null;

  const PreviewElement = renderPlatform(platform, platformProps);

  if (editorNode === undefined && toolbarNode === null) {
    return PreviewElement;
  }

  return (
    <div className="meda-post-preview" data-platform={platform}>
      {toolbarNode}
      {editorNode}
      {PreviewElement}
    </div>
  );
}

function renderPlatform(platform: PlatformId, props: unknown): React.ReactElement {
  switch (platform) {
    case 'instagram':
      return <InstagramPreview {...(props as InstagramPreviewProps)} />;
    case 'twitter':
      return <TwitterPreview {...(props as TwitterPreviewProps)} />;
    case 'facebook':
      return <FacebookPreview {...(props as FacebookPreviewProps)} />;
    case 'linkedin':
      return <LinkedInPreview {...(props as LinkedInPreviewProps)} />;
    case 'tiktok':
      return <TikTokPreview {...(props as TikTokPreviewProps)} />;
    case 'youtube':
      return <YouTubePreview {...(props as YouTubePreviewProps)} />;
    case 'threads':
      return <ThreadsPreview {...(props as ThreadsPreviewProps)} />;
    case 'bluesky':
      return <BlueSkyPreview {...(props as BlueSkyPreviewProps)} />;
    case 'discord':
      return <DiscordPreview {...(props as DiscordPreviewProps)} />;
    case 'telegram':
      return <TelegramPreview {...(props as TelegramPreviewProps)} />;
    case 'google_business':
      return <GoogleBusinessPreview {...(props as GoogleBusinessPreviewProps)} />;
    case 'generic':
      return <GenericPreview {...(props as GenericPreviewProps)} />;
  }
}
