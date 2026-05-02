import type { ReactNode } from 'react';
export interface LinkedInChromeProps {
    children: ReactNode;
    avatarUrl?: string;
    displayName?: string;
    className?: string;
    ariaLabel?: string;
    searchLabel?: string;
    homeLabel?: string;
    myNetworkLabel?: string;
    jobsLabel?: string;
    messagingLabel?: string;
    notificationsLabel?: string;
    meLabel?: string;
}
/**
 * LinkedIn chrome: white top header with logo, search, and primary nav
 * icons. Wraps any preview as the page body inside a centered card.
 */
export declare function LinkedInChrome({ children, avatarUrl, displayName, className, ariaLabel, searchLabel, homeLabel, myNetworkLabel, jobsLabel, messagingLabel, notificationsLabel, meLabel, }: LinkedInChromeProps): import("react/jsx-runtime").JSX.Element;
