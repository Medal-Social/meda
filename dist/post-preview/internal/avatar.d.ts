export interface AvatarProps {
    src?: string;
    displayName: string;
    className?: string;
}
/**
 * Internal avatar primitive used by post-preview platforms.
 * Plain `<img>` with an initials fallback; deliberately not exported
 * from the public surface so we don't lock consumers in. Consumers
 * who want a richer Avatar primitive should pull one from elsewhere.
 */
export declare function Avatar({ src, displayName, className }: AvatarProps): import("react/jsx-runtime").JSX.Element;
