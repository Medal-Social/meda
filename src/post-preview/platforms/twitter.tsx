'use client';

import { Bookmark, Heart, MessageCircle, MoreHorizontal, Repeat2, Share } from 'lucide-react';
import { type ReactNode, useCallback, useRef, useState } from 'react';
import { cn } from '../../lib/utils.js';
import { Avatar } from '../internal/avatar.js';
import { Textarea } from '../internal/textarea.js';
import type { PostPreviewBaseProps } from '../types.js';

/**
 * Visual theme variants for Twitter / X.
 * - `light`: white background, dark text.
 * - `dim`: navy-blue dark variant.
 * - `lights-out`: pure black variant.
 */
export type TwitterTheme = 'light' | 'dim' | 'lights-out';

export interface TwitterMentionPickerContext {
  query: string;
  onPick: (mention: string) => void;
  onCancel: () => void;
}

export interface TwitterLabels {
  placeholder: string;
  now: string;
  moreOptions: string;
  reply: string;
  retweet: string;
  like: string;
  save: string;
  share: string;
  viewAnalytics: string;
}

export const DEFAULT_TWITTER_LABELS: TwitterLabels = {
  placeholder: "What's happening?",
  now: 'now',
  moreOptions: 'More options',
  reply: 'Reply',
  retweet: 'Retweet',
  like: 'Like',
  save: 'Save',
  share: 'Share',
  viewAnalytics: 'View post analytics',
};

export interface TwitterPreviewProps extends PostPreviewBaseProps {
  labels?: Partial<TwitterLabels>;
  /** Visual theme. Defaults to `lights-out` to match X's default. */
  theme?: TwitterTheme;
  /** Optional render slot for an `@mention` picker. Called with the
   * current query (text after `@`) when the user types `@xxx` in the
   * editable textarea. */
  renderMentionPicker?: (ctx: TwitterMentionPickerContext) => ReactNode;
}

interface MentionTrigger {
  isOpen: boolean;
  query: string;
  close: () => void;
  insertMention: (mention: string) => void;
  handleInput: () => void;
}

function useMentionTrigger(
  textareaRef: React.RefObject<HTMLTextAreaElement | null>,
  value: string,
  onChange: ((value: string) => void) | undefined
): MentionTrigger {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const triggerStartRef = useRef<number | null>(null);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    triggerStartRef.current = null;
  }, []);

  const handleInput = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const cursor = ta.selectionStart ?? 0;
    const text = ta.value;
    // Walk back from cursor to find `@` until whitespace or start.
    let i = cursor - 1;
    let foundAt = -1;
    while (i >= 0) {
      const ch = text[i];
      if (ch === '@') {
        // Must be at start or preceded by whitespace
        if (i === 0 || /\s/.test(text[i - 1])) {
          foundAt = i;
        }
        break;
      }
      if (/\s/.test(ch)) break;
      i -= 1;
    }
    if (foundAt === -1) {
      if (isOpen) close();
      return;
    }
    triggerStartRef.current = foundAt;
    setQuery(text.slice(foundAt + 1, cursor));
    setIsOpen(true);
  }, [textareaRef, isOpen, close]);

  const insertMention = useCallback(
    (mention: string) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const start = triggerStartRef.current;
      if (start === null) return;
      const cursor = ta.selectionStart ?? 0;
      const before = value.slice(0, start);
      const after = value.slice(cursor);
      const formatted = mention.startsWith('@') ? mention : `@${mention}`;
      const next = `${before}${formatted} ${after}`;
      onChange?.(next);
      close();
    },
    [textareaRef, value, onChange, close]
  );

  return { isOpen, query, close, insertMention, handleInput };
}

function ContentWithMentions({ text, accent }: { text: string; accent: string }) {
  // Build typed parts with stable offsets so keys don't rely on positional index.
  const segments: Array<{ key: string; isMention: boolean; value: string }> = [];
  let offset = 0;
  for (const part of text.split(/(@[A-Za-z0-9_]+)/g)) {
    if (!part) continue;
    segments.push({
      key: `${offset}-${part}`,
      isMention: /^@[A-Za-z0-9_]+$/.test(part),
      value: part,
    });
    offset += part.length;
  }
  return (
    <>
      {segments.map((seg) =>
        seg.isMention ? (
          <span key={seg.key} className={accent}>
            {seg.value}
          </span>
        ) : (
          <span key={seg.key}>{seg.value}</span>
        )
      )}
    </>
  );
}

const THEME_CLASSES: Record<
  TwitterTheme,
  {
    surface: string;
    text: string;
    muted: string;
    border: string;
    mention: string;
  }
> = {
  light: {
    surface: 'bg-white',
    text: 'text-gray-900',
    muted: 'text-gray-500',
    border: 'border-gray-200',
    mention: 'text-blue-500',
  },
  dim: {
    surface: 'bg-[#15202B]',
    text: 'text-white',
    muted: 'text-gray-400',
    border: 'border-[#38444D]',
    mention: 'text-[#1D9BF0]',
  },
  'lights-out': {
    surface: 'bg-black',
    text: 'text-white',
    muted: 'text-gray-500',
    border: 'border-gray-800',
    mention: 'text-blue-400',
  },
};

/**
 * Twitter / X feed-card preview. Supports light, dim, and lights-out
 * themes plus an optional `@mention` picker render slot.
 */
export function TwitterPreview({
  displayName,
  username,
  avatarUrl,
  content,
  mediaUrls,
  characterLimit,
  editable = false,
  onContentChange,
  className,
  labels,
  theme = 'lights-out',
  renderMentionPicker,
}: TwitterPreviewProps) {
  const l = { ...DEFAULT_TWITTER_LABELS, ...labels };
  const t = THEME_CLASSES[theme];
  const formattedUsername = username.startsWith('@') ? username : `@${username}`;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mention = useMentionTrigger(textareaRef, content, onContentChange);

  return (
    <div
      data-slot="post-preview"
      data-platform="twitter"
      data-theme={theme}
      className={cn('@container p-4 @[420px]:p-5', t.surface, t.text, className)}
    >
      <div className="flex gap-3">
        <Avatar src={avatarUrl} displayName={displayName} className="h-10 w-10 flex-shrink-0" />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-[15px]">
              <span className={cn('truncate font-bold', t.text)}>{displayName}</span>
              <span className={cn('truncate', t.muted)}>{formattedUsername}</span>
              <span className={t.muted}>·</span>
              <span className={t.muted}>{l.now}</span>
            </div>
            <button
              type="button"
              aria-label={l.moreOptions}
              className={cn(
                '-m-1.5 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full p-1.5',
                t.muted,
                theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-800'
              )}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          {editable ? (
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => onContentChange?.(e.target.value)}
                onInput={mention.handleInput}
                onKeyUp={mention.handleInput}
                placeholder={l.placeholder}
                className={cn(
                  'mt-1 min-h-[60px] text-[15px]',
                  t.text,
                  theme === 'light' ? 'placeholder:text-gray-500' : 'placeholder:text-gray-500'
                )}
              />
              {renderMentionPicker && mention.isOpen
                ? renderMentionPicker({
                    query: mention.query,
                    onPick: mention.insertMention,
                    onCancel: mention.close,
                  })
                : null}
              {characterLimit !== undefined && (
                <div
                  data-slot="twitter-character-counter"
                  className={cn(
                    'mt-1 text-right text-xs',
                    content.length > characterLimit ? 'text-red-500' : t.muted
                  )}
                >
                  <span>{characterLimit - content.length}</span>
                  <span className="mx-1">/</span>
                  <span>{characterLimit}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="mt-1 whitespace-pre-wrap break-words text-[15px]">
              <ContentWithMentions text={content} accent={t.mention} />
            </p>
          )}

          {mediaUrls && mediaUrls.length > 0 && (
            <div
              className={cn(
                'mt-3 overflow-hidden rounded-2xl border',
                t.border,
                mediaUrls.length === 1 && 'aspect-video',
                mediaUrls.length >= 2 && 'grid aspect-video grid-cols-2 gap-0.5'
              )}
            >
              {mediaUrls.slice(0, 4).map((url, i) => (
                <div
                  key={url}
                  className={cn(
                    'overflow-hidden bg-gray-800',
                    mediaUrls.length === 1 && 'h-full',
                    mediaUrls.length === 3 && i === 0 && 'row-span-2'
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

          <div
            className={cn(
              'mt-3 flex max-w-[425px] items-center justify-between @[420px]:max-w-[480px]',
              t.muted
            )}
          >
            <button
              type="button"
              aria-label={l.reply}
              className="-m-2 inline-flex min-h-11 min-w-11 items-center gap-1 rounded-full p-2 hover:bg-blue-500/10 hover:text-blue-400"
            >
              <MessageCircle className="h-[18px] w-[18px]" />
              <span className="text-[13px]">0</span>
            </button>
            <button
              type="button"
              aria-label={l.retweet}
              className="-m-2 inline-flex min-h-11 min-w-11 items-center gap-1 rounded-full p-2 hover:bg-green-500/10 hover:text-green-400"
            >
              <Repeat2 className="h-[18px] w-[18px]" />
              <span className="text-[13px]">0</span>
            </button>
            <button
              type="button"
              aria-label={l.like}
              className="-m-2 inline-flex min-h-11 min-w-11 items-center gap-1 rounded-full p-2 hover:bg-pink-500/10 hover:text-pink-400"
            >
              <Heart className="h-[18px] w-[18px]" />
              <span className="text-[13px]">0</span>
            </button>
            <button
              type="button"
              aria-label={l.viewAnalytics}
              className="-m-2 inline-flex min-h-11 min-w-11 items-center gap-1 rounded-full p-2 hover:bg-blue-500/10 hover:text-blue-400"
            >
              <svg
                className="h-[18px] w-[18px]"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z" />
              </svg>
            </button>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label={l.save}
                className="-m-2 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full p-2 hover:bg-blue-500/10 hover:text-blue-400"
              >
                <Bookmark className="h-[18px] w-[18px]" />
              </button>
              <button
                type="button"
                aria-label={l.share}
                className="-m-2 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full p-2 hover:bg-blue-500/10 hover:text-blue-400"
              >
                <Share className="h-[18px] w-[18px]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
