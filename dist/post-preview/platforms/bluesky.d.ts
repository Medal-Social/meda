import type { PostPreviewBaseProps } from '../types.js';
export interface BlueSkyLabels {
    placeholder: string;
    share: string;
    moreOptions: string;
}
export declare const DEFAULT_BLUESKY_LABELS: BlueSkyLabels;
export interface BlueSkyPreviewProps extends PostPreviewBaseProps {
    labels?: Partial<BlueSkyLabels>;
}
/**
 * BlueSky feed-card preview. Auto-formats the username with `.bsky.social`
 * if no domain is present.
 */
export declare function BlueSkyPreview({ displayName, username, avatarUrl, content, mediaUrls, editable, onContentChange, className, labels, }: BlueSkyPreviewProps): import("react/jsx-runtime").JSX.Element;
