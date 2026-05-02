import type { ReactNode } from 'react';
export interface BlueSkyChromeProps {
    children: ReactNode;
    avatarUrl?: string;
    displayName?: string;
    handle?: string;
    className?: string;
    ariaLabel?: string;
    followingLabel?: string;
    discoverLabel?: string;
    composeLabel?: string;
}
/**
 * BlueSky chrome: top header (logo, profile, settings) + feed tabs +
 * floating compose + bottom tab bar.
 */
export declare function BlueSkyChrome({ children, avatarUrl, displayName, className, ariaLabel, followingLabel, discoverLabel, composeLabel, }: BlueSkyChromeProps): import("react/jsx-runtime").JSX.Element;
