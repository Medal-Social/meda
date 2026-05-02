import { type ReactNode } from 'react';
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
export declare const DEFAULT_LINKEDIN_LABELS: LinkedInLabels;
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
/**
 * LinkedIn feed-card preview. Renders avatar, name, headline (`username`),
 * content with optional `@mention` highlight spans, media grid, and the
 * standard Like/Comment/Repost/Send footer.
 */
export declare function LinkedInPreview({ displayName, username, avatarUrl, content, mediaUrls, editable, onContentChange, className, labels, mentions, onMentionsChange, renderMentionPicker, }: LinkedInPreviewProps): import("react/jsx-runtime").JSX.Element;
