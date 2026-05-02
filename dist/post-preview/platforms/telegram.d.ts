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
export declare const DEFAULT_TELEGRAM_LABELS: TelegramLabels;
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
export declare function TelegramPreview({ displayName, username: _username, avatarUrl, content, mediaUrls, editable, onContentChange, className, labels, poll, pinMessage, replyMarkup, }: TelegramPreviewProps): import("react/jsx-runtime").JSX.Element;
