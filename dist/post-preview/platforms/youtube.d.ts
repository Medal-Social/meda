import type { PostPreviewBaseProps } from '../types.js';
export interface YouTubeLabels {
    placeholder: string;
    justNow: string;
    like: string;
    dislike: string;
    share: string;
    moreOptions: string;
}
export declare const DEFAULT_YOUTUBE_LABELS: YouTubeLabels;
export interface YouTubePreviewProps extends PostPreviewBaseProps {
    labels?: Partial<YouTubeLabels>;
}
/**
 * YouTube community-post preview. Honors `.dark` for the dark variant.
 */
export declare function YouTubePreview({ displayName, username: _username, avatarUrl, content, mediaUrls, editable, onContentChange, className, labels, }: YouTubePreviewProps): import("react/jsx-runtime").JSX.Element;
