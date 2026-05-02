import type { ReactNode } from 'react';
export interface FacebookChromeProps {
    children: ReactNode;
    avatarUrl?: string;
    displayName?: string;
    className?: string;
    /** Accessible region label override. */
    ariaLabel?: string;
    /** Search input placeholder text. */
    searchLabel?: string;
}
/**
 * Facebook chrome: top header with logo, search, and primary tabs.
 * Wraps any preview as the page body.
 */
export declare function FacebookChrome({ children, avatarUrl, displayName, className, ariaLabel, searchLabel, }: FacebookChromeProps): import("react/jsx-runtime").JSX.Element;
