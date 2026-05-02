import { type ReactNode } from 'react';
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
export declare const DEFAULT_TWITTER_LABELS: TwitterLabels;
export interface TwitterPreviewProps extends PostPreviewBaseProps {
    labels?: Partial<TwitterLabels>;
    /** Visual theme. Defaults to `lights-out` to match X's default. */
    theme?: TwitterTheme;
    /** Optional render slot for an `@mention` picker. Called with the
     * current query (text after `@`) when the user types `@xxx` in the
     * editable textarea. */
    renderMentionPicker?: (ctx: TwitterMentionPickerContext) => ReactNode;
}
/**
 * Twitter / X feed-card preview. Supports light, dim, and lights-out
 * themes plus an optional `@mention` picker render slot.
 */
export declare function TwitterPreview({ displayName, username, avatarUrl, content, mediaUrls, editable, onContentChange, className, labels, theme, renderMentionPicker, }: TwitterPreviewProps): import("react/jsx-runtime").JSX.Element;
