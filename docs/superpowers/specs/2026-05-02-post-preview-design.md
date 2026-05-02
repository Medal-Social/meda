# Post Preview Surface Design

Date: 2026-05-02
Status: Draft for review
Baseline: meda 2.0.0 (`feat/post-preview` from `origin/prod`)

## Goal

Add a new `post-preview` surface to `@medalsocial/meda` that renders pixel-accurate, channel-aware previews of social posts across 12 platforms (Twitter/X, LinkedIn, Instagram, Facebook, Threads, BlueSky, TikTok, YouTube, Google Business, Telegram, Discord, plus a generic fallback).

The previews port the proven implementations from `medal-monorepo/apps/web/src/components/composer/previews/` into a dependency-clean, framework-neutral, container-responsive form suitable for a public open-source UI library.

## Scope

**In scope**

- 12 platform preview components (`InstagramPreview`, `TwitterPreview`, etc.) plus `GenericPreview` fallback
- 12 chrome (device frame) components plus a shared `PlatformChrome` primitive
- Per-platform editable mode driven by `editable` + `onContentChange` callbacks
- Platform-specific extras as opt-in render-prop slots and typed prop bags (LinkedIn mentions, Telegram poll/keyboard/pin, Discord embeds)
- Container-query responsive layout (not viewport)
- Touch-target compliance (44×44 minimum)
- Dark mode honoring each platform's native palette
- Carousel behavior for Instagram/TikTok via a ported `useSwipe` hook
- Subpath export at `@medalsocial/meda/post-preview` plus root re-export
- Per-platform size-limit budgets to prove tree-shaking
- Storybook stories per platform and cross-cutting (responsive, all-platforms grid, dark mode, platform extras)
- Vitest tests per platform and cross-cutting (touch targets, responsive, dark mode, carousel, editable, render-prop slots, root exports)
- Docs MDX page with API reference, recipes, accessibility notes

**Out of scope**

- Channel picker / tab bar UI (consumers wire variant selection themselves)
- The `preview-area.tsx` shell with size toggles, dark-mode toggle, etc.
- Mention picker UI implementation (slot only — consumer brings)
- Telegram poll editor / Discord embed editor / LinkedIn mention picker editor UIs (data-driven render only; editing UI is consumer's concern)
- Lexical-based rich text editing for the content body (plain-text + minimal formatting only)
- Any Convex coupling (`Id<>`, mention-resolver Convex queries, etc.)
- shadcn-compatible registry entries for previews (deferred — primitives use registry, but a 13-platform registry surface is a separate decision)
- Image optimization (consumers bring their own `<Image>` if needed; meda renders plain `<img>`)

## Public API

### Primary import

Subpath import is the canonical pattern (matches existing meda surfaces):

```tsx
import {
  InstagramPreview,
  TwitterPreview,
  LinkedInPreview,
  PlatformChrome,
} from '@medalsocial/meda/post-preview';
```

A root re-export is also added for convenience:

```tsx
import { InstagramPreview } from '@medalsocial/meda';
```

Note: root-level imports forfeit the per-platform tree-shaking benefit (the root barrel re-exports the whole surface). Subpath import is the recommended pattern; per-platform size budgets cover only the subpath path.

### Type architecture

Types are split into a small base shape, per-platform extension props, and platform-extras helper types. Convex `Id<>` types are removed entirely.

```ts
// src/post-preview/types.ts
import type { ReactNode } from 'react';

/**
 * Platforms with a dedicated preview component. `GenericPreview` is the
 * fallback for any platform not in this list — it does not have its own
 * PlatformId.
 */
export type PlatformId =
  | 'twitter'
  | 'linkedin'
  | 'instagram'
  | 'facebook'
  | 'threads'
  | 'bluesky'
  | 'tiktok'
  | 'youtube'
  | 'google_business'
  | 'telegram'
  | 'discord';

/** Shared by every platform preview. */
export interface PostPreviewBaseProps {
  /** Channel display name (e.g. "Acme Studios"). */
  displayName: string;
  /** Channel handle/username without the leading @ (e.g. "acmestudios"). */
  username: string;
  /** Channel avatar URL. Falls back to initials when omitted. */
  avatarUrl?: string;
  /** Post body text. Plain text; minimal platform-specific formatting is applied at render time. */
  content: string;
  /** Image / video URLs for the post media. */
  mediaUrls?: string[];
  /** Optional override for character limit display. Per-platform defaults exist. */
  characterLimit?: number;
  /**
   * Visual frame mode:
   * - `card` (default): fluid feed-card layout, fits container.
   * - `device`: inside a device chrome (phone shell with status bar / tab bar) at native aspect ratio.
   */
  frame?: 'card' | 'device';
  /** Enable inline editing of `content`. Requires `onContentChange`. */
  editable?: boolean;
  /** Called on every keystroke when `editable` is true. */
  onContentChange?: (content: string) => void;
  /** Class applied to the outer wrapper element. */
  className?: string;
}
```

Per-platform extras live next to their platform module so consumers only import what they need:

```ts
// Telegram
export interface TelegramPollState {
  question: string;
  options: string[];
  multiple?: boolean;
  quiz?: boolean;
  correctOptionId?: number;
}
export interface TelegramInlineKeyboardButton {
  text: string;
  url?: string;
  callbackData?: string;
}
export interface TelegramInlineKeyboardMarkup {
  inline_keyboard: TelegramInlineKeyboardButton[][];
}
export interface TelegramPreviewProps extends PostPreviewBaseProps {
  poll?: TelegramPollState;
  pinMessage?: boolean;
  replyMarkup?: TelegramInlineKeyboardMarkup;
}

// Discord
export interface DiscordEmbedDraft {
  title?: string;
  description?: string;
  color?: number;
  url?: string;
  thumbnailUrl?: string;
  imageUrl?: string;
  authorName?: string;
  authorIconUrl?: string;
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
  footerText?: string;
  timestamp?: string;
}
export interface DiscordPreviewProps extends PostPreviewBaseProps {
  embeds?: DiscordEmbedDraft[];
  suppressEmbeds?: boolean;
}

// LinkedIn
export interface LinkedInMentionData {
  offset: number;
  length: number;
  urn: string;
  name: string;
}
export interface LinkedInPreviewProps extends PostPreviewBaseProps {
  mentions?: LinkedInMentionData[];
  onMentionsChange?: (mentions: LinkedInMentionData[]) => void;
  /**
   * Render a mention picker UI when '@' is typed in editable mode.
   * Receives the current query and a callback to commit / cancel.
   * Optional — if omitted, '@' types literally.
   */
  renderMentionPicker?: (ctx: {
    query: string;
    onPick: (mention: LinkedInMentionData) => void;
    onCancel: () => void;
  }) => ReactNode;
}
```

Platforms with no extras (`Twitter`, `Instagram`, `Facebook`, `Threads`, `BlueSky`, `TikTok`, `YouTube`, `GoogleBusiness`, `Generic`) export `<Platform>PreviewProps = PostPreviewBaseProps` for symmetry.

### Internationalization

Each platform exports a `Labels` interface and accepts a partial override:

```ts
export interface InstagramLabels {
  like: string;
  comment: string;
  share: string;
  save: string;
  viewAllComments: (count: number) => string;
  liked: (count: number) => string;
}

export const DEFAULT_INSTAGRAM_LABELS: InstagramLabels = {
  like: 'Like',
  comment: 'Comment',
  share: 'Share',
  save: 'Save',
  viewAllComments: (n) => `View all ${n} comments`,
  liked: (n) => `${n.toLocaleString()} likes`,
};

export interface InstagramPreviewProps extends PostPreviewBaseProps {
  labels?: Partial<InstagramLabels>;
}
```

No i18n framework dependency. Defaults are English. Consumers wire their own locale source if needed.

### Chrome components

Each chrome wraps any node (typically the matching preview) in a platform-accurate device frame:

```tsx
import { InstagramChrome, InstagramPreview } from '@medalsocial/meda/post-preview';

<InstagramChrome theme="dark">
  <InstagramPreview {...props} frame="card" />
</InstagramChrome>
```

`PlatformChrome` is a shared base that applies the phone shell, status bar, and bottom tab bar styling. Per-platform chromes apply the platform's brand color, app-bar layout, and bottom tab bar icons.

A platform preview rendered with `frame="device"` internally wraps itself in its own chrome — so consumers can either compose explicitly or get the shorthand.

## Architecture

### File layout

```
src/post-preview/
├── index.ts                      # internal barrel
├── public.ts                     # re-exported from src/index.ts
├── types.ts                      # PlatformId, PostPreviewBaseProps, shared extras types
├── platforms/
│   ├── index.ts                  # named re-exports of all 12 previews
│   ├── bluesky.tsx
│   ├── discord.tsx
│   ├── facebook.tsx
│   ├── generic.tsx
│   ├── google-business.tsx
│   ├── instagram.tsx
│   ├── linkedin.tsx
│   ├── telegram.tsx
│   ├── threads.tsx
│   ├── tiktok.tsx
│   ├── twitter.tsx
│   └── youtube.tsx
├── chrome/
│   ├── index.ts
│   ├── platform-chrome.tsx       # shared base
│   ├── bluesky-chrome.tsx
│   ├── discord-chrome.tsx
│   ├── facebook-chrome.tsx
│   ├── google-business-chrome.tsx
│   ├── instagram-chrome.tsx
│   ├── linkedin-chrome.tsx
│   ├── telegram-chrome.tsx
│   ├── threads-chrome.tsx
│   ├── tiktok-chrome.tsx
│   ├── twitter-chrome.tsx
│   └── youtube-chrome.tsx
├── internal/
│   ├── avatar.tsx                # private; <img> + initials fallback
│   ├── textarea.tsx              # private; plain <textarea>
│   ├── use-swipe.ts              # private; ported from medal-monorepo
│   ├── platform-meta.ts          # private; per-platform color, icon, char limit
│   └── format-content.ts         # private; mention/hashtag highlighting helpers
├── __stories__/
│   ├── fixtures.ts               # canonical post fixture per platform
│   ├── post-preview.mdx          # docs page
│   ├── all-platforms.stories.tsx
│   ├── responsive.stories.tsx
│   ├── platform-extras.stories.tsx
│   ├── bluesky.stories.tsx
│   ├── discord.stories.tsx
│   ├── facebook.stories.tsx
│   ├── generic.stories.tsx
│   ├── google-business.stories.tsx
│   ├── instagram.stories.tsx
│   ├── linkedin.stories.tsx
│   ├── telegram.stories.tsx
│   ├── threads.stories.tsx
│   ├── tiktok.stories.tsx
│   ├── twitter.stories.tsx
│   └── youtube.stories.tsx
└── __tests__/
    ├── bluesky.test.tsx
    ├── discord.test.tsx
    ├── facebook.test.tsx
    ├── generic.test.tsx
    ├── google-business.test.tsx
    ├── instagram.test.tsx
    ├── linkedin.test.tsx
    ├── telegram.test.tsx
    ├── threads.test.tsx
    ├── tiktok.test.tsx
    ├── twitter.test.tsx
    ├── youtube.test.tsx
    ├── labels-override.test.tsx
    ├── touch-targets.test.tsx
    ├── responsive.test.tsx
    ├── dark-mode.test.tsx
    ├── carousel.test.tsx
    ├── editable.test.tsx
    ├── render-prop-slots.test.tsx
    └── root-exports.test.ts
```

### Tree-shaking

Tree-shaking is preserved through three mechanisms:

1. **Subpath export.** `@medalsocial/meda/post-preview` is its own entry — root barrel is not traversed.
2. **No side effects in any module.** All preview/chrome/internal modules are pure exports. The `sideEffects` field in `package.json` is verified to exclude them or set to `false` for the post-preview tree.
3. **Per-file imports inside the surface.** Platform modules import their own deps directly (no shared mega-barrel). Shared internals (`avatar`, `use-swipe`, `platform-chrome`) are imported only by platforms that actually use them.

Verified by per-platform size-limit entries (see Testing section).

### Internal dependencies

| Need | Strategy |
|---|---|
| Avatar with initials fallback | `internal/avatar.tsx` — ~40 lines, plain `<img>`, no Radix. Private. |
| Editable text input | `internal/textarea.tsx` — plain `<textarea>` with token classes. Private. |
| Image optimization | Plain `<img>`. Consumers bring `Next/Image` etc. if needed. |
| `cn()` class composition | Use existing `src/lib/utils.ts` `cn` helper. |
| i18n | Per-platform `Labels` type + `DEFAULT_<PLATFORM>_LABELS` constant + optional `labels?: Partial<...>` prop. No framework. |
| Swipe gestures (Instagram/TikTok carousels) | Port `useSwipe` from medal-monorepo to `internal/use-swipe.ts`. Pointer events; respects vertical scroll. |
| Convex IDs | Removed from public API entirely. Mention pickers become render-prop slots. |
| Lucide icons | Already a meda peer dep. Use directly. |

No new runtime dependencies.

### Responsive behavior

Container queries via Tailwind `@container` utilities — previews respond to their **container width**, not viewport width. This matters because previews live in narrow side panels even on desktop.

Breakpoints used internally:

- `@[320px]` — compact (single column, minimal chrome)
- `@[420px]` — comfortable (default feed-card layout)
- `@[640px]` — expanded (extra metadata visible)

Story coverage at 280 / 360 / 420 / 640 / 800 px container widths.

Touch-target minimums enforced: every interactive element ≥ 44×44 px (`min-h-11 min-w-11` Tailwind utility), validated by an automated test.

Carousels (Instagram media, TikTok deck) use the ported `useSwipe` hook with pointer events. Swipeable elements declare `touch-action: pan-y` so vertical page scroll is preserved.

### Dark mode

Each platform honors its native scheme:

- **Always dark:** Discord, TikTok, YouTube
- **Always light by default; opt-in dark via `.dark` parent:** LinkedIn, Facebook, Google Business, Generic
- **Brand-controlled toggle:** Twitter/X exposes `theme?: 'light' | 'dim' | 'lights-out'` via prop
- **Threads, Instagram, BlueSky, Telegram:** follow the parent `.dark` class

Implementation uses Tailwind `dark:` variants composed with meda's existing `.dark` class system.

## Build & exports

Additive package changes:

- `package.json` `exports`: add
  ```json
  "./post-preview": {
    "types": "./dist/post-preview/index.d.ts",
    "default": "./dist/post-preview/index.js"
  }
  ```
- Build config: add `src/post-preview/index.ts` as a dedicated entry alongside the other surface entries.
- `src/index.ts`: add `export * from './post-preview/public.js';` (root re-export).
- `package.json` `sideEffects`: verify post-preview tree is included in the side-effect-free list (or that the field is `false`).

## Testing

### Vitest (`__tests__/`)

| Test file | Scope |
|---|---|
| `<platform>.test.tsx` (×12) | Renders without crashing. Shows displayName, username, content. Avatar fallback when no `avatarUrl`. Renders media when present. Respects `frame='card' \| 'device'`. Fires `onContentChange` when editable. |
| `labels-override.test.tsx` | Per-platform `labels` prop overrides defaults; partial overrides fall back per-key. |
| `touch-targets.test.tsx` | All interactive elements rendered by every platform measure ≥ 44×44 px. |
| `responsive.test.tsx` | Container query classes apply correct layout at 280 / 360 / 420 / 640 / 800 px (uses ResizeObserver mock + class assertion). |
| `dark-mode.test.tsx` | Each platform renders correctly under a `.dark` parent. Twitter `theme` prop applies the right class. |
| `carousel.test.tsx` | Instagram/TikTok carousels: dot navigation works, pointer drag advances, keyboard arrows advance. |
| `editable.test.tsx` | Editable mode: typing fires `onContentChange`. Character counter renders when `characterLimit` set. Over-limit state styled correctly. |
| `render-prop-slots.test.tsx` | LinkedIn `renderMentionPicker` is invoked with the right context when `@` is typed; absence falls back to plain text input. |
| `root-exports.test.ts` | All advertised exports present on `@medalsocial/meda` root and on `@medalsocial/meda/post-preview`. Acts as a public-API regression guard. |

Tooling: vitest + `@testing-library/react` (already in meda).

### Storybook (`__stories__/`)

| Story file | Stories |
|---|---|
| `<platform>.stories.tsx` (×12) | `Default`, `WithMedia`, `WithLongContent`, `WithoutAvatar`, `Editable`, `DeviceFrame`, `DarkMode` |
| `all-platforms.stories.tsx` | Side-by-side grid of all 12 with the same fixture content (visual regression baseline) |
| `responsive.stories.tsx` | One platform rendered at 280 / 360 / 420 / 640 / 800 px container widths |
| `platform-extras.stories.tsx` | Telegram poll, Discord embeds, LinkedIn mentions in their custom modes |
| `post-preview.mdx` | Docs page (API, when to use, examples, a11y notes, recipes) |

Fixtures live in `__stories__/fixtures.ts`: one realistic post per platform, plus media/mentions/polls/embeds.

### Size-limit (`.size-limit.cjs`)

Per-platform import budgets prove tree-shaking:

```js
{
  name: 'post-preview / Instagram',
  path: 'dist/post-preview/index.js',
  import: '{ InstagramPreview }',
  limit: '8 KB',
},
// ... one per platform (12 entries)
{
  name: 'post-preview / all platforms',
  path: 'dist/post-preview/index.js',
  import: '*',
  limit: '60 KB',
},
```

Initial limits are placeholders; final values set after first build, with ~20% headroom over measured size.

### Accessibility

Tested via `@storybook/addon-a11y` (already configured) on every story. Manual checklist in MDX:

- All interactive elements have accessible names
- All images have `alt` text (decorative chrome uses `alt=""`)
- Editable textarea has associated label
- Carousel exposes `role="region"` with `aria-label` and reachable controls
- Color contrast ≥ WCAG AA on all platform color combinations

## Documentation

`src/__stories__/docs/PostPreview.mdx`:

- API reference (auto-generated from JSDoc)
- "Which platform component do I use?" table mapping `PlatformId` → component
- Accessibility checklist
- Recipes:
  - Composing with a custom channel picker (consumer-owned variant state)
  - Editable mode with character counter
  - Dark-mode opt-in
  - Wiring a LinkedIn mention picker via `renderMentionPicker`

## Migration / coexistence

The medal app keeps its existing `composer/previews/` folder untouched. This work does **not** attempt to delete or replace the in-app copies. Once meda 2.x ships with `post-preview`, a follow-up in `medal-monorepo` can migrate the app to consume the meda exports — that migration is out of scope here.

## Risks & open questions

- **Visual fidelity drift:** Platforms restyle their UIs; previews can drift. Mitigation — fixture-driven story snapshots + Chromatic gating (already in CI).
- **Editable mode complexity:** Several platform-specific extras (Telegram poll, Discord embeds) are *displayed* by previews but *editing* them is out of scope. Document clearly that consumers wire their own editor UIs and pass updated state in.
- **Carousel pointer events on mobile webviews:** `useSwipe` works in tested browsers, but legacy webviews may need `touch-action` tuning. Covered by manual mobile testing in Chromatic.
- **Bundle size of all 12 platforms imported together:** ~60 KB is the budget; will refine after first measurement. If it grows, defer rarely-used platforms (Discord, Telegram) behind a `dynamic` import recommendation in docs.

## Non-goals (recap)

- No channel picker / variant selector
- No `preview-area` shell
- No mention/poll/embed editor UI
- No Lexical rich text
- No Convex coupling
- No new runtime deps
