import type { ReactNode } from 'react';
export interface ThreadsChromeProps {
    children: ReactNode;
    avatarUrl?: string;
    displayName?: string;
    className?: string;
    ariaLabel?: string;
}
/**
 * Threads chrome: minimal logo header + bottom tab bar. Honors `.dark`
 * for the platform's signature monochrome dark scheme.
 */
export declare function ThreadsChrome({ children, avatarUrl, displayName, className, ariaLabel, }: ThreadsChromeProps): import("react/jsx-runtime").JSX.Element;
