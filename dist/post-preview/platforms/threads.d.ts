import type { PostPreviewBaseProps } from '../types.js';
export interface ThreadsLabels {
    placeholder: string;
    replies: (count: number) => string;
    like: string;
    comment: string;
    repost: string;
    share: string;
    moreOptions: string;
}
export declare const DEFAULT_THREADS_LABELS: ThreadsLabels;
export interface ThreadsPreviewProps extends PostPreviewBaseProps {
    labels?: Partial<ThreadsLabels>;
}
/**
 * Threads feed-card preview. Honors a parent `.dark` class for the dark
 * variant the platform itself uses.
 */
export declare function ThreadsPreview({ displayName, username, avatarUrl, content, mediaUrls, editable, onContentChange, className, labels, }: ThreadsPreviewProps): import("react/jsx-runtime").JSX.Element;
