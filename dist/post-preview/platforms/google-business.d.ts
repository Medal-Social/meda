import type { PostPreviewBaseProps } from '../types.js';
export interface GoogleBusinessLabels {
    placeholder: string;
    postedJustNow: string;
    learnMore: string;
    like: string;
    share: string;
    moreOptions: string;
}
export declare const DEFAULT_GOOGLE_BUSINESS_LABELS: GoogleBusinessLabels;
export interface GoogleBusinessPreviewProps extends PostPreviewBaseProps {
    labels?: Partial<GoogleBusinessLabels>;
}
/**
 * Google Business Profile update-post preview. Renders the business name,
 * timestamp, content, optional media, and a Learn-more CTA button.
 */
export declare function GoogleBusinessPreview({ displayName, username: _username, avatarUrl, content, mediaUrls, editable, onContentChange, className, labels, }: GoogleBusinessPreviewProps): import("react/jsx-runtime").JSX.Element;
