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
    fields?: Array<{
        name: string;
        value: string;
        inline?: boolean;
    }>;
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
export declare const DEFAULT_DISCORD_LABELS: DiscordLabels;
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
export declare function DiscordPreview({ displayName, username: _username, avatarUrl, content, mediaUrls, editable, onContentChange, className, labels, embeds, suppressEmbeds, }: DiscordPreviewProps): import("react/jsx-runtime").JSX.Element;
