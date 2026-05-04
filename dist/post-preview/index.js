// open/meda/src/post-preview/index.ts
//
// Subpath barrel for `@medalsocial/meda/post-preview`. Single top-level
// `PostPreview` component dispatches per-platform via the `platform` prop.
// Per-platform components, chromes, and helpers remain internal.
export { DEFAULT_BLUESKY_LABELS, DEFAULT_DISCORD_LABELS, DEFAULT_FACEBOOK_LABELS, DEFAULT_GENERIC_LABELS, DEFAULT_GOOGLE_BUSINESS_LABELS, DEFAULT_INSTAGRAM_LABELS, DEFAULT_LINKEDIN_LABELS, DEFAULT_TELEGRAM_LABELS, DEFAULT_THREADS_LABELS, DEFAULT_TIKTOK_LABELS, DEFAULT_TWITTER_LABELS, DEFAULT_YOUTUBE_LABELS, } from './platforms/index.js';
export { PostPreview } from './post-preview.js';
