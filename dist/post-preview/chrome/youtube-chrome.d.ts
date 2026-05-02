import type { ReactNode } from 'react';
export interface YouTubeChromeProps {
    children: ReactNode;
    avatarUrl?: string;
    displayName?: string;
    className?: string;
    ariaLabel?: string;
    searchLabel?: string;
}
/**
 * YouTube chrome: top header (logo, search, actions) + category chips +
 * content area. Honors `.dark` for the dark variant.
 */
export declare function YouTubeChrome({ children, avatarUrl, displayName, className, ariaLabel, searchLabel, }: YouTubeChromeProps): import("react/jsx-runtime").JSX.Element;
