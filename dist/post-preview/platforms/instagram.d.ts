import type { PostPreviewBaseProps } from '../types.js';
export type InstagramPostType = 'feed' | 'carousel' | 'reel' | 'story';
export interface InstagramLabels {
    placeholder: string;
    justNow: string;
    likes: (count: number) => string;
    addImage: string;
    moreOptions: string;
    like: string;
    comment: string;
    share: string;
    save: string;
    carouselPrev: string;
    carouselNext: string;
    carouselCounter: (current: number, total: number) => string;
    reelLabel: string;
    reelAudio: string;
    storyLabel: string;
    storySendMessage: string;
}
export declare const DEFAULT_INSTAGRAM_LABELS: InstagramLabels;
export interface InstagramPreviewProps extends PostPreviewBaseProps {
    labels?: Partial<InstagramLabels>;
    /** Override the layout. Auto-detects to `carousel` for >1 media. */
    instagramPostType?: InstagramPostType;
}
/**
 * Instagram preview supporting Feed / Carousel / Reel / Story layouts.
 * Auto-detects `carousel` when more than one media URL is present.
 */
export declare function InstagramPreview({ displayName, username, avatarUrl, content, mediaUrls, editable, onContentChange, className, labels, instagramPostType, }: InstagramPreviewProps): import("react/jsx-runtime").JSX.Element;
