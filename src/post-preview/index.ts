// open/meda/src/post-preview/index.ts
//
// Subpath barrel for `@medalsocial/meda/post-preview`. Re-exports the
// platform components, chromes, and types that make up the public API.

export type {
  BlueSkyChromeProps,
  FacebookChromeProps,
  GoogleBusinessChromeProps,
  PlatformChromeProps,
  ThreadsChromeProps,
  TikTokChromeProps,
  YouTubeChromeProps,
} from './chrome/index.js';
export {
  BlueSkyChrome,
  FacebookChrome,
  GoogleBusinessChrome,
  PhoneStatusBar,
  PlatformChrome,
  ThreadsChrome,
  TikTokChrome,
  YouTubeChrome,
} from './chrome/index.js';
export type {
  BlueSkyLabels,
  BlueSkyPreviewProps,
  FacebookLabels,
  FacebookPreviewProps,
  GenericLabels,
  GenericPreviewProps,
  GoogleBusinessLabels,
  GoogleBusinessPreviewProps,
  ThreadsLabels,
  ThreadsPreviewProps,
  TikTokLabels,
  TikTokPreviewProps,
  YouTubeLabels,
  YouTubePreviewProps,
} from './platforms/index.js';
export {
  BlueSkyPreview,
  DEFAULT_BLUESKY_LABELS,
  DEFAULT_FACEBOOK_LABELS,
  DEFAULT_GENERIC_LABELS,
  DEFAULT_GOOGLE_BUSINESS_LABELS,
  DEFAULT_THREADS_LABELS,
  DEFAULT_TIKTOK_LABELS,
  DEFAULT_YOUTUBE_LABELS,
  FacebookPreview,
  GenericPreview,
  GoogleBusinessPreview,
  ThreadsPreview,
  TikTokPreview,
  YouTubePreview,
} from './platforms/index.js';
export type {
  PlatformId,
  PostPreviewBaseProps,
  PostPreviewFrame,
} from './types.js';
