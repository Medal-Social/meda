import type { PlatformId, PostPreviewBaseProps } from '../types.js';
export interface GenericLabels {
    placeholderTemplate: (platform: string) => string;
    badgeTemplate: (platform: string) => string;
    moreOptions: string;
}
export declare const DEFAULT_GENERIC_LABELS: GenericLabels;
export interface GenericPreviewProps extends PostPreviewBaseProps {
    /**
     * The platform this preview represents. Accepts a known `PlatformId` (in
     * which case the per-platform display name is used) or any free-form
     * string for unknown platforms.
     */
    platform: PlatformId | (string & {});
    labels?: Partial<GenericLabels>;
}
/**
 * Generic preview. Used as a fallback for any platform without a dedicated
 * component. Layout is intentionally neutral so it composes well inside
 * `PlatformChrome` if a consumer wants to add device framing.
 */
export declare function GenericPreview({ platform, displayName, username, avatarUrl, content, mediaUrls, editable, onContentChange, className, labels, }: GenericPreviewProps): import("react/jsx-runtime").JSX.Element;
