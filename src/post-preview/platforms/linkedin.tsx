'use client';

import { Globe, MessageSquare, MoreHorizontal, Repeat2, Send, ThumbsUp } from 'lucide-react';
import { type ReactNode, useCallback, useRef, useState } from 'react';
import { cn } from '../../lib/utils.js';
import { Avatar } from '../internal/avatar.js';
import { Textarea } from '../internal/textarea.js';
import type { PostPreviewBaseProps } from '../types.js';

/**
 * LinkedIn mention metadata. Wire format used by the LinkedIn share API:
 * `@[Name](urn:li:person:abc)` is rendered as a plain `Name` token in the
 * UI but the spans here let consumers persist the mention range +
 * URN reference.
 */
export interface LinkedInMentionData {
  /** Zero-based start offset within the post content. */
  offset: number;
  /** Length of the rendered name in the post content. */
  length: number;
  /** LinkedIn URN, e.g. `urn:li:person:ABC123`. */
  urn: string;
  /** Display name to highlight. */
  name: string;
}

export interface LinkedInMentionPickerContext {
  query: string;
  onPick: (mention: LinkedInMentionData) => void;
  onCancel: () => void;
}

export interface LinkedInLabels {
  placeholder: string;
  now: string;
  moreOptions: string;
  comments: (count: number) => string;
  reposts: (count: number) => string;
  like: string;
  comment: string;
  repost: string;
  send: string;
}

export const DEFAULT_LINKEDIN_LABELS: LinkedInLabels = {
  placeholder: 'Share your thoughts...',
  now: 'now',
  moreOptions: 'More options',
  comments: (count) => `${count} comments`,
  reposts: (count) => `${count} reposts`,
  like: 'Like',
  comment: 'Comment',
  repost: 'Repost',
  send: 'Send',
};

export interface LinkedInPreviewProps extends PostPreviewBaseProps {
  labels?: Partial<LinkedInLabels>;
  /** Mention spans to highlight in rendered content. */
  mentions?: LinkedInMentionData[];
  /** Called when the user picks a new mention via `renderMentionPicker`. */
  onMentionsChange?: (mentions: LinkedInMentionData[]) => void;
  /** Optional render slot for an `@mention` picker. Called with the
   * current query (text after `@`) when the user types `@xxx` in the
   * editable textarea. */
  renderMentionPicker?: (ctx: LinkedInMentionPickerContext) => ReactNode;
}

interface MentionTrigger {
  isOpen: boolean;
  query: string;
  close: () => void;
  insertMention: (mention: LinkedInMentionData) => void;
  handleInput: () => void;
}

function useLinkedInMentionTrigger(
  textareaRef: React.RefObject<HTMLTextAreaElement | null>,
  value: string,
  onChange: ((value: string) => void) | undefined,
  mentions: LinkedInMentionData[],
  onMentionsChange: ((next: LinkedInMentionData[]) => void) | undefined
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
    let i = cursor - 1;
    let foundAt = -1;
    while (i >= 0) {
      const ch = text[i];
      if (ch === '@') {
        if (i === 0 || /\s/.test(text[i - 1])) foundAt = i;
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
    (picked: LinkedInMentionData) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const start = triggerStartRef.current;
      if (start === null) return;
      const cursor = ta.selectionStart ?? 0;
      const before = value.slice(0, start);
      const after = value.slice(cursor);
      const next = `${before}${picked.name} ${after}`;
      onChange?.(next);
      const span: LinkedInMentionData = {
        ...picked,
        offset: start,
        length: picked.name.length,
      };
      onMentionsChange?.([...mentions, span]);
      close();
    },
    [textareaRef, value, onChange, mentions, onMentionsChange, close]
  );

  return { isOpen, query, close, insertMention, handleInput };
}

function MentionedContent({ text, mentions }: { text: string; mentions?: LinkedInMentionData[] }) {
  if (!mentions || mentions.length === 0) {
    return <span className="whitespace-pre-wrap break-words text-[14px]">{text}</span>;
  }
  // Sort spans by offset and render alternating plain/highlight segments.
  const sorted = [...mentions].sort((a, b) => a.offset - b.offset);
  const segments: Array<{ key: string; isMention: boolean; value: string }> = [];
  let cursor = 0;
  sorted.forEach((mention, idx) => {
    if (mention.offset > cursor) {
      segments.push({
        key: `t-${cursor}`,
        isMention: false,
        value: text.slice(cursor, mention.offset),
      });
    }
    const end = mention.offset + mention.length;
    segments.push({
      key: `m-${idx}-${mention.urn}`,
      isMention: true,
      value: text.slice(mention.offset, end),
    });
    cursor = end;
  });
  if (cursor < text.length) {
    segments.push({ key: `t-${cursor}`, isMention: false, value: text.slice(cursor) });
  }
  return (
    <span className="whitespace-pre-wrap break-words text-[14px]">
      {segments.map((seg) =>
        seg.isMention ? (
          <span key={seg.key} data-slot="linkedin-mention" className="font-semibold text-[#0A66C2]">
            {seg.value}
          </span>
        ) : (
          <span key={seg.key}>{seg.value}</span>
        )
      )}
    </span>
  );
}

/**
 * LinkedIn feed-card preview. Renders avatar, name, headline (`username`),
 * content with optional `@mention` highlight spans, media grid, and the
 * standard Like/Comment/Repost/Send footer.
 */
export function LinkedInPreview({
  displayName,
  username,
  avatarUrl,
  content,
  mediaUrls,
  editable = false,
  onContentChange,
  className,
  labels,
  mentions = [],
  onMentionsChange,
  renderMentionPicker,
}: LinkedInPreviewProps) {
  const l = { ...DEFAULT_LINKEDIN_LABELS, ...labels };
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mention = useLinkedInMentionTrigger(
    textareaRef,
    content,
    onContentChange,
    mentions,
    onMentionsChange
  );

  return (
    <div
      data-slot="post-preview"
      data-platform="linkedin"
      className={cn('@container bg-white text-gray-900 @[420px]:text-[15px]', className)}
    >
      <div className="p-4 pb-0">
        <div className="flex gap-3">
          <Avatar src={avatarUrl} displayName={displayName} className="h-12 w-12 flex-shrink-0" />

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-[14px] text-gray-900">{displayName}</p>
                <p className="line-clamp-1 text-[12px] text-gray-500">{username}</p>
                <div className="flex items-center gap-1 text-[12px] text-gray-500">
                  <span>{l.now}</span>
                  <span>·</span>
                  <Globe className="h-3 w-3" aria-hidden="true" />
                </div>
              </div>
              <button
                type="button"
                aria-label={l.moreOptions}
                className="-m-1.5 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
          </div>
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
                'mt-3 min-h-[80px] text-[14px] text-gray-900 placeholder:text-gray-500'
              )}
            />
            {renderMentionPicker && mention.isOpen
              ? renderMentionPicker({
                  query: mention.query,
                  onPick: mention.insertMention,
                  onCancel: mention.close,
                })
              : null}
          </div>
        ) : (
          <p className="mt-3">
            <MentionedContent text={content} mentions={mentions} />
          </p>
        )}
      </div>

      {mediaUrls && mediaUrls.length > 0 && (
        <div className="mt-3">
          {mediaUrls.length === 1 ? (
            <div className="aspect-video bg-gray-100">
              <img
                src={mediaUrls[0]}
                alt="Post media"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <LinkedInMultiImageGrid mediaUrls={mediaUrls} />
          )}
        </div>
      )}

      <div className="flex items-center justify-between border-gray-200 border-b px-4 py-2 text-[12px] text-gray-500">
        <div className="flex items-center gap-1">
          <div className="flex -space-x-1">
            <span
              role="img"
              aria-label="Like"
              className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white"
            >
              <ThumbsUp className="h-2.5 w-2.5" fill="currentColor" />
            </span>
            <span
              role="img"
              aria-label="Love"
              className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white"
            >
              ♥
            </span>
          </div>
          <span className="ml-1">0</span>
        </div>
        <div className="flex items-center gap-2">
          <span>{l.comments(0)}</span>
          <span>·</span>
          <span>{l.reposts(0)}</span>
        </div>
      </div>

      <div className="flex items-center justify-around px-2 py-1">
        <button
          type="button"
          className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg py-3 text-gray-600 hover:bg-gray-100"
        >
          <ThumbsUp className="h-5 w-5" />
          <span className="font-medium text-[14px]">{l.like}</span>
        </button>
        <button
          type="button"
          className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg py-3 text-gray-600 hover:bg-gray-100"
        >
          <MessageSquare className="h-5 w-5" />
          <span className="font-medium text-[14px]">{l.comment}</span>
        </button>
        <button
          type="button"
          className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg py-3 text-gray-600 hover:bg-gray-100"
        >
          <Repeat2 className="h-5 w-5" />
          <span className="font-medium text-[14px]">{l.repost}</span>
        </button>
        <button
          type="button"
          className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg py-3 text-gray-600 hover:bg-gray-100"
        >
          <Send className="h-5 w-5" />
          <span className="font-medium text-[14px]">{l.send}</span>
        </button>
      </div>
    </div>
  );
}

function LinkedInMultiImageGrid({ mediaUrls }: { mediaUrls: string[] }) {
  if (mediaUrls.length === 3) {
    return (
      <div className="grid gap-0.5">
        <div className="aspect-video bg-gray-100">
          <img
            src={mediaUrls[0]}
            alt="Media 1"
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="grid grid-cols-2 gap-0.5">
          {mediaUrls.slice(1, 3).map((url, i) => (
            <div key={url} className="relative aspect-square bg-gray-100">
              <img
                src={url}
                alt={`Media ${i + 2}`}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-0.5">
      {mediaUrls.slice(0, 4).map((url, i) => (
        <div key={url} className="relative aspect-square bg-gray-100">
          <img
            src={url}
            alt={`Media ${i + 1}`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
          {i === 3 && mediaUrls.length > 4 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <span className="font-semibold text-2xl text-white">+{mediaUrls.length - 4}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
