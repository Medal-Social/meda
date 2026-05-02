import type { ReactNode } from 'react';
export interface DiscordChromeProps {
    children: ReactNode;
    serverIconUrl?: string;
    serverName?: string;
    channelName?: string;
    className?: string;
    ariaLabel?: string;
    textChannelsLabel?: string;
    searchLabel?: string;
    usernameLabel?: string;
    onlineLabel?: string;
    messageChannelLabel?: (channel: string) => string;
}
/**
 * Discord chrome: server sidebar + channel sidebar + main content + input.
 * Light-themed, brand-accurate. Wraps any preview as the messages area.
 */
export declare function DiscordChrome({ children, serverIconUrl, serverName, channelName, className, ariaLabel, textChannelsLabel, searchLabel, usernameLabel, onlineLabel, messageChannelLabel, }: DiscordChromeProps): import("react/jsx-runtime").JSX.Element;
