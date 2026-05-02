import type { ReactNode } from 'react';
export interface PlatformChromeProps {
    /** The preview content to wrap. */
    children: ReactNode;
    /** Platform name used for the accessible region label. */
    platform: string;
    /** Additional class names on the outer section. */
    className?: string;
    /** Render inside a phone shell (status bar + home indicator). */
    showPhoneFrame?: boolean;
}
/**
 * Base chrome wrapper. Per-platform chromes (e.g. `InstagramChrome`)
 * compose this with their own header / tab bar / brand color.
 *
 * Ported from `apps/web/src/components/composer/previews/chrome/platform-chrome.tsx`.
 */
export declare function PlatformChrome({ children, platform, className, showPhoneFrame, }: PlatformChromeProps): import("react/jsx-runtime").JSX.Element;
export declare function PhoneStatusBar(): import("react/jsx-runtime").JSX.Element;
