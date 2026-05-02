import type { ReactNode } from 'react';
export interface TikTokChromeProps {
    children: ReactNode;
    avatarUrl?: string;
    displayName?: string;
    className?: string;
    ariaLabel?: string;
    followingLabel?: string;
    forYouLabel?: string;
    homeLabel?: string;
    discoverLabel?: string;
    inboxLabel?: string;
    profileLabel?: string;
}
/**
 * TikTok chrome: dark-themed top tabs (Following / For You) and bottom tab bar
 * with the signature TikTok create button.
 */
export declare function TikTokChrome({ children, avatarUrl, displayName, className, ariaLabel, followingLabel, forYouLabel, homeLabel, discoverLabel, inboxLabel, profileLabel, }: TikTokChromeProps): import("react/jsx-runtime").JSX.Element;
