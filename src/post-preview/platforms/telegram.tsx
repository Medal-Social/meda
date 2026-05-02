'use client';

import { Eye, Pin, Share2 } from 'lucide-react';
import { cn } from '../../lib/utils.js';
import { Avatar } from '../internal/avatar.js';
import { Textarea } from '../internal/textarea.js';
import type { PostPreviewBaseProps } from '../types.js';

/**
 * Telegram poll attached to a channel post.
 *
 * Field names mirror Telegram's bot API wire shape so callers can pass
 * the same value to `sendPoll`.
 */
export interface TelegramPollState {
  question: string;
  options: string[];
  multiple?: boolean;
  quiz?: boolean;
  /** Required when `quiz` is true; index of the correct option. */
  correctOptionId?: number;
}

export interface TelegramInlineKeyboardButton {
  text: string;
  url?: string;
  callbackData?: string;
}

/**
 * Inline keyboard markup. Field name `inline_keyboard` matches the
 * Telegram bot API so consumers can serialise this object directly.
 */
export interface TelegramInlineKeyboardMarkup {
  inline_keyboard: TelegramInlineKeyboardButton[][];
}

export interface TelegramLabels {
  placeholder: string;
  pinnedMessage: string;
  share: string;
  buttonFallback: string;
  pollOptionPlaceholder: (number: number) => string;
}

export const DEFAULT_TELEGRAM_LABELS: TelegramLabels = {
  placeholder: 'Type a message...',
  pinnedMessage: 'Pinned message',
  share: 'Share',
  buttonFallback: 'Button',
  pollOptionPlaceholder: (number) => `Option ${number}`,
};

export interface TelegramPreviewProps extends PostPreviewBaseProps {
  labels?: Partial<TelegramLabels>;
  poll?: TelegramPollState;
  pinMessage?: boolean;
  replyMarkup?: TelegramInlineKeyboardMarkup;
}

/**
 * Telegram channel post preview. Renders a chat bubble with optional
 * poll, pinned indicator, and inline keyboard.
 */
export function TelegramPreview({
  displayName,
  username: _username,
  avatarUrl,
  content,
  mediaUrls,
  editable = false,
  onContentChange,
  className,
  labels,
  poll,
  pinMessage,
  replyMarkup,
}: TelegramPreviewProps) {
  const l = { ...DEFAULT_TELEGRAM_LABELS, ...labels };

  return (
    <div
      data-slot="post-preview"
      data-platform="telegram"
      className={cn(
        '@container min-h-[200px] bg-[#E7EBF0] p-4 text-gray-900 @[420px]:p-5',
        className
      )}
    >
      <div className="max-w-md">
        <div className="mb-2 flex items-center gap-2">
          <Avatar src={avatarUrl} displayName={displayName} className="h-8 w-8" />
          <span className="font-medium text-[14px] text-[#168ACD]">{displayName}</span>
        </div>

        <div className="overflow-hidden rounded-xl rounded-tl-sm bg-white shadow-sm">
          {pinMessage ? (
            <div
              data-slot="telegram-pinned"
              className="flex items-center gap-1 border-gray-200 border-b px-3 py-2 text-[11px] text-gray-500"
            >
              <Pin className="h-3 w-3" aria-hidden="true" />
              <span>{l.pinnedMessage}</span>
            </div>
          ) : null}

          {mediaUrls && mediaUrls.length > 0 && (
            <div
              className={cn(
                mediaUrls.length === 1 && 'aspect-video',
                mediaUrls.length >= 2 && 'grid grid-cols-2 gap-0.5'
              )}
            >
              {mediaUrls.slice(0, 4).map((url, i) => (
                <div
                  key={url}
                  className={cn(
                    'bg-gray-100',
                    mediaUrls.length === 1 && 'aspect-video',
                    mediaUrls.length >= 2 && 'aspect-square'
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

          <div className="p-3">
            {renderBody({ poll, editable, content, onContentChange, labels: l })}

            {replyMarkup?.inline_keyboard?.length ? (
              <div className="mt-3 space-y-1">
                {replyMarkup.inline_keyboard.map((row) => {
                  const rowKey = row
                    .map((b) => `${b.text}|${b.url ?? b.callbackData ?? ''}`)
                    .join('::');
                  return (
                    <div key={rowKey} className="flex gap-1">
                      {row.map((button) => (
                        <a
                          key={`${button.text}-${button.url ?? button.callbackData ?? ''}`}
                          href={button.url ?? '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 rounded bg-[#168ACD] px-3 py-1.5 text-center text-white text-xs"
                        >
                          {button.text || l.buttonFallback}
                        </a>
                      ))}
                    </div>
                  );
                })}
              </div>
            ) : null}

            <div className="mt-2 flex items-center justify-end gap-1 text-[12px] text-gray-500">
              <Eye className="h-3 w-3" aria-hidden="true" />
              <span>0</span>
              <span className="ml-2">12:00</span>
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            className="inline-flex min-h-11 items-center gap-1 rounded-full bg-white px-3 py-1 text-[13px] shadow-sm"
          >
            <span aria-hidden="true">👍</span>
            <span className="text-gray-500">0</span>
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 items-center gap-1 rounded-full bg-white px-3 py-1 text-[13px] shadow-sm"
          >
            <span aria-hidden="true">❤️</span>
            <span className="text-gray-500">0</span>
          </button>
          <button
            type="button"
            aria-label={l.share}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white p-1.5 shadow-sm"
          >
            <Share2 className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
}

function renderBody({
  poll,
  editable,
  content,
  onContentChange,
  labels,
}: {
  poll: TelegramPollState | undefined;
  editable: boolean;
  content: string;
  onContentChange: ((content: string) => void) | undefined;
  labels: TelegramLabels;
}) {
  if (poll) {
    return (
      <div data-slot="telegram-poll" className="space-y-2">
        <p className="font-medium">{poll.question}</p>
        {poll.options.map((option, index) => {
          // Options can repeat / be empty during composing; combine with stable index in a non-positional way
          // by counting prior empties so the key remains unique without leaking positional intent.
          const key = option
            ? `opt-${option}`
            : `placeholder-${labels.pollOptionPlaceholder(index + 1)}`;
          return (
            <div key={key} className="rounded bg-gray-50 px-3 py-2 text-sm">
              {option || labels.pollOptionPlaceholder(index + 1)}
            </div>
          );
        })}
      </div>
    );
  }

  if (editable) {
    return (
      <Textarea
        value={content}
        onChange={(e) => onContentChange?.(e.target.value)}
        placeholder={labels.placeholder}
        className="min-h-[60px] text-[15px] placeholder:text-gray-500"
      />
    );
  }

  return <p className="whitespace-pre-wrap break-words text-[15px]">{content}</p>;
}
