import type { PostPreviewBaseProps } from '../types.js';
export interface TikTokLabels {
    placeholder: string;
    share: string;
    originalSound: (name: string) => string;
    like: string;
    comment: string;
    bookmark: string;
}
export declare const DEFAULT_TIKTOK_LABELS: TikTokLabels;
export interface TikTokPreviewProps extends PostPreviewBaseProps {
    labels?: Partial<TikTokLabels>;
}
/**
 * TikTok video-overlay preview. Always renders against a dark background to
 * match the platform's video-first UI.
 */
export declare function TikTokPreview({ displayName, username, avatarUrl, content, editable, onContentChange, className, labels, }: TikTokPreviewProps): import("react/jsx-runtime").JSX.Element;
