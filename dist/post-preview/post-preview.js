import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { BlueSkyPreview } from './platforms/bluesky.js';
import { DiscordPreview } from './platforms/discord.js';
import { FacebookPreview } from './platforms/facebook.js';
import { GenericPreview } from './platforms/generic.js';
import { GoogleBusinessPreview } from './platforms/google-business.js';
import { InstagramPreview } from './platforms/instagram.js';
import { LinkedInPreview } from './platforms/linkedin.js';
import { TelegramPreview } from './platforms/telegram.js';
import { ThreadsPreview } from './platforms/threads.js';
import { TikTokPreview } from './platforms/tiktok.js';
import { TwitterPreview } from './platforms/twitter.js';
import { YouTubePreview } from './platforms/youtube.js';
export function PostPreview(props) {
    const { platform, mode, renderEditor, renderMediaPicker, renderEmojiPicker, renderMentionPicker, onMediaUrlsChange, ...rest } = props;
    const isEdit = mode === 'edit' || rest.editable === true;
    const showToolbar = isEdit &&
        (renderMediaPicker !== undefined ||
            renderEmojiPicker !== undefined ||
            renderMentionPicker !== undefined);
    const platformProps = {
        ...rest,
        editable: isEdit && renderEditor === undefined,
    };
    const editorNode = renderEditor?.({
        platform,
        value: rest.content ?? '',
        onChange: (next) => rest.onContentChange?.(next),
    });
    const toolbarNode = showToolbar ? (_jsxs("div", { className: "meda-post-preview__toolbar", role: "toolbar", "aria-label": "Post editor", children: [renderMediaPicker?.({
                platform,
                current: rest.mediaUrls,
                onPick: (next) => onMediaUrlsChange?.(next),
            }), renderEmojiPicker?.({
                onSelect: (emoji) => rest.onContentChange?.((rest.content ?? '') + emoji),
            }), renderMentionPicker?.({
                platform,
                query: '',
                onSelect: () => undefined,
            })] })) : null;
    const PreviewElement = renderPlatform(platform, platformProps);
    if (editorNode === undefined && toolbarNode === null) {
        return PreviewElement;
    }
    return (_jsxs("div", { className: "meda-post-preview", "data-platform": platform, children: [toolbarNode, editorNode, PreviewElement] }));
}
function renderPlatform(platform, props) {
    switch (platform) {
        case 'instagram':
            return _jsx(InstagramPreview, { ...props });
        case 'twitter':
            return _jsx(TwitterPreview, { ...props });
        case 'facebook':
            return _jsx(FacebookPreview, { ...props });
        case 'linkedin':
            return _jsx(LinkedInPreview, { ...props });
        case 'tiktok':
            return _jsx(TikTokPreview, { ...props });
        case 'youtube':
            return _jsx(YouTubePreview, { ...props });
        case 'threads':
            return _jsx(ThreadsPreview, { ...props });
        case 'bluesky':
            return _jsx(BlueSkyPreview, { ...props });
        case 'discord':
            return _jsx(DiscordPreview, { ...props });
        case 'telegram':
            return _jsx(TelegramPreview, { ...props });
        case 'google_business':
            return _jsx(GoogleBusinessPreview, { ...props });
        case 'generic':
            return _jsx(GenericPreview, { ...props });
    }
}
