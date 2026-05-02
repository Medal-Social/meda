export type ContentPartType = 'text' | 'mention' | 'hashtag' | 'url';
export interface ContentPart {
    type: ContentPartType;
    value: string;
}
/**
 * Split a content string into typed parts so platform components can
 * apply per-platform styling for mentions, hashtags, and URLs.
 *
 * Empty strings return an empty array (callers can render nothing).
 */
export declare function splitContent(content: string): ContentPart[];
