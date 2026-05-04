import type * as React from 'react';
import type { BlueSkyPreviewProps, DiscordPreviewProps, FacebookPreviewProps, GenericPreviewProps, GoogleBusinessPreviewProps, InstagramPreviewProps, LinkedInPreviewProps, TelegramPreviewProps, ThreadsPreviewProps, TikTokPreviewProps, TwitterPreviewProps, YouTubePreviewProps } from './platforms/index.js';
import type { PostPreviewSlots } from './types.js';
export type PostPreviewProps = PostPreviewSlots & (({
    platform: 'instagram';
} & InstagramPreviewProps) | ({
    platform: 'twitter';
} & TwitterPreviewProps) | ({
    platform: 'facebook';
} & FacebookPreviewProps) | ({
    platform: 'linkedin';
} & LinkedInPreviewProps) | ({
    platform: 'tiktok';
} & TikTokPreviewProps) | ({
    platform: 'youtube';
} & YouTubePreviewProps) | ({
    platform: 'threads';
} & ThreadsPreviewProps) | ({
    platform: 'bluesky';
} & BlueSkyPreviewProps) | ({
    platform: 'discord';
} & DiscordPreviewProps) | ({
    platform: 'telegram';
} & TelegramPreviewProps) | ({
    platform: 'google_business';
} & GoogleBusinessPreviewProps) | ({
    platform: 'generic';
} & GenericPreviewProps));
export declare function PostPreview(props: PostPreviewProps): React.ReactElement;
