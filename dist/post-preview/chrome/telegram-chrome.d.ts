import type { ReactNode } from 'react';
export interface TelegramChromeProps {
    children: ReactNode;
    avatarUrl?: string;
    channelName?: string;
    subscriberCount?: number;
    className?: string;
    ariaLabel?: string;
    subscribersLabel?: (count: string) => string;
    muteLabel?: string;
}
/**
 * Telegram chrome: blue-themed channel header with avatar, subscriber
 * count, and bottom mute action. Wraps any preview as the chat body.
 */
export declare function TelegramChrome({ children, avatarUrl, channelName, subscriberCount, className, ariaLabel, subscribersLabel, muteLabel, }: TelegramChromeProps): import("react/jsx-runtime").JSX.Element;
