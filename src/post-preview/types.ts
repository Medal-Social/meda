import type * as React from 'react';

/**
 * Public types for the post-preview surface.
 *
 * These types are framework-neutral and intentionally free of
 * Convex / app-specific identifiers. Platform-specific extras
 * (Telegram poll, Discord embeds, LinkedIn mentions) live next to
 * their platform module.
 */

/**
 * Platforms with a dedicated preview component. Any platform not in
 * this list should use `GenericPreview` as a fallback.
 */
export type PlatformId =
  | 'instagram'
  | 'twitter'
  | 'facebook'
  | 'linkedin'
  | 'tiktok'
  | 'youtube'
  | 'threads'
  | 'bluesky'
  | 'discord'
  | 'telegram'
  | 'google-business'
  | 'generic';

export interface PostPreviewSlots {
  /** When 'edit', enables editable mode. Sugar for `editable: true`. */
  mode?: 'preview' | 'edit';
  /** Replaces the platform's content textarea when in edit mode. */
  renderEditor?: (ctx: {
    platform: PlatformId;
    value: string;
    onChange: (next: string) => void;
  }) => React.ReactNode;
  /** Renders a media picker trigger in the edit toolbar. */
  renderMediaPicker?: (ctx: {
    platform: PlatformId;
    current: string[] | undefined;
    onPick: (next: string[]) => void;
  }) => React.ReactNode;
  /** Renders an emoji picker trigger in the edit toolbar. */
  renderEmojiPicker?: (ctx: { onSelect: (emoji: string) => void }) => React.ReactNode;
  /** Renders a mention picker trigger in the edit toolbar. */
  renderMentionPicker?: (ctx: {
    platform: PlatformId;
    query: string;
    onSelect: (mention: unknown) => void;
  }) => React.ReactNode;
  /** Called when renderMediaPicker invokes onPick. */
  onMediaUrlsChange?: (mediaUrls: string[]) => void;
}

/**
 * Visual frame mode for any platform preview.
 * - `card` (default): fluid feed-card layout. Fits container width.
 * - `device`: wraps in a phone shell with status bar / tab bar at
 *   a native phone aspect ratio.
 */
export type PostPreviewFrame = 'card' | 'device';

/**
 * Shared props for every platform preview.
 *
 * Per-platform components extend this with their own optional extras
 * (e.g. `TelegramPreviewProps` adds `poll`, `pinMessage`, `replyMarkup`).
 */
export interface PostPreviewBaseProps {
  /** Channel display name (e.g. "Acme Studios"). */
  displayName: string;
  /** Channel handle/username; leading `@` is optional and stripped. */
  username: string;
  /** Channel avatar URL. Falls back to initials when omitted. */
  avatarUrl?: string;
  /** Post body text. Plain text; per-platform formatting (mentions,
   * hashtags) is applied at render time. */
  content: string;
  /** Image / video URLs for the post media. */
  mediaUrls?: string[];
  /** Optional override for the per-platform character limit display. */
  characterLimit?: number;
  /** Visual frame mode. See `PostPreviewFrame`. */
  frame?: PostPreviewFrame;
  /** Enable inline editing of `content`. Requires `onContentChange`. */
  editable?: boolean;
  /** Called on every keystroke when `editable` is true. */
  onContentChange?: (content: string) => void;
  /** Class applied to the outer wrapper element. */
  className?: string;
}
