import type { ReactNode } from 'react';
export interface InstagramChromeProps {
    children: ReactNode;
    avatarUrl?: string;
    displayName?: string;
    className?: string;
    ariaLabel?: string;
    yourStoryLabel?: string;
}
/**
 * Instagram chrome: white top header with logo, stories bar, and bottom
 * tab bar. Wraps any preview as the page body.
 */
export declare function InstagramChrome({ children, avatarUrl, displayName, className, ariaLabel, yourStoryLabel, }: InstagramChromeProps): import("react/jsx-runtime").JSX.Element;
