# Post Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `@medalsocial/meda/post-preview` surface with 12 platform-specific post preview components plus device chromes, ported from `medal-monorepo/apps/web/src/components/composer/previews/` into a dependency-clean, container-responsive form.

**Architecture:** New `src/post-preview/` surface with `platforms/`, `chrome/`, `internal/`, `__stories__/`, `__tests__/` subfolders. Subpath-exported via `package.json` `exports`. Root re-exported from `src/index.ts`. No Convex coupling; mention/poll/embed editors become render-prop slots. Container-query responsive via Tailwind `@container`.

**Tech Stack:** React 19, TypeScript (strict), Tailwind v4, vitest + @testing-library/react, Storybook 10, lucide-react, size-limit. Same toolchain as existing meda surfaces.

**Spec:** `docs/superpowers/specs/2026-05-02-post-preview-design.md`

**Source-of-truth files in medal-monorepo (subagents may read directly):**
- `apps/web/src/components/composer/previews/<platform>-preview.tsx` — 13 files
- `apps/web/src/components/composer/previews/chrome/<platform>-chrome.tsx` — 12 files
- `apps/web/src/components/composer/previews/index.tsx` — registry (not used in meda)
- `apps/web/src/components/composer/types.ts` — `PlatformPreviewProps` source
- `apps/web/src/components/composer/editors/use-swipe.ts` — useSwipe hook source

**Conventions to follow (verified by reading kanban + auth + primitives):**
- `'use client';` at top of every component file using hooks/state
- ESM imports with `.js` suffix (TypeScript `moduleResolution: bundler` allows `.js` for `.ts/.tsx` source)
- `cn` from `../../lib/utils.js` (post-preview is at `src/post-preview/`, two levels deep)
- `data-slot="<slot-name>"` shadcn-style attribute on rendered components
- `data-testid` for icon test discovery
- Strict TypeScript (`noUnusedLocals`, `noUnusedParameters`)
- Per-surface `index.ts` barrel + `public.ts` re-export consumed by `src/index.ts`
- Test files colocated as `__tests__/<name>.test.tsx`, stories as `__stories__/<name>.stories.tsx`
- `wcag.test.tsx` per surface using `vitest-axe` (existing pattern in chat, kanban, etc.)

**Pre-commit hook:** Runs `pnpm lint && pnpm test && pnpm check:stories`. Tests require **Node 24** (Node 25 has localStorage/jsdom issues). All commits in this worktree must run with `PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH"`.

**Commit style:** Conventional commits, no AI-attribution footer. One commit per task (per CLAUDE.md "frequent commits"). Pre-commit hook must pass; never use `--no-verify`.

---

## Task layout overview

| # | Task | Files touched | Parallelizable with |
|---|---|---|---|
| 1 | Scaffold types and folder | `src/post-preview/{index,public,types}.ts` | — |
| 2 | Internal: avatar | `src/post-preview/internal/avatar.tsx` (+ test) | 3, 4, 5 |
| 3 | Internal: textarea | `src/post-preview/internal/textarea.tsx` (+ test) | 2, 4, 5 |
| 4 | Internal: use-swipe | `src/post-preview/internal/use-swipe.ts` (+ test) | 2, 3, 5 |
| 5 | Internal: platform-meta | `src/post-preview/internal/platform-meta.ts` | 2, 3, 4 |
| 6 | Internal: format-content | `src/post-preview/internal/format-content.ts` (+ test) | — (after 1) |
| 7 | Shared chrome: PlatformChrome | `src/post-preview/chrome/platform-chrome.tsx` (+ test) | — (after 1) |
| 8 | Build/exports wiring | `package.json`, `src/index.ts` | — (after 1) |
| 9–20 | Per-platform preview + chrome + test + story (×12) | one folder of files per platform | each task ⊥ each other (parallel) — all need 1–8 done |
| 21 | All-platforms grid story | `src/post-preview/__stories__/all-platforms.stories.tsx` | 22, 23 |
| 22 | Responsive story | `src/post-preview/__stories__/responsive.stories.tsx` | 21, 23 |
| 23 | Platform-extras story | `src/post-preview/__stories__/platform-extras.stories.tsx` | 21, 22 |
| 24 | Touch-targets test | `src/post-preview/__tests__/touch-targets.test.tsx` | 25–31 |
| 25 | Responsive test | `src/post-preview/__tests__/responsive.test.tsx` | 24, 26–31 |
| 26 | Dark-mode test | `src/post-preview/__tests__/dark-mode.test.tsx` | 24–25, 27–31 |
| 27 | Carousel test | `src/post-preview/__tests__/carousel.test.tsx` | 24–26, 28–31 |
| 28 | Editable test | `src/post-preview/__tests__/editable.test.tsx` | 24–27, 29–31 |
| 29 | Render-prop-slots test | `src/post-preview/__tests__/render-prop-slots.test.tsx` | 24–28, 30–31 |
| 30 | Labels-override test | `src/post-preview/__tests__/labels-override.test.tsx` | 24–29, 31 |
| 31 | Root-exports test | `src/post-preview/__tests__/root-exports.test.ts` | 24–30 |
| 32 | WCAG test | `src/post-preview/wcag.test.tsx` | — (after 9–20) |
| 33 | Docs MDX page | `src/__stories__/docs/PostPreview.mdx` | 21–31 |
| 34 | Build + measure + size budgets | `.size-limit.cjs` | — (after 9–20) |
| 35 | Add changeset | `.changeset/post-preview.md` | — (final) |

---

## Task 1: Scaffold types and folder

**Files:**
- Create: `src/post-preview/types.ts`
- Create: `src/post-preview/index.ts`
- Create: `src/post-preview/public.ts`

- [ ] **Step 1: Create the directory structure**

```bash
mkdir -p src/post-preview/{platforms,chrome,internal,__stories__,__tests__}
```

- [ ] **Step 2: Write `src/post-preview/types.ts`**

```ts
/**
 * Public types for the post-preview surface.
 *
 * These types are framework-neutral and intentionally free of
 * Convex / app-specific identifiers. Platform-specific extras
 * (Telegram poll, Discord embeds, LinkedIn mentions) live next to
 * their platform module.
 */

/**
 * Platforms with a dedicated preview component. Any platform not in
 * this list should use `GenericPreview` as a fallback.
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

/**
 * Visual frame mode for any platform preview.
 * - `card` (default): fluid feed-card layout. Fits container width.
 * - `device`: wraps in a phone shell with status bar / tab bar at
 *   a native phone aspect ratio.
 */
export type PostPreviewFrame = 'card' | 'device';

/**
 * Shared props for every platform preview.
 *
 * Per-platform components extend this with their own optional extras
 * (e.g. `TelegramPreviewProps` adds `poll`, `pinMessage`, `replyMarkup`).
 */
export interface PostPreviewBaseProps {
  /** Channel display name (e.g. "Acme Studios"). */
  displayName: string;
  /** Channel handle/username; leading `@` is optional and stripped. */
  username: string;
  /** Channel avatar URL. Falls back to initials when omitted. */
  avatarUrl?: string;
  /** Post body text. Plain text; per-platform formatting (mentions,
   * hashtags) is applied at render time. */
  content: string;
  /** Image / video URLs for the post media. */
  mediaUrls?: string[];
  /** Optional override for the per-platform character limit display. */
  characterLimit?: number;
  /** Visual frame mode. See `PostPreviewFrame`. */
  frame?: PostPreviewFrame;
  /** Enable inline editing of `content`. Requires `onContentChange`. */
  editable?: boolean;
  /** Called on every keystroke when `editable` is true. */
  onContentChange?: (content: string) => void;
  /** Class applied to the outer wrapper element. */
  className?: string;
}
```

- [ ] **Step 3: Write `src/post-preview/index.ts` (subpath barrel — empty for now, populated as platforms land)**

```ts
// open/meda/src/post-preview/index.ts
//
// Subpath barrel for `@medalsocial/meda/post-preview`. Populated as
// platforms and chrome components land in subsequent tasks.

export type {
  PlatformId,
  PostPreviewBaseProps,
  PostPreviewFrame,
} from './types.js';
```

- [ ] **Step 4: Write `src/post-preview/public.ts` (re-exported from root barrel)**

```ts
// open/meda/src/post-preview/public.ts
//
// Re-exported into `src/index.ts` so consumers can import from the
// package root as well as the subpath. Subpath import is preferred
// for tree-shaking; root import is provided for convenience.

export * from './index.js';
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `pnpm typecheck`
Expected: Exit code 0, no errors mentioning `post-preview`.

- [ ] **Step 6: Commit**

```bash
PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git add src/post-preview && \
  PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git commit -m "Scaffold post-preview surface types and barrels"
```

---

## Task 2: Internal Avatar component

**Files:**
- Create: `src/post-preview/internal/avatar.tsx`
- Create: `src/post-preview/internal/avatar.test.tsx`

- [ ] **Step 1: Write the failing test `src/post-preview/internal/avatar.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Avatar } from './avatar.js';

describe('Avatar (post-preview internal)', () => {
  it('renders the image when src is provided', () => {
    render(<Avatar src="https://example.com/me.png" displayName="Acme Studios" />);
    const img = screen.getByRole('img', { name: 'Acme Studios' });
    expect(img).toHaveAttribute('src', 'https://example.com/me.png');
  });

  it('falls back to initials when src is missing', () => {
    render(<Avatar displayName="Acme Studios" />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('falls back to initials when image fails to load', () => {
    render(<Avatar src="bad-url" displayName="Bravo Co" />);
    const img = screen.getByRole('img', { name: 'Bravo Co' });
    img.dispatchEvent(new Event('error'));
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('forwards className to the wrapper', () => {
    render(<Avatar displayName="A" className="custom-class" />);
    expect(screen.getByText('A').parentElement).toHaveClass('custom-class');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" pnpm vitest run --project unit src/post-preview/internal/avatar.test.tsx`
Expected: FAIL — module not found `./avatar.js`.

- [ ] **Step 3: Write `src/post-preview/internal/avatar.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { cn } from '../../lib/utils.js';

export interface AvatarProps {
  src?: string;
  displayName: string;
  className?: string;
}

function initialOf(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  return trimmed.charAt(0).toUpperCase();
}

/**
 * Internal avatar primitive used by post-preview platforms.
 * Plain `<img>` with an initials fallback; deliberately not exported
 * from the public surface so we don't lock consumers in. Consumers
 * who want a richer Avatar primitive should pull one from elsewhere.
 */
export function Avatar({ src, displayName, className }: AvatarProps) {
  const [errored, setErrored] = useState(false);
  const showFallback = !src || errored;

  return (
    <span
      data-slot="post-preview-avatar"
      className={cn(
        'inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-medium text-muted-foreground',
        className
      )}
    >
      {showFallback ? (
        <span aria-label={displayName}>{initialOf(displayName)}</span>
      ) : (
        <img
          src={src}
          alt={displayName}
          loading="lazy"
          decoding="async"
          onError={() => setErrored(true)}
          className="h-full w-full object-cover"
        />
      )}
    </span>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" pnpm vitest run --project unit src/post-preview/internal/avatar.test.tsx`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git add src/post-preview/internal/avatar.tsx src/post-preview/internal/avatar.test.tsx && \
  PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git commit -m "Add post-preview internal Avatar with initials fallback"
```

---

## Task 3: Internal Textarea component

**Files:**
- Create: `src/post-preview/internal/textarea.tsx`
- Create: `src/post-preview/internal/textarea.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/post-preview/internal/textarea.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Textarea } from './textarea.js';

describe('Textarea (post-preview internal)', () => {
  it('renders a textarea element', () => {
    render(<Textarea aria-label="content" />);
    expect(screen.getByRole('textbox', { name: 'content' })).toBeInTheDocument();
  });

  it('forwards ref to the underlying element', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} aria-label="content" />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('fires onChange when the user types', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Textarea aria-label="content" onChange={onChange} />);
    await user.type(screen.getByRole('textbox', { name: 'content' }), 'hi');
    expect(onChange).toHaveBeenCalled();
  });

  it('merges className with defaults', () => {
    render(<Textarea aria-label="content" className="custom" />);
    expect(screen.getByRole('textbox', { name: 'content' })).toHaveClass('custom');
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" pnpm vitest run --project unit src/post-preview/internal/textarea.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/post-preview/internal/textarea.tsx`**

```tsx
'use client';

import { type ComponentProps, forwardRef } from 'react';
import { cn } from '../../lib/utils.js';

export type TextareaProps = ComponentProps<'textarea'>;

/**
 * Internal textarea used by post-preview platforms in editable mode.
 * Minimal styling — platform-specific previews layer on their own
 * background, font, and color via className. Not exported publicly.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        data-slot="post-preview-textarea"
        className={cn(
          'block w-full resize-none border-0 bg-transparent p-0 outline-none',
          'placeholder:text-muted-foreground/60',
          'focus-visible:ring-0 focus-visible:ring-offset-0',
          className
        )}
        {...props}
      />
    );
  }
);
```

- [ ] **Step 4: Run to verify pass**

Run: `PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" pnpm vitest run --project unit src/post-preview/internal/textarea.test.tsx`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git add src/post-preview/internal/textarea.tsx src/post-preview/internal/textarea.test.tsx && \
  PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git commit -m "Add post-preview internal Textarea wrapper"
```

---

## Task 4: Internal useSwipe hook

**Files:**
- Create: `src/post-preview/internal/use-swipe.ts`
- Create: `src/post-preview/internal/use-swipe.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/post-preview/internal/use-swipe.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useSwipe } from './use-swipe.js';

function Harness({ onLeft, onRight }: { onLeft: () => void; onRight: () => void }) {
  const handlers = useSwipe({ onSwipeLeft: onLeft, onSwipeRight: onRight });
  return (
    <div data-testid="swipe" {...handlers}>
      swipe-area
    </div>
  );
}

describe('useSwipe', () => {
  it('fires onSwipeLeft when finger drags left past threshold', () => {
    const onLeft = vi.fn();
    const onRight = vi.fn();
    render(<Harness onLeft={onLeft} onRight={onRight} />);
    const el = screen.getByTestId('swipe');
    fireEvent.touchStart(el, { touches: [{ clientX: 200 }] });
    fireEvent.touchEnd(el, { changedTouches: [{ clientX: 100 }] });
    expect(onLeft).toHaveBeenCalledTimes(1);
    expect(onRight).not.toHaveBeenCalled();
  });

  it('fires onSwipeRight when finger drags right past threshold', () => {
    const onLeft = vi.fn();
    const onRight = vi.fn();
    render(<Harness onLeft={onLeft} onRight={onRight} />);
    const el = screen.getByTestId('swipe');
    fireEvent.touchStart(el, { touches: [{ clientX: 50 }] });
    fireEvent.touchEnd(el, { changedTouches: [{ clientX: 200 }] });
    expect(onRight).toHaveBeenCalledTimes(1);
    expect(onLeft).not.toHaveBeenCalled();
  });

  it('does not fire when delta is below threshold', () => {
    const onLeft = vi.fn();
    const onRight = vi.fn();
    render(<Harness onLeft={onLeft} onRight={onRight} />);
    const el = screen.getByTestId('swipe');
    fireEvent.touchStart(el, { touches: [{ clientX: 100 }] });
    fireEvent.touchEnd(el, { changedTouches: [{ clientX: 110 }] });
    expect(onLeft).not.toHaveBeenCalled();
    expect(onRight).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" pnpm vitest run --project unit src/post-preview/internal/use-swipe.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/post-preview/internal/use-swipe.ts`**

```ts
import { useCallback, useRef } from 'react';
import type { TouchEvent } from 'react';

const SWIPE_THRESHOLD = 50;

export interface UseSwipeOptions {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

/**
 * Touch swipe detection for carousel navigation. Tracks touchstart/touchend
 * and fires onSwipeLeft / onSwipeRight when the horizontal delta exceeds
 * SWIPE_THRESHOLD (50px). Returns event handlers to spread onto the
 * swipeable container.
 *
 * Ported from `apps/web/src/components/composer/editors/use-swipe.ts`.
 */
export function useSwipe({ onSwipeLeft, onSwipeRight }: UseSwipeOptions) {
  const touchStartX = useRef<number | null>(null);

  const onTouchStart = useCallback((e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const onTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (touchStartX.current === null) return;
      const deltaX = e.changedTouches[0].clientX - touchStartX.current;
      touchStartX.current = null;
      if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
      if (deltaX < 0) onSwipeLeft();
      else onSwipeRight();
    },
    [onSwipeLeft, onSwipeRight]
  );

  return { onTouchStart, onTouchEnd };
}
```

- [ ] **Step 4: Run to verify pass**

Run: `PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" pnpm vitest run --project unit src/post-preview/internal/use-swipe.test.tsx`
Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git add src/post-preview/internal/use-swipe.ts src/post-preview/internal/use-swipe.test.tsx && \
  PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git commit -m "Add post-preview internal useSwipe hook"
```

---

## Task 5: Internal platform-meta

**Files:**
- Create: `src/post-preview/internal/platform-meta.ts`

- [ ] **Step 1: Write `src/post-preview/internal/platform-meta.ts`**

Reference: `apps/web/src/components/composer/types.ts` `PLATFORM_META` (line ~492). Drop fields not relevant to previews (`oauthScopes`, `connectorKey`, etc.). Keep brand color, character limit, display name, and a Lucide icon ref.

```ts
import type { LucideIcon } from 'lucide-react';
import type { PlatformId } from '../types.js';

export interface PlatformMeta {
  /** Human-readable name (e.g. "Twitter / X"). */
  displayName: string;
  /** Platform brand color (hex with leading #). */
  brandColor: string;
  /** Soft per-platform character limit (consumers may override per render). */
  characterLimit: number;
}

export const PLATFORM_META: Record<PlatformId, PlatformMeta> = {
  twitter:        { displayName: 'X',                brandColor: '#000000', characterLimit: 280 },
  linkedin:       { displayName: 'LinkedIn',         brandColor: '#0A66C2', characterLimit: 3000 },
  instagram:      { displayName: 'Instagram',        brandColor: '#E4405F', characterLimit: 2200 },
  facebook:       { displayName: 'Facebook',         brandColor: '#1877F2', characterLimit: 63206 },
  threads:        { displayName: 'Threads',          brandColor: '#000000', characterLimit: 500 },
  bluesky:        { displayName: 'Bluesky',          brandColor: '#0085FF', characterLimit: 300 },
  tiktok:         { displayName: 'TikTok',           brandColor: '#000000', characterLimit: 4000 },
  youtube:        { displayName: 'YouTube',          brandColor: '#FF0000', characterLimit: 5000 },
  google_business:{ displayName: 'Google Business',  brandColor: '#4285F4', characterLimit: 1500 },
  telegram:       { displayName: 'Telegram',         brandColor: '#26A5E4', characterLimit: 4096 },
  discord:        { displayName: 'Discord',          brandColor: '#5865F2', characterLimit: 2000 },
};

/**
 * Resolve a Lucide icon to use as a platform glyph. Returns `undefined`
 * when no built-in glyph is appropriate; consumers should render their
 * own brand SVG in that case (e.g. inside chrome components).
 *
 * This indirection lets platform-meta stay icon-agnostic while still
 * enabling chromes to render a default glyph.
 */
export function platformIconHint(platform: PlatformId): LucideIcon | undefined {
  // Lucide does not ship official social brand glyphs; chromes render their
  // own inline SVGs. Return undefined to make the absence explicit.
  void platform;
  return undefined;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm typecheck`
Expected: Exit 0.

- [ ] **Step 3: Commit**

```bash
PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git add src/post-preview/internal/platform-meta.ts && \
  PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git commit -m "Add post-preview internal platform metadata table"
```

---

## Task 6: Internal format-content helpers

**Files:**
- Create: `src/post-preview/internal/format-content.ts`
- Create: `src/post-preview/internal/format-content.test.ts`

These helpers split a content string into mention / hashtag / URL / text parts so platform components can apply per-platform highlighting consistently.

- [ ] **Step 1: Write the failing test**

```ts
// src/post-preview/internal/format-content.test.ts
import { describe, expect, it } from 'vitest';
import { splitContent } from './format-content.js';

describe('splitContent', () => {
  it('returns a single text part when nothing is special', () => {
    expect(splitContent('hello world')).toEqual([{ type: 'text', value: 'hello world' }]);
  });

  it('splits @mentions from text', () => {
    expect(splitContent('hi @alice and @bob_smith')).toEqual([
      { type: 'text', value: 'hi ' },
      { type: 'mention', value: '@alice' },
      { type: 'text', value: ' and ' },
      { type: 'mention', value: '@bob_smith' },
    ]);
  });

  it('splits #hashtags from text', () => {
    expect(splitContent('check out #launch_day')).toEqual([
      { type: 'text', value: 'check out ' },
      { type: 'hashtag', value: '#launch_day' },
    ]);
  });

  it('splits http(s) URLs from text', () => {
    expect(splitContent('see https://example.com/path now')).toEqual([
      { type: 'text', value: 'see ' },
      { type: 'url', value: 'https://example.com/path' },
      { type: 'text', value: ' now' },
    ]);
  });

  it('handles empty string', () => {
    expect(splitContent('')).toEqual([]);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" pnpm vitest run --project unit src/post-preview/internal/format-content.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/post-preview/internal/format-content.ts`**

```ts
export type ContentPartType = 'text' | 'mention' | 'hashtag' | 'url';

export interface ContentPart {
  type: ContentPartType;
  value: string;
}

const PATTERN = /(@[A-Za-z0-9_]+|#[A-Za-z0-9_]+|https?:\/\/\S+)/g;

/**
 * Split a content string into typed parts so platform components can
 * apply per-platform styling for mentions, hashtags, and URLs.
 *
 * Empty strings return an empty array (callers can render nothing).
 */
export function splitContent(content: string): ContentPart[] {
  if (!content) return [];
  const parts: ContentPart[] = [];
  let lastIndex = 0;
  for (const match of content.matchAll(PATTERN)) {
    const matchIndex = match.index ?? 0;
    if (matchIndex > lastIndex) {
      parts.push({ type: 'text', value: content.slice(lastIndex, matchIndex) });
    }
    const value = match[0];
    if (value.startsWith('@')) parts.push({ type: 'mention', value });
    else if (value.startsWith('#')) parts.push({ type: 'hashtag', value });
    else parts.push({ type: 'url', value });
    lastIndex = matchIndex + value.length;
  }
  if (lastIndex < content.length) {
    parts.push({ type: 'text', value: content.slice(lastIndex) });
  }
  return parts;
}
```

- [ ] **Step 4: Run to verify pass**

Run: `PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" pnpm vitest run --project unit src/post-preview/internal/format-content.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git add src/post-preview/internal/format-content.ts src/post-preview/internal/format-content.test.ts && \
  PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git commit -m "Add post-preview internal content splitter"
```

---

## Task 7: Shared PlatformChrome

**Files:**
- Create: `src/post-preview/chrome/platform-chrome.tsx`
- Create: `src/post-preview/chrome/platform-chrome.test.tsx`
- Modify: `src/post-preview/index.ts` (add `PlatformChrome` export)

Reference: `apps/web/src/components/composer/previews/chrome/platform-chrome.tsx`. Drop the `'use client';` requirement only from the chrome (it has no hooks). Replace `@/lib/utils` import with relative `../../lib/utils.js`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/post-preview/chrome/platform-chrome.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PlatformChrome } from './platform-chrome.js';

describe('PlatformChrome', () => {
  it('wraps children in a section labelled by the platform name', () => {
    render(
      <PlatformChrome platform="Instagram">
        <div data-testid="content">post body</div>
      </PlatformChrome>
    );
    expect(screen.getByRole('region', { name: 'Instagram preview' })).toContainElement(
      screen.getByTestId('content')
    );
  });

  it('renders without phone frame by default', () => {
    render(
      <PlatformChrome platform="X">
        <div>x</div>
      </PlatformChrome>
    );
    const region = screen.getByRole('region', { name: 'X preview' });
    expect(region).not.toHaveAttribute('data-phone-frame', 'true');
  });

  it('renders the phone frame when showPhoneFrame is true', () => {
    render(
      <PlatformChrome platform="Instagram" showPhoneFrame>
        <div>ig</div>
      </PlatformChrome>
    );
    const region = screen.getByRole('region', { name: 'Instagram preview' });
    expect(region).toHaveAttribute('data-phone-frame', 'true');
    // Status bar is inside
    expect(screen.getByText('9:41')).toBeInTheDocument();
  });

  it('forwards className to the outer wrapper', () => {
    render(
      <PlatformChrome platform="X" className="custom-class">
        <div />
      </PlatformChrome>
    );
    expect(screen.getByRole('region', { name: 'X preview' })).toHaveClass('custom-class');
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" pnpm vitest run --project unit src/post-preview/chrome/platform-chrome.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/post-preview/chrome/platform-chrome.tsx`**

```tsx
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils.js';

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
export function PlatformChrome({
  children,
  platform,
  className,
  showPhoneFrame = false,
}: PlatformChromeProps) {
  if (showPhoneFrame) {
    return (
      <section
        data-slot="post-preview-chrome"
        data-phone-frame="true"
        aria-label={`${platform} preview`}
        className={cn(
          'relative mx-auto max-w-[375px]',
          'rounded-[3rem] border-[14px] border-gray-900 bg-gray-900',
          'shadow-xl',
          className
        )}
      >
        <div
          aria-hidden
          className="-translate-x-1/2 absolute top-0 left-1/2 z-10 h-[30px] w-[120px] rounded-b-2xl bg-gray-900"
        />
        <div className="relative overflow-hidden rounded-[2.2rem] bg-white">
          <PhoneStatusBar />
          {children}
          <div
            aria-hidden
            className="-translate-x-1/2 absolute bottom-2 left-1/2 h-[5px] w-[134px] rounded-full bg-gray-900"
          />
        </div>
      </section>
    );
  }

  return (
    <section
      data-slot="post-preview-chrome"
      aria-label={`${platform} preview`}
      className={cn('overflow-hidden rounded-lg shadow-lg', className)}
    >
      {children}
    </section>
  );
}

export function PhoneStatusBar() {
  return (
    <div className="absolute top-[30px] right-0 left-0 z-10 flex items-center justify-between bg-transparent px-6 py-2 text-gray-900">
      <span className="font-semibold text-[14px]">9:41</span>
      <div className="flex items-center gap-1">
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <rect x="1" y="14" width="4" height="8" rx="1" />
          <rect x="7" y="10" width="4" height="12" rx="1" />
          <rect x="13" y="6" width="4" height="16" rx="1" />
          <rect x="19" y="2" width="4" height="20" rx="1" />
        </svg>
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 3C7.03 3 2.47 5.19 0 9l2.5 2.5C4.49 8.92 8.03 7 12 7s7.51 1.92 9.5 4.5L24 9c-2.47-3.81-7.03-6-12-6zm0 6c-3.03 0-5.78 1.23-7.78 3.22L6.5 14.5C7.87 13.07 9.84 12 12 12s4.13 1.07 5.5 2.5l2.28-2.28C17.78 10.23 15.03 9 12 9zm0 6c-1.65 0-3.14.62-4.28 1.63L12 21l4.28-4.37C15.14 15.62 13.65 15 12 15z" />
        </svg>
        <svg className="h-4 w-6" viewBox="0 0 28 14" fill="currentColor" aria-hidden="true">
          <rect x="0" y="0" width="24" height="14" rx="3" stroke="currentColor" strokeWidth="1" fill="none" />
          <rect x="25" y="4" width="3" height="6" rx="1" />
          <rect x="2" y="2" width="19" height="10" rx="1.5" />
        </svg>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run to verify pass**

Run: `PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" pnpm vitest run --project unit src/post-preview/chrome/platform-chrome.test.tsx`
Expected: PASS, 4 tests.

- [ ] **Step 5: Add to `src/post-preview/index.ts`**

```ts
export { PhoneStatusBar, PlatformChrome } from './chrome/platform-chrome.js';
export type { PlatformChromeProps } from './chrome/platform-chrome.js';
```

- [ ] **Step 6: Commit**

```bash
PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git add src/post-preview/chrome/platform-chrome.tsx src/post-preview/chrome/platform-chrome.test.tsx src/post-preview/index.ts && \
  PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git commit -m "Add PlatformChrome shared base for post-preview"
```

---

## Task 8: Build / exports wiring

**Files:**
- Modify: `package.json`
- Modify: `src/index.ts`
- Create (touch): `src/post-preview/chrome/index.ts`
- Create (touch): `src/post-preview/platforms/index.ts`

- [ ] **Step 1: Add subpath to `package.json` `exports`**

In the `exports` object (around the existing `./marketing` / `./panel` entries), add:

```json
"./post-preview": {
  "types": "./dist/post-preview/index.d.ts",
  "default": "./dist/post-preview/index.js"
},
```

- [ ] **Step 2: Add root re-export to `src/index.ts`**

Append:

```ts
export * from './post-preview/public.js';
```

- [ ] **Step 3: Create `src/post-preview/chrome/index.ts` placeholder**

```ts
export { PhoneStatusBar, PlatformChrome } from './platform-chrome.js';
export type { PlatformChromeProps } from './platform-chrome.js';
```

- [ ] **Step 4: Create `src/post-preview/platforms/index.ts` placeholder**

```ts
// Per-platform exports are appended as platforms land.
export {};
```

- [ ] **Step 5: Verify build**

Run: `pnpm build`
Expected: Exit 0. `dist/post-preview/index.js` exists.

```bash
ls dist/post-preview/
```
Expected: `index.js`, `index.d.ts`, plus `chrome/` and `internal/` subfolders with `.js` and `.d.ts` files.

- [ ] **Step 6: Commit**

```bash
PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git add package.json src/index.ts src/post-preview/chrome/index.ts src/post-preview/platforms/index.ts dist && \
  PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git commit -m "Wire up post-preview subpath export and root re-export"
```

(Note: per `.gitignore` comment, `dist/` IS committed because consumers `pnpm link` against it. Check `git status` before staging — only commit `dist/post-preview/**`, not modifications to other dist folders unless the build legitimately changed them.)

---

## Tasks 9–20: Per-platform preview + chrome + test + story

Each per-platform task follows the same shape. The full code is in `apps/web/src/components/composer/previews/<platform>-preview.tsx` and `apps/web/src/components/composer/previews/chrome/<platform>-chrome.tsx`. Subagents read those files directly and apply the **porting recipe** below.

### Porting recipe (apply to every platform)

Replace these imports / behaviors in the source:

| Source pattern | Replace with |
|---|---|
| `import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';` | `import { Avatar } from '../internal/avatar.js';` and use `<Avatar src={avatarUrl} displayName={displayName} className="h-10 w-10" />`. |
| `import { SimpleOptimizedImage } from '@/components/ui/optimized-image';` | Use plain `<img src={url} alt={...} loading="lazy" decoding="async" />`. Apply existing className/style. |
| `import { Textarea } from '@/components/ui/textarea';` | `import { Textarea } from '../internal/textarea.js';` |
| `import { cn } from '@/lib/utils';` | `import { cn } from '../../lib/utils.js';` |
| `import * as m from '@/paraglide/messages';` and `m['composer.previews.<platform>.<key>']()` calls | Replace with a per-platform `Labels` interface + `DEFAULT_<PLATFORM>_LABELS` constant + `labels?: Partial<Labels>` prop. Use English defaults from the original message keys (look up in `apps/web/messages/en.json` if unsure). |
| `import { MentionPicker, useMentionTrigger } from '../mentions';` | Drop. Replace `editable && workspaceId && mention.enabled && <MentionPicker .../>` with: if a `renderMentionPicker` prop is provided, call it with `{ query, onPick, onCancel }`. Otherwise render nothing. |
| `useMentionTrigger(textareaRef, workspaceId)` | Replace with a tiny inline hook that detects '@' input, tracks `query`, exposes `{ isOpen, query, close, insertMention, handleInput }`. Only Twitter/LinkedIn need this; if the source platform doesn't use mentions, omit. |
| `workspaceId: Id<'workspaces'>` / `channelId: Id<'channels'>` props | Drop. Removed from public API. |
| `useSwipe` from `'../editors/use-swipe'` | `import { useSwipe } from '../internal/use-swipe.js';` |
| `import type { PlatformPreviewProps } from '../types';` | Replace with the platform-specific props type defined in this task (extending `PostPreviewBaseProps` from `'../types.js'`). |
| Hardcoded `editable = true` defaults | Change to `editable = false` (read-only is the safer default for a public library). |
| `'use client';` is **required** at the top of every preview file (they all use hooks). |
| Outermost wrapper element gets `data-slot="post-preview"` and `data-platform="<platform-id>"` for testing. |
| Wrap the whole thing in `<div className="@container">` so per-platform `@[420px]:...` classes work. |

### Per-platform task template

```markdown
## Task <N>: <Platform> preview

**Source files (read-only reference):**
- `apps/web/src/components/composer/previews/<platform>-preview.tsx`
- `apps/web/src/components/composer/previews/chrome/<platform>-chrome.tsx`

**Files to create:**
- `src/post-preview/platforms/<platform>.tsx`
- `src/post-preview/chrome/<platform>-chrome.tsx`
- `src/post-preview/__tests__/<platform>.test.tsx`
- `src/post-preview/__stories__/<platform>.stories.tsx`

**Files to modify:**
- `src/post-preview/platforms/index.ts` — add re-export of preview component + types
- `src/post-preview/chrome/index.ts` — add re-export of chrome component
- `src/post-preview/index.ts` — add re-exports

**Steps:**

- [ ] Step 1: Write the failing test (see test template below)
- [ ] Step 2: Run the test to verify failure
- [ ] Step 3: Read the source preview file from medal-monorepo
- [ ] Step 4: Write the platform component applying the porting recipe
- [ ] Step 5: Read the source chrome file and write the chrome component
- [ ] Step 6: Wire up exports (platforms/index.ts, chrome/index.ts, index.ts)
- [ ] Step 7: Run the test to verify it passes
- [ ] Step 8: Write the story (see story template below)
- [ ] Step 9: Run lint and typecheck
- [ ] Step 10: Commit
```

### Test template (every platform)

Replace `<Platform>` / `<platform>` and `<PlatformId>` accordingly. **Each platform test must contain all five cases verbatim.**

```tsx
// src/post-preview/__tests__/<platform>.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { <Platform>Preview } from '../platforms/<platform>.js';

const FIXTURE = {
  displayName: 'Acme Studios',
  username: 'acmestudios',
  avatarUrl: 'https://example.com/acme.png',
  content: 'Hello from <Platform>!',
};

describe('<Platform>Preview', () => {
  it('renders displayName, username, and content', () => {
    render(<<Platform>Preview {...FIXTURE} />);
    expect(screen.getByText('Acme Studios')).toBeInTheDocument();
    expect(screen.getByText(/acmestudios/)).toBeInTheDocument();
    expect(screen.getByText(/Hello from <Platform>/)).toBeInTheDocument();
  });

  it('falls back to initials when avatarUrl is missing', () => {
    render(<<Platform>Preview {...FIXTURE} avatarUrl={undefined} />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('renders media when mediaUrls is provided', () => {
    render(<<Platform>Preview {...FIXTURE} mediaUrls={['https://example.com/a.jpg']} />);
    expect(screen.getAllByRole('img').length).toBeGreaterThan(0);
  });

  it('fires onContentChange when editable and the user types', async () => {
    const user = userEvent.setup();
    const onContentChange = vi.fn();
    render(<<Platform>Preview {...FIXTURE} editable onContentChange={onContentChange} />);
    const textbox = screen.getByRole('textbox');
    await user.type(textbox, '!');
    expect(onContentChange).toHaveBeenCalled();
  });

  it('exposes the platform on the outer slot for testing', () => {
    const { container } = render(<<Platform>Preview {...FIXTURE} />);
    expect(container.querySelector('[data-platform="<platform-id>"]')).not.toBeNull();
  });
});
```

(For platforms with extras (Telegram, Discord, LinkedIn), append additional test cases that exercise those props — see Task 24+ for cross-cutting tests that cover them more deeply.)

### Story template (every platform)

```tsx
// src/post-preview/__stories__/<platform>.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { <Platform>Preview } from '../platforms/<platform>.js';

const meta: Meta<typeof <Platform>Preview> = {
  title: 'post-preview / <Platform>',
  component: <Platform>Preview,
  args: {
    displayName: 'Acme Studios',
    username: 'acmestudios',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
    content: 'Just shipped a new <Platform> integration. What do you think?',
  },
};
export default meta;
type Story = StoryObj<typeof <Platform>Preview>;

export const Default: Story = {};

export const WithMedia: Story = {
  args: {
    mediaUrls: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop',
    ],
  },
};

export const WithLongContent: Story = {
  args: {
    content:
      'When the day comes that AI replaces the social-media manager role, ' +
      'we will all look back fondly on the era of carefully-crafted captions ' +
      'and emoji-strewn posts that made up the early 2020s.',
  },
};

export const WithoutAvatar: Story = {
  args: { avatarUrl: undefined },
};

export const Editable: Story = {
  args: { editable: true },
};

export const DeviceFrame: Story = {
  args: { frame: 'device' },
};

export const DarkMode: Story = {
  decorators: [(Story) => <div className="dark bg-neutral-950 p-6"><Story /></div>],
};
```

### Task list (one per platform)

For each row below, follow the template above. **All twelve tasks are independent of each other** (only depend on Tasks 1–8) — dispatch in parallel.

- [ ] **Task 9: twitter** — extras: `theme?: 'light' | 'dim' | 'lights-out'` (Twitter-specific dark variant) and `renderMentionPicker?: (ctx) => ReactNode` (mirrors LinkedIn — Twitter has the simplest mention picker in the original source). Source: `twitter-preview.tsx`.
- [ ] **Task 10: linkedin** — extras: `mentions?`, `onMentionsChange?`, `renderMentionPicker?` (see types in spec). Source: `linkedin-preview.tsx`.
- [ ] **Task 11: instagram** — extras: `instagramPostType?: 'feed' | 'carousel' | 'reel' | 'story'`. Source: `instagram-preview.tsx` (longest at 459 lines — multiple sub-components for feed/carousel/reel/story). Carousel uses `useSwipe`. Add a separate test case for carousel dot navigation (covered cross-cuttingly in Task 27 too).
- [ ] **Task 12: facebook** — no extras. Source: `facebook-preview.tsx`.
- [ ] **Task 13: threads** — no extras. Source: `threads-preview.tsx`.
- [ ] **Task 14: bluesky** — no extras. Source: `bluesky-preview.tsx`.
- [ ] **Task 15: tiktok** — no extras. Source: `tiktok-preview.tsx`. Always renders dark.
- [ ] **Task 16: youtube** — no extras. Source: `youtube-preview.tsx`.
- [ ] **Task 17: google_business** (file `google-business.tsx`) — no extras. Source: `google-business-preview.tsx`.
- [ ] **Task 18: telegram** — extras: `poll?: TelegramPollState`, `pinMessage?: boolean`, `replyMarkup?: TelegramInlineKeyboardMarkup`. Source: `telegram-preview.tsx` (262 lines). Define the types in `src/post-preview/platforms/telegram.tsx` and re-export from the index.
- [ ] **Task 19: discord** — extras: `embeds?: DiscordEmbedDraft[]`, `suppressEmbeds?: boolean`. Source: `discord-preview.tsx` (212 lines).
- [ ] **Task 20: generic** — no extras; takes a `platform: PlatformId | string` prop to label the chrome. Source: `generic-preview.tsx`. Acts as fallback.

After Task 20, `src/post-preview/index.ts` should re-export:

- All 12 preview components (`InstagramPreview`, `TwitterPreview`, …)
- All 12 chrome components (`InstagramChrome`, `TwitterChrome`, …) plus `PlatformChrome` and `PhoneStatusBar`
- All per-platform props types (`InstagramPreviewProps`, `TwitterPreviewProps`, …)
- All per-platform Labels types (`InstagramLabels`, `TwitterLabels`, …)
- All per-platform `DEFAULT_<PLATFORM>_LABELS` constants
- All platform-specific extras types: `TelegramPollState`, `TelegramInlineKeyboardButton`, `TelegramInlineKeyboardMarkup`, `DiscordEmbedDraft`, `LinkedInMentionData`
- `PlatformId`, `PostPreviewBaseProps`, `PostPreviewFrame` from `./types.js`

Per-platform tasks must update `src/post-preview/index.ts` (not just `platforms/index.ts`) so the subpath barrel resolves these exports.

---

## Task 21: All-platforms grid story

**Files:**
- Create: `src/post-preview/__stories__/all-platforms.stories.tsx`
- Create: `src/post-preview/__stories__/fixtures.ts`

- [ ] **Step 1: Write `src/post-preview/__stories__/fixtures.ts`**

```ts
import type { PostPreviewBaseProps } from '../types.js';

export const FIXTURE_AVATAR =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces';

export const FIXTURE_MEDIA = {
  square: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=800&fit=crop',
  landscape: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&h=675&fit=crop',
  portrait: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=720&h=1280&fit=crop',
};

export const BASE_FIXTURE: PostPreviewBaseProps = {
  displayName: 'Acme Studios',
  username: 'acmestudios',
  avatarUrl: FIXTURE_AVATAR,
  content:
    'Just shipped a new platform integration — three months of work, finally live. ' +
    'Try it out and let us know what you think! #launch #shipit',
};
```

- [ ] **Step 2: Write `src/post-preview/__stories__/all-platforms.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  BlueSkyPreview,
  DiscordPreview,
  FacebookPreview,
  GenericPreview,
  GoogleBusinessPreview,
  InstagramPreview,
  LinkedInPreview,
  TelegramPreview,
  ThreadsPreview,
  TikTokPreview,
  TwitterPreview,
  YouTubePreview,
} from '../index.js';
import { BASE_FIXTURE, FIXTURE_MEDIA } from './fixtures.js';

const meta: Meta = {
  title: 'post-preview / All Platforms',
};
export default meta;
type Story = StoryObj;

const platforms = [
  { name: 'Twitter / X',     Component: TwitterPreview },
  { name: 'LinkedIn',        Component: LinkedInPreview },
  { name: 'Instagram',       Component: InstagramPreview },
  { name: 'Facebook',        Component: FacebookPreview },
  { name: 'Threads',         Component: ThreadsPreview },
  { name: 'BlueSky',         Component: BlueSkyPreview },
  { name: 'TikTok',          Component: TikTokPreview },
  { name: 'YouTube',         Component: YouTubePreview },
  { name: 'Google Business', Component: GoogleBusinessPreview },
  { name: 'Telegram',        Component: TelegramPreview },
  { name: 'Discord',         Component: DiscordPreview },
  { name: 'Generic',         Component: (p: object) => <GenericPreview {...(p as never)} platform="custom" /> },
];

export const Grid: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {platforms.map(({ name, Component }) => (
        <div key={name}>
          <h3 className="mb-2 font-semibold text-sm">{name}</h3>
          <Component {...BASE_FIXTURE} mediaUrls={[FIXTURE_MEDIA.landscape]} />
        </div>
      ))}
    </div>
  ),
};
```

- [ ] **Step 3: Run storybook check**

Run: `PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" pnpm check:stories`
Expected: No new warnings about post-preview.

- [ ] **Step 4: Commit**

```bash
PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git add src/post-preview/__stories__/all-platforms.stories.tsx src/post-preview/__stories__/fixtures.ts && \
  PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git commit -m "Add post-preview all-platforms grid story"
```

---

## Task 22: Responsive story

**Files:**
- Create: `src/post-preview/__stories__/responsive.stories.tsx`

- [ ] **Step 1: Write `src/post-preview/__stories__/responsive.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TwitterPreview } from '../index.js';
import { BASE_FIXTURE } from './fixtures.js';

const meta: Meta = {
  title: 'post-preview / Responsive',
};
export default meta;
type Story = StoryObj;

const widths = [280, 360, 420, 640, 800] as const;

export const ContainerWidths: Story = {
  render: () => (
    <div className="space-y-6">
      {widths.map((w) => (
        <section key={w}>
          <h3 className="mb-2 font-semibold text-sm">{w}px container</h3>
          <div style={{ width: w }} className="border border-dashed">
            <TwitterPreview {...BASE_FIXTURE} />
          </div>
        </section>
      ))}
    </div>
  ),
};
```

- [ ] **Step 2: Commit**

```bash
PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git add src/post-preview/__stories__/responsive.stories.tsx && \
  PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git commit -m "Add post-preview responsive widths story"
```

---

## Task 23: Platform-extras story

**Files:**
- Create: `src/post-preview/__stories__/platform-extras.stories.tsx`

- [ ] **Step 1: Write the story**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  type DiscordEmbedDraft,
  DiscordPreview,
  type LinkedInMentionData,
  LinkedInPreview,
  type TelegramPollState,
  TelegramPreview,
} from '../index.js';
import { BASE_FIXTURE } from './fixtures.js';

const meta: Meta = {
  title: 'post-preview / Platform Extras',
};
export default meta;
type Story = StoryObj;

const POLL: TelegramPollState = {
  question: 'Which feature should ship next?',
  options: ['Calendar', 'Email builder', 'Workflow editor', 'All three (the right answer)'],
  multiple: false,
};

const EMBEDS: DiscordEmbedDraft[] = [
  {
    title: 'Release v2.1',
    description: 'New post previews surface, performance improvements, and a fresh CLI.',
    color: 0x5865f2,
    url: 'https://example.com/release',
    fields: [
      { name: 'Status', value: 'Stable', inline: true },
      { name: 'Downloads', value: '1.2k', inline: true },
    ],
    footerText: 'Released today',
  },
];

export const TelegramWithPoll: Story = {
  render: () => (
    <TelegramPreview
      {...BASE_FIXTURE}
      content="Help us prioritize 👇"
      poll={POLL}
      pinMessage
    />
  ),
};

export const DiscordWithEmbed: Story = {
  render: () => (
    <DiscordPreview {...BASE_FIXTURE} content="See the release notes:" embeds={EMBEDS} />
  ),
};

export const LinkedInWithMentionPicker: Story = {
  render: () => {
    const [content, setContent] = useState('Excited to share that @');
    return (
      <LinkedInPreview
        {...BASE_FIXTURE}
        editable
        content={content}
        onContentChange={setContent}
        renderMentionPicker={({ query, onPick, onCancel }) => (
          <div className="mt-2 rounded border bg-popover p-2 text-sm shadow">
            <div className="mb-1 text-xs text-muted-foreground">
              Showing matches for &quot;{query}&quot;
            </div>
            {(['Alex Chen', 'Bobbie Park', 'Carlos Diaz'] as const).map((name) => (
              <button
                key={name}
                type="button"
                className="block w-full rounded px-2 py-1 text-left hover:bg-accent"
                onClick={() =>
                  onPick({
                    offset: content.length - 1,
                    length: name.length + 1,
                    urn: `urn:li:person:${name}`,
                    name,
                  } satisfies LinkedInMentionData)
                }
              >
                {name}
              </button>
            ))}
            <button
              type="button"
              className="mt-1 block w-full rounded px-2 py-1 text-left text-muted-foreground text-xs hover:bg-accent"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        )}
      />
    );
  },
};
```

- [ ] **Step 2: Commit**

```bash
PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git add src/post-preview/__stories__/platform-extras.stories.tsx && \
  PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git commit -m "Add post-preview platform extras story"
```

---

## Task 24: Touch-targets test

**Files:**
- Create: `src/post-preview/__tests__/touch-targets.test.tsx`

- [ ] **Step 1: Write the test**

```tsx
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  BlueSkyPreview,
  DiscordPreview,
  FacebookPreview,
  GenericPreview,
  GoogleBusinessPreview,
  InstagramPreview,
  LinkedInPreview,
  TelegramPreview,
  ThreadsPreview,
  TikTokPreview,
  TwitterPreview,
  YouTubePreview,
} from '../index.js';
import { BASE_FIXTURE } from '../__stories__/fixtures.js';

const MIN_TOUCH = 44;

const platforms: Array<[string, (props: object) => JSX.Element]> = [
  ['twitter',         (p) => <TwitterPreview {...(p as never)} />],
  ['linkedin',        (p) => <LinkedInPreview {...(p as never)} />],
  ['instagram',       (p) => <InstagramPreview {...(p as never)} />],
  ['facebook',        (p) => <FacebookPreview {...(p as never)} />],
  ['threads',         (p) => <ThreadsPreview {...(p as never)} />],
  ['bluesky',         (p) => <BlueSkyPreview {...(p as never)} />],
  ['tiktok',          (p) => <TikTokPreview {...(p as never)} />],
  ['youtube',         (p) => <YouTubePreview {...(p as never)} />],
  ['google_business', (p) => <GoogleBusinessPreview {...(p as never)} />],
  ['telegram',        (p) => <TelegramPreview {...(p as never)} />],
  ['discord',         (p) => <DiscordPreview {...(p as never)} />],
  ['generic',         (p) => <GenericPreview {...(p as never)} platform="custom" />],
];

describe('post-preview touch targets', () => {
  for (const [name, Component] of platforms) {
    it(`${name}: every interactive element is at least ${MIN_TOUCH}×${MIN_TOUCH}px`, () => {
      const { container } = render(<Component {...BASE_FIXTURE} />);
      const interactive = container.querySelectorAll('button, a, [role="button"]');
      expect(interactive.length).toBeGreaterThan(0);
      for (const el of interactive) {
        // jsdom doesn't compute layout — assert that the element carries
        // a Tailwind size class providing at least the minimum touch area
        // (min-h-11 / min-w-11 / size-11 / h-11 / w-11 — 11 * 4px = 44px).
        const classList = el.className.toString();
        const hasSize =
          /\b(min-h-1[1-9]|min-w-1[1-9]|size-1[1-9]|h-1[1-9]|w-1[1-9]|p-[3-9]|p-1\d|-m-[2-9])\b/.test(
            classList
          );
        expect(hasSize, `${name}: ${classList || '(no classes)'}`).toBe(true);
      }
    });
  }
});
```

- [ ] **Step 2: Run; expect failures (this drives a follow-up fix per platform if any element is too small)**

Run: `PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" pnpm vitest run --project unit src/post-preview/__tests__/touch-targets.test.tsx`

If any platform fails, fix the offending button class on that platform (`-m-2 p-2` → `-m-2.5 p-2.5` etc.) until the test passes. Commit each fix as part of this task.

- [ ] **Step 3: Commit**

```bash
PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git add src/post-preview/__tests__/touch-targets.test.tsx src/post-preview/platforms && \
  PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git commit -m "Add post-preview touch-target compliance test"
```

---

## Task 25: Responsive test

**Files:**
- Create: `src/post-preview/__tests__/responsive.test.tsx`

- [ ] **Step 1: Write the test**

```tsx
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TwitterPreview } from '../index.js';
import { BASE_FIXTURE } from '../__stories__/fixtures.js';

describe('post-preview responsive', () => {
  it('outer wrapper carries an @container class so children can use container queries', () => {
    const { container } = render(<TwitterPreview {...BASE_FIXTURE} />);
    const wrapper = container.querySelector('[data-slot="post-preview"]');
    expect(wrapper).not.toBeNull();
    expect(wrapper!.className).toMatch(/@container/);
  });

  it('uses container-query Tailwind syntax (@[Npx]:) somewhere in the rendered tree', () => {
    const { container } = render(<TwitterPreview {...BASE_FIXTURE} />);
    const html = container.innerHTML;
    expect(html).toMatch(/@\[\d+px\]:/);
  });
});
```

- [ ] **Step 2: Run; if failing because Twitter doesn't yet have container classes, add them.**

- [ ] **Step 3: Commit**

```bash
PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git add src/post-preview/__tests__/responsive.test.tsx && \
  PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git commit -m "Add post-preview responsive container-query test"
```

---

## Task 26: Dark-mode test

**Files:**
- Create: `src/post-preview/__tests__/dark-mode.test.tsx`

- [ ] **Step 1: Write the test**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  FacebookPreview,
  GoogleBusinessPreview,
  InstagramPreview,
  LinkedInPreview,
  ThreadsPreview,
} from '../index.js';
import { BASE_FIXTURE } from '../__stories__/fixtures.js';

const opt: Array<[string, (p: object) => JSX.Element]> = [
  ['facebook',        (p) => <FacebookPreview {...(p as never)} />],
  ['google_business', (p) => <GoogleBusinessPreview {...(p as never)} />],
  ['instagram',       (p) => <InstagramPreview {...(p as never)} />],
  ['linkedin',        (p) => <LinkedInPreview {...(p as never)} />],
  ['threads',         (p) => <ThreadsPreview {...(p as never)} />],
];

describe('post-preview dark mode', () => {
  for (const [name, Component] of opt) {
    it(`${name} renders inside a .dark parent without crashing and uses dark: variants`, () => {
      const { container } = render(
        <div className="dark">
          <Component {...BASE_FIXTURE} />
        </div>
      );
      expect(screen.getByText('Acme Studios')).toBeInTheDocument();
      expect(container.innerHTML).toMatch(/dark:/);
    });
  }
});
```

- [ ] **Step 2: Commit**

```bash
PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git add src/post-preview/__tests__/dark-mode.test.tsx && \
  PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git commit -m "Add post-preview dark-mode opt-in test"
```

---

## Task 27: Carousel test

**Files:**
- Create: `src/post-preview/__tests__/carousel.test.tsx`

- [ ] **Step 1: Write the test**

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { InstagramPreview } from '../index.js';
import { BASE_FIXTURE, FIXTURE_MEDIA } from '../__stories__/fixtures.js';

describe('Instagram carousel', () => {
  const mediaUrls = [FIXTURE_MEDIA.square, FIXTURE_MEDIA.landscape, FIXTURE_MEDIA.portrait];

  it('renders dot navigation matching the number of slides', () => {
    render(<InstagramPreview {...BASE_FIXTURE} mediaUrls={mediaUrls} />);
    const dots = screen.getAllByRole('button', { name: /go to slide/i });
    expect(dots).toHaveLength(mediaUrls.length);
  });

  it('advances slides when a dot is clicked', () => {
    render(<InstagramPreview {...BASE_FIXTURE} mediaUrls={mediaUrls} />);
    const dots = screen.getAllByRole('button', { name: /go to slide/i });
    fireEvent.click(dots[2]);
    expect(dots[2]).toHaveAttribute('aria-current', 'true');
  });

  it('advances on left swipe', () => {
    const { container } = render(
      <InstagramPreview {...BASE_FIXTURE} mediaUrls={mediaUrls} />
    );
    const swipe = container.querySelector('[data-slot="instagram-carousel-track"]');
    expect(swipe).not.toBeNull();
    fireEvent.touchStart(swipe!, { touches: [{ clientX: 200 }] });
    fireEvent.touchEnd(swipe!, { changedTouches: [{ clientX: 50 }] });
    const dots = screen.getAllByRole('button', { name: /go to slide/i });
    expect(dots[1]).toHaveAttribute('aria-current', 'true');
  });
});
```

- [ ] **Step 2: Run; if any of the assertions fail, update the Instagram preview implementation to match (add `aria-label="Go to slide N"`, `aria-current`, and `data-slot="instagram-carousel-track"` on the swipeable element).**

- [ ] **Step 3: Commit**

```bash
PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git add src/post-preview/__tests__/carousel.test.tsx src/post-preview/platforms/instagram.tsx && \
  PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git commit -m "Add Instagram carousel navigation test"
```

---

## Task 28: Editable test

**Files:**
- Create: `src/post-preview/__tests__/editable.test.tsx`

- [ ] **Step 1: Write the test**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TwitterPreview } from '../index.js';
import { BASE_FIXTURE } from '../__stories__/fixtures.js';

describe('post-preview editable mode', () => {
  it('renders a textbox when editable is true', () => {
    render(<TwitterPreview {...BASE_FIXTURE} editable />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('does not render a textbox when editable is false', () => {
    render(<TwitterPreview {...BASE_FIXTURE} />);
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('fires onContentChange on each keystroke', async () => {
    const user = userEvent.setup();
    const onContentChange = vi.fn();
    render(
      <TwitterPreview {...BASE_FIXTURE} editable onContentChange={onContentChange} content="" />
    );
    await user.type(screen.getByRole('textbox'), 'abc');
    expect(onContentChange).toHaveBeenCalledTimes(3);
  });

  it('shows a character counter when characterLimit is set', () => {
    render(
      <TwitterPreview
        {...BASE_FIXTURE}
        editable
        content="hello"
        characterLimit={280}
      />
    );
    expect(screen.getByText(/280/)).toBeInTheDocument();
    expect(screen.getByText(/275/)).toBeInTheDocument(); // remaining
  });
});
```

(If your TwitterPreview doesn't yet show a character counter when `characterLimit` is set, add a small footer line like `<span className="text-xs">{remaining}/{limit}</span>` inside the editable branch — drives the design out of the test.)

- [ ] **Step 2: Commit**

```bash
PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git add src/post-preview/__tests__/editable.test.tsx src/post-preview/platforms/twitter.tsx && \
  PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git commit -m "Add post-preview editable mode test + character counter"
```

---

## Task 29: Render-prop slots test

**Files:**
- Create: `src/post-preview/__tests__/render-prop-slots.test.tsx`

- [ ] **Step 1: Write the test**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LinkedInPreview } from '../index.js';
import { BASE_FIXTURE } from '../__stories__/fixtures.js';

describe('LinkedIn renderMentionPicker slot', () => {
  it('is invoked with query / onPick / onCancel when @ is typed', async () => {
    const user = userEvent.setup();
    const renderMentionPicker = vi.fn(() => <div data-testid="picker" />);
    render(
      <LinkedInPreview
        {...BASE_FIXTURE}
        editable
        content=""
        renderMentionPicker={renderMentionPicker}
      />
    );
    const textbox = screen.getByRole('textbox');
    await user.type(textbox, '@al');
    expect(renderMentionPicker).toHaveBeenCalled();
    const ctx = renderMentionPicker.mock.lastCall![0] as { query: string };
    expect(ctx.query).toBe('al');
    expect(screen.getByTestId('picker')).toBeInTheDocument();
  });

  it('does not render anything when no slot is provided', async () => {
    const user = userEvent.setup();
    render(<LinkedInPreview {...BASE_FIXTURE} editable content="" />);
    await user.type(screen.getByRole('textbox'), '@a');
    expect(screen.queryByTestId('picker')).toBeNull();
    expect(screen.getByRole('textbox')).toHaveValue('@a');
  });
});
```

- [ ] **Step 2: Commit**

```bash
PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git add src/post-preview/__tests__/render-prop-slots.test.tsx && \
  PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git commit -m "Add post-preview render-prop slot test"
```

---

## Task 30: Labels-override test

**Files:**
- Create: `src/post-preview/__tests__/labels-override.test.tsx`

- [ ] **Step 1: Write the test**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { InstagramPreview, TwitterPreview } from '../index.js';
import { BASE_FIXTURE } from '../__stories__/fixtures.js';

describe('post-preview labels override', () => {
  it('Instagram uses provided labels when supplied', () => {
    render(
      <InstagramPreview
        {...BASE_FIXTURE}
        mediaUrls={[BASE_FIXTURE.avatarUrl!]}
        labels={{ like: 'Vota', comment: 'Commenta', share: 'Condividi', save: 'Salva' }}
      />
    );
    expect(screen.getByLabelText('Vota')).toBeInTheDocument();
    expect(screen.getByLabelText('Commenta')).toBeInTheDocument();
    expect(screen.getByLabelText('Condividi')).toBeInTheDocument();
    expect(screen.getByLabelText('Salva')).toBeInTheDocument();
  });

  it('Twitter falls back to defaults when only some labels are provided', () => {
    render(<TwitterPreview {...BASE_FIXTURE} labels={{ share: 'Compartir' }} />);
    expect(screen.getByLabelText('Compartir')).toBeInTheDocument();
    // 'Save' default still present
    expect(screen.getByLabelText('Save')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Commit**

```bash
PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git add src/post-preview/__tests__/labels-override.test.tsx && \
  PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git commit -m "Add post-preview labels override test"
```

---

## Task 31: Root exports test

**Files:**
- Create: `src/post-preview/__tests__/root-exports.test.ts`

- [ ] **Step 1: Write the test**

```ts
import { describe, expect, it } from 'vitest';
import * as Root from '../../index.js';
import * as Subpath from '../index.js';

const EXPECTED_PREVIEWS = [
  'BlueSkyPreview',
  'DiscordPreview',
  'FacebookPreview',
  'GenericPreview',
  'GoogleBusinessPreview',
  'InstagramPreview',
  'LinkedInPreview',
  'TelegramPreview',
  'ThreadsPreview',
  'TikTokPreview',
  'TwitterPreview',
  'YouTubePreview',
] as const;

const EXPECTED_CHROMES = [
  'BlueSkyChrome',
  'DiscordChrome',
  'FacebookChrome',
  'GoogleBusinessChrome',
  'InstagramChrome',
  'LinkedInChrome',
  'PlatformChrome',
  'TelegramChrome',
  'ThreadsChrome',
  'TikTokChrome',
  'TwitterChrome',
  'YouTubeChrome',
] as const;

describe('post-preview public exports', () => {
  for (const name of EXPECTED_PREVIEWS) {
    it(`subpath exports ${name}`, () => {
      expect((Subpath as Record<string, unknown>)[name]).toBeTypeOf('function');
    });
    it(`root exports ${name}`, () => {
      expect((Root as Record<string, unknown>)[name]).toBeTypeOf('function');
    });
  }
  for (const name of EXPECTED_CHROMES) {
    it(`subpath exports ${name}`, () => {
      expect((Subpath as Record<string, unknown>)[name]).toBeTypeOf('function');
    });
  }
});
```

- [ ] **Step 2: Commit**

```bash
PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git add src/post-preview/__tests__/root-exports.test.ts && \
  PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git commit -m "Add post-preview root exports regression test"
```

---

## Task 32: WCAG (axe) test

**Files:**
- Create: `src/post-preview/wcag.test.tsx`

Pattern: copy from `src/chat/wcag.test.tsx` or `src/kanban/wcag.test.tsx` — render each platform and run axe.

- [ ] **Step 1: Read existing pattern**

```bash
cat src/chat/wcag.test.tsx
```

- [ ] **Step 2: Write `src/post-preview/wcag.test.tsx`**

```tsx
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import {
  BlueSkyPreview,
  DiscordPreview,
  FacebookPreview,
  GenericPreview,
  GoogleBusinessPreview,
  InstagramPreview,
  LinkedInPreview,
  TelegramPreview,
  ThreadsPreview,
  TikTokPreview,
  TwitterPreview,
  YouTubePreview,
} from './index.js';
import { BASE_FIXTURE } from './__stories__/fixtures.js';

const platforms: Array<[string, (p: object) => JSX.Element]> = [
  ['BlueSky',         (p) => <BlueSkyPreview {...(p as never)} />],
  ['Discord',         (p) => <DiscordPreview {...(p as never)} />],
  ['Facebook',        (p) => <FacebookPreview {...(p as never)} />],
  ['Generic',         (p) => <GenericPreview {...(p as never)} platform="custom" />],
  ['GoogleBusiness',  (p) => <GoogleBusinessPreview {...(p as never)} />],
  ['Instagram',       (p) => <InstagramPreview {...(p as never)} />],
  ['LinkedIn',        (p) => <LinkedInPreview {...(p as never)} />],
  ['Telegram',        (p) => <TelegramPreview {...(p as never)} />],
  ['Threads',         (p) => <ThreadsPreview {...(p as never)} />],
  ['TikTok',          (p) => <TikTokPreview {...(p as never)} />],
  ['Twitter',         (p) => <TwitterPreview {...(p as never)} />],
  ['YouTube',         (p) => <YouTubePreview {...(p as never)} />],
];

describe('post-preview accessibility (axe)', () => {
  for (const [name, Component] of platforms) {
    it(`${name} has no axe violations`, async () => {
      const { container } = render(<Component {...BASE_FIXTURE} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  }
});
```

- [ ] **Step 3: Run; fix any axe violations on the offending platform until clean.**

Run: `PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" pnpm vitest run --project unit src/post-preview/wcag.test.tsx`

- [ ] **Step 4: Commit**

```bash
PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git add src/post-preview/wcag.test.tsx && \
  PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git commit -m "Add post-preview WCAG (axe) test"
```

---

## Task 33: Docs MDX page

**Files:**
- Create: `src/__stories__/docs/PostPreview.mdx`

- [ ] **Step 1: Write the docs page** (copy structure from `src/__stories__/docs/Adoption.mdx` or another existing meda docs page; sections to include below)

Sections (use Storybook MDX `<Meta />` and `<Story />` blocks):

1. **Overview** — what this surface does, who it's for
2. **Installation** — `pnpm add @medalsocial/meda` then `import { InstagramPreview } from '@medalsocial/meda/post-preview'`
3. **Quick example** — minimal usage code block
4. **API reference** — table of `PostPreviewBaseProps` fields + per-platform extras
5. **Which platform?** — table mapping `PlatformId` → component
6. **Recipes**:
   - Composing with a custom channel picker
   - Editable mode + character counter
   - Dark mode
   - LinkedIn mention picker via `renderMentionPicker`
7. **Accessibility** — touch targets, aria labels, keyboard nav, screen reader notes

- [ ] **Step 2: Commit**

```bash
PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git add src/__stories__/docs/PostPreview.mdx && \
  PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git commit -m "Add post-preview docs MDX page"
```

---

## Task 34: Build, measure, and add size budgets

**Files:**
- Modify: `.size-limit.cjs`

- [ ] **Step 1: Build**

Run: `pnpm build`
Expected: Exit 0.

- [ ] **Step 2: Measure each platform's size**

For each platform, write a temporary entry in `.size-limit.cjs` measuring just that platform's import:

```js
{
  name: 'post-preview / Instagram',
  path: 'dist/post-preview/index.js',
  import: '{ InstagramPreview, InstagramChrome }',
  limit: '999 kB', // placeholder — will tighten
},
```

Run: `pnpm size-limit`
Note the brotli size for each platform.

- [ ] **Step 3: Set the real budgets at measured + ~20% headroom**

Replace the temporary entries with final budgets, plus a roll-up entry for the whole subpath:

```js
// In .size-limit.cjs (append at the end of the array, before the existing
// theme.css / tokens.css entries):

// post-preview surface — per-platform budgets prove tree-shaking holds:
// importing one preview must not pull in the others. Roll-up entry covers
// the case where a consumer imports the entire subpath.
{ name: 'post-preview / Twitter',         path: 'dist/post-preview/index.js', import: '{ TwitterPreview, TwitterChrome }',                 limit: '<measured + 20%>' },
{ name: 'post-preview / LinkedIn',        path: 'dist/post-preview/index.js', import: '{ LinkedInPreview, LinkedInChrome }',               limit: '<measured + 20%>' },
{ name: 'post-preview / Instagram',       path: 'dist/post-preview/index.js', import: '{ InstagramPreview, InstagramChrome }',             limit: '<measured + 20%>' },
{ name: 'post-preview / Facebook',        path: 'dist/post-preview/index.js', import: '{ FacebookPreview, FacebookChrome }',               limit: '<measured + 20%>' },
{ name: 'post-preview / Threads',         path: 'dist/post-preview/index.js', import: '{ ThreadsPreview, ThreadsChrome }',                 limit: '<measured + 20%>' },
{ name: 'post-preview / BlueSky',         path: 'dist/post-preview/index.js', import: '{ BlueSkyPreview, BlueSkyChrome }',                 limit: '<measured + 20%>' },
{ name: 'post-preview / TikTok',          path: 'dist/post-preview/index.js', import: '{ TikTokPreview, TikTokChrome }',                   limit: '<measured + 20%>' },
{ name: 'post-preview / YouTube',         path: 'dist/post-preview/index.js', import: '{ YouTubePreview, YouTubeChrome }',                 limit: '<measured + 20%>' },
{ name: 'post-preview / GoogleBusiness',  path: 'dist/post-preview/index.js', import: '{ GoogleBusinessPreview, GoogleBusinessChrome }',   limit: '<measured + 20%>' },
{ name: 'post-preview / Telegram',        path: 'dist/post-preview/index.js', import: '{ TelegramPreview, TelegramChrome }',               limit: '<measured + 20%>' },
{ name: 'post-preview / Discord',         path: 'dist/post-preview/index.js', import: '{ DiscordPreview, DiscordChrome }',                 limit: '<measured + 20%>' },
{ name: 'post-preview / Generic',         path: 'dist/post-preview/index.js', import: '{ GenericPreview, PlatformChrome }',                limit: '<measured + 20%>' },
{ name: 'post-preview / all',             path: 'dist/post-preview/index.js', import: '*',                                                  limit: '<measured + 20%>' },
```

Update the existing `main barrel` entry's limit to allow for the new root re-export — measure first, bump only by the actual delta.

- [ ] **Step 4: Re-run size-limit**

Run: `pnpm size-limit`
Expected: All entries pass.

- [ ] **Step 5: Commit**

```bash
PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git add .size-limit.cjs && \
  PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git commit -m "Add post-preview per-platform size budgets"
```

---

## Task 35: Add changeset

**Files:**
- Create: `.changeset/post-preview.md`

- [ ] **Step 1: Write the changeset**

```markdown
---
'@medalsocial/meda': minor
---

Add a new `@medalsocial/meda/post-preview` surface with channel-aware post previews for 12 platforms (Twitter / X, LinkedIn, Instagram, Facebook, Threads, BlueSky, TikTok, YouTube, Google Business, Telegram, Discord, plus a Generic fallback) and matching device chromes. Editable and read-only modes, container-query responsive, framework-neutral with no Convex coupling.
```

- [ ] **Step 2: Verify with the validator**

Run: `pnpm changeset status`
Expected: Reports the new minor bump.

- [ ] **Step 3: Commit**

```bash
PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git add .changeset/post-preview.md && \
  PATH="/Users/ali/.nvm/versions/node/v24.14.0/bin:$PATH" git commit -m "Add changeset for post-preview surface"
```

---

## Final verification (run after Task 35)

- [ ] `pnpm lint` — exit 0
- [ ] `pnpm typecheck` — exit 0
- [ ] `pnpm test` — exit 0 (Node 24)
- [ ] `pnpm check:stories` — exit 0
- [ ] `pnpm build` — exit 0; `dist/post-preview/index.js` exists
- [ ] `pnpm size-limit` — all entries pass
- [ ] `git status` — only intended files modified
- [ ] `git log --oneline origin/prod..HEAD` — one commit per task, none accidentally bundling unrelated changes

If everything is green, push the branch and open a PR against `dev`:

```bash
git push -u origin feat/post-preview
gh pr create --base dev --title "feat: add post-preview surface with 12 platform previews" --body "$(cat <<'EOF'
## Summary
- Add new \`@medalsocial/meda/post-preview\` subpath with 12 platform previews + chromes
- Read-only and editable modes; render-prop slots for connector-aware extras
- Container-query responsive; touch-target compliant; dark mode honoring each platform
- No new runtime deps; no Convex coupling

## Test plan
- [ ] \`pnpm lint && pnpm typecheck && pnpm test && pnpm check:stories && pnpm build && pnpm size-limit\` all pass locally on Node 24
- [ ] Storybook visual review of each platform under Default / WithMedia / WithLongContent / WithoutAvatar / Editable / DeviceFrame / DarkMode
- [ ] Mobile review (Chrome DevTools device emulation) at 360px, 414px viewports — verify touch targets, no overflow
- [ ] Verify root \`@medalsocial/meda\` import still tree-shakes (per existing main-barrel size budget)

Spec: docs/superpowers/specs/2026-05-02-post-preview-design.md
Plan: docs/superpowers/plans/2026-05-02-post-preview.md
EOF
)"
```
