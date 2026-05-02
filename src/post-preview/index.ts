// open/meda/src/post-preview/index.ts
//
// Subpath barrel for `@medalsocial/meda/post-preview`. Populated as
// platforms and chrome components land in subsequent tasks.

export type { PlatformChromeProps } from './chrome/platform-chrome.js';

export { PhoneStatusBar, PlatformChrome } from './chrome/platform-chrome.js';
export type {
  PlatformId,
  PostPreviewBaseProps,
  PostPreviewFrame,
} from './types.js';
