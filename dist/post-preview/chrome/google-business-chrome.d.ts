import type { ReactNode } from 'react';
export interface GoogleBusinessChromeProps {
    children: ReactNode;
    avatarUrl?: string;
    businessName?: string;
    className?: string;
    ariaLabel?: string;
    reviewsLabel?: string;
    addressLabel?: string;
    messageLabel?: string;
    directionsLabel?: string;
    overviewLabel?: string;
    updatesLabel?: string;
    reviewsTabLabel?: string;
    photosLabel?: string;
}
/**
 * Google Business Profile chrome: Google search bar + business profile card +
 * tabs (Overview / Updates / Reviews / Photos). Wraps an update preview as
 * the active "Updates" tab content.
 */
export declare function GoogleBusinessChrome({ children, avatarUrl, businessName, className, ariaLabel, reviewsLabel, addressLabel, messageLabel, directionsLabel, overviewLabel, updatesLabel, reviewsTabLabel, photosLabel, }: GoogleBusinessChromeProps): import("react/jsx-runtime").JSX.Element;
