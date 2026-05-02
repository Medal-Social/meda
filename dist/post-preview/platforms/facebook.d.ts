import type { PostPreviewBaseProps } from '../types.js';
/**
 * Facebook preview labels. Override individual entries via the `labels` prop.
 */
export interface FacebookLabels {
    justNow: string;
    placeholder: string;
    comments: (count: number) => string;
    shares: (count: number) => string;
    like: string;
    comment: string;
    share: string;
    moreOptions: string;
}
export declare const DEFAULT_FACEBOOK_LABELS: FacebookLabels;
export interface FacebookPreviewProps extends PostPreviewBaseProps {
    labels?: Partial<FacebookLabels>;
}
/**
 * Facebook feed-card preview. Renders displayName, avatar, content, optional
 * media grid, and the standard Like/Comment/Share footer.
 */
export declare function FacebookPreview({ displayName, username: _username, avatarUrl, content, mediaUrls, editable, onContentChange, className, labels, }: FacebookPreviewProps): import("react/jsx-runtime").JSX.Element;
