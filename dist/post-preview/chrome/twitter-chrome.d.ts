import type { ReactNode } from 'react';
export interface TwitterChromeProps {
    children: ReactNode;
    avatarUrl?: string;
    displayName?: string;
    className?: string;
    /** Accessible region label override. */
    ariaLabel?: string;
    forYouLabel?: string;
    followingLabel?: string;
    composeLabel?: string;
}
/**
 * Twitter / X chrome: dark-themed top header with X logo + tabs and a
 * bottom navigation bar. Wraps any preview as the page body.
 */
export declare function TwitterChrome({ children, avatarUrl, displayName, className, ariaLabel, forYouLabel, followingLabel, composeLabel, }: TwitterChromeProps): import("react/jsx-runtime").JSX.Element;
