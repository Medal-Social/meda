# Builder Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Collapse `email-builder`, `post-preview`, and `workflow-builder` to one top-level component each, prop-driven, with render-prop slots for heavy editor pieces. Internal files stay split.

**Architecture:** New `PostPreview` component dispatches via discriminated `platform` prop to existing per-platform internals. `EmailBuilder` and `WorkflowBuilder` already exist; only their `index.ts` barrel files prune granular exports. Stories collapse to one page per builder. The existing `editable` prop is preserved; `mode='edit'` is sugar.

**Tech Stack:** React 19, TypeScript, Vitest, Storybook 10, Biome, size-limit, changesets.

**Spec:** `docs/superpowers/specs/2026-05-02-builder-consolidation-design.md`

**Worktree:** `/Users/ali/Documents/Code/medal-monorepo/open/meda/.worktrees/all-builders`

---

## File Map

### Created
- `src/post-preview/post-preview.tsx` — discriminated dispatch component
- `src/post-preview/post-preview.test.tsx` — integration test for dispatch + slots
- `src/post-preview/__stories__/post-preview.stories.tsx` — single consolidated story page

### Modified
- `src/post-preview/types.ts` — add `PlatformId` literal union, `PostPreviewSlots`, `PostPreviewProps` types
- `src/post-preview/index.ts` — prune exports to `PostPreview`, types, `DEFAULT_*_LABELS`
- `src/post-preview/wcag.test.tsx` — assert `PostPreview` renders a representative subset accessibly
- `src/email-builder/index.ts` — prune to `EmailBuilder`, `renderToEmailHtml`, `createStarterDocument`, types
- `src/workflow-builder/index.ts` — prune to `WorkflowBuilder`, `WorkflowCard`, `WorkflowCardCompact`, types
- `.size-limit.cjs` — replace per-platform / per-piece budgets with single per-builder budgets
- `.changeset/email-builder.md` → renamed to `.changeset/builder-consolidation.md`, content rewritten

### Deleted
- `src/post-preview/__stories__/{bluesky,discord,facebook,generic,google-business,instagram,linkedin,telegram,threads,tiktok,twitter,youtube,all-platforms,platform-extras,responsive}.stories.tsx` (15 files)
- `src/email-builder/__stories__/block-palette.stories.tsx`
- `src/email-builder/__stories__/property-inspector.stories.tsx`
- `src/workflow-builder/__stories__/workflow-canvas.stories.tsx`
- `src/workflow-builder/__stories__/workflow-toolbox.stories.tsx`
- `.changeset/post-preview.md`, `.changeset/workflow-builder.md` (consolidated into the single entry above)

`.changeset/calendar.md` is **untouched** — calendar is a separate feature, not part of this consolidation.

---

## Phase 1 — PostPreview component

### Task 1.1: Add `PlatformId` and slot types

**Files:**
- Modify: `src/post-preview/types.ts`

- [ ] **Step 1: Add `PlatformId` literal union near the existing `PostPreviewBaseProps` definition**

In `src/post-preview/types.ts`, add after the existing `PostPreviewFrame` type:

```ts
export type PlatformId =
  | 'instagram'
  | 'twitter'
  | 'facebook'
  | 'linkedin'
  | 'tiktok'
  | 'youtube'
  | 'threads'
  | 'bluesky'
  | 'discord'
  | 'telegram'
  | 'google-business'
  | 'generic';
```

- [ ] **Step 2: Add `PostPreviewSlots` interface after `PlatformId`**

```ts
export interface PostPreviewSlots {
  /** When 'edit', enables editable mode. Sugar for `editable: true`. */
  mode?: 'preview' | 'edit';
  /** Replaces the platform's content textarea when in edit mode. */
  renderEditor?: (ctx: {
    platform: PlatformId;
    value: string;
    onChange: (next: string) => void;
  }) => React.ReactNode;
  /** Renders a media picker trigger in the edit toolbar. */
  renderMediaPicker?: (ctx: {
    platform: PlatformId;
    current: string[] | undefined;
    onPick: (next: string[]) => void;
  }) => React.ReactNode;
  /** Renders an emoji picker trigger in the edit toolbar. */
  renderEmojiPicker?: (ctx: {
    onSelect: (emoji: string) => void;
  }) => React.ReactNode;
  /** Renders a mention picker trigger in the edit toolbar. */
  renderMentionPicker?: (ctx: {
    platform: PlatformId;
    query: string;
    onSelect: (mention: unknown) => void;
  }) => React.ReactNode;
  /** Called when renderMediaPicker invokes onPick. */
  onMediaUrlsChange?: (mediaUrls: string[]) => void;
}
```

`React` is already imported at the top of the file. If not, add `import type * as React from 'react';`.

- [ ] **Step 3: Run `pnpm typecheck` to confirm types compile**

Run: `pnpm typecheck`
Expected: PASS (no TS errors).

- [ ] **Step 4: Commit**

```bash
git add src/post-preview/types.ts
git -c commit.gpgsign=false commit -m "Add PlatformId and PostPreviewSlots types"
```

---

### Task 1.2: Failing test for `PostPreview` dispatch

**Files:**
- Create: `src/post-preview/post-preview.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/post-preview/post-preview.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PostPreview } from './post-preview.js';

const baseProps = {
  displayName: 'Acme',
  username: 'acme',
  content: 'Hello world',
};

describe('PostPreview', () => {
  it('renders the Instagram preview when platform="instagram"', () => {
    render(<PostPreview platform="instagram" {...baseProps} />);
    // Instagram chrome renders a like button labelled per DEFAULT_INSTAGRAM_LABELS
    expect(screen.getByRole('button', { name: /like/i })).toBeInTheDocument();
  });

  it('renders the Twitter preview when platform="twitter"', () => {
    render(<PostPreview platform="twitter" {...baseProps} />);
    // Twitter chrome renders a "Reply" action
    expect(screen.getByRole('button', { name: /reply/i })).toBeInTheDocument();
  });

  it('renders the Generic preview when platform="generic"', () => {
    render(<PostPreview platform="generic" {...baseProps} />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('treats mode="edit" as editable=true', () => {
    const onContentChange = (): void => {};
    render(
      <PostPreview
        platform="generic"
        {...baseProps}
        mode="edit"
        onContentChange={onContentChange}
      />,
    );
    // editable mode renders a textarea with the content
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.value).toBe('Hello world');
  });

  it('renders the renderEditor slot when provided in edit mode', () => {
    render(
      <PostPreview
        platform="generic"
        {...baseProps}
        mode="edit"
        renderEditor={({ value }) => <div data-testid="custom-editor">{value}</div>}
      />,
    );
    expect(screen.getByTestId('custom-editor')).toHaveTextContent('Hello world');
    // When renderEditor is provided, the platform's textarea is hidden
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('renders renderMediaPicker / renderEmojiPicker / renderMentionPicker triggers in edit mode', () => {
    render(
      <PostPreview
        platform="generic"
        {...baseProps}
        mode="edit"
        renderMediaPicker={() => <button type="button">Pick media</button>}
        renderEmojiPicker={() => <button type="button">Pick emoji</button>}
        renderMentionPicker={() => <button type="button">Pick mention</button>}
      />,
    );
    expect(screen.getByRole('button', { name: 'Pick media' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pick emoji' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pick mention' })).toBeInTheDocument();
  });

  it('does not render the edit toolbar when mode is preview', () => {
    render(
      <PostPreview
        platform="generic"
        {...baseProps}
        renderEmojiPicker={() => <button type="button">Pick emoji</button>}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Pick emoji' })).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test -- --run src/post-preview/post-preview.test.tsx`
Expected: FAIL with "Cannot find module './post-preview.js'" or similar.

- [ ] **Step 3: Do NOT commit yet**

The pre-commit hook runs the full test suite, so committing a failing test alone is not viable on this repo. Leave the test staged or unstaged; commit it together with the implementation in Task 1.3 Step 4.

---

### Task 1.3: Implement `PostPreview` dispatch

**Files:**
- Create: `src/post-preview/post-preview.tsx`

- [ ] **Step 1: Write the dispatch component**

Create `src/post-preview/post-preview.tsx`:

```tsx
// open/meda/src/post-preview/post-preview.tsx
//
// Single discriminated entry point for `@medalsocial/meda/post-preview`.
// Routes to per-platform internals based on the `platform` prop and adds an
// optional edit toolbar that renders consumer-supplied slots.

import * as React from 'react';
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
import type {
  BlueSkyPreviewProps,
  DiscordPreviewProps,
  FacebookPreviewProps,
  GenericPreviewProps,
  GoogleBusinessPreviewProps,
  InstagramPreviewProps,
  LinkedInPreviewProps,
  TelegramPreviewProps,
  ThreadsPreviewProps,
  TikTokPreviewProps,
  TwitterPreviewProps,
  YouTubePreviewProps,
} from './platforms/index.js';
import type { PlatformId, PostPreviewSlots } from './types.js';

export type PostPreviewProps = PostPreviewSlots &
  (
    | ({ platform: 'instagram' } & InstagramPreviewProps)
    | ({ platform: 'twitter' } & TwitterPreviewProps)
    | ({ platform: 'facebook' } & FacebookPreviewProps)
    | ({ platform: 'linkedin' } & LinkedInPreviewProps)
    | ({ platform: 'tiktok' } & TikTokPreviewProps)
    | ({ platform: 'youtube' } & YouTubePreviewProps)
    | ({ platform: 'threads' } & ThreadsPreviewProps)
    | ({ platform: 'bluesky' } & BlueSkyPreviewProps)
    | ({ platform: 'discord' } & DiscordPreviewProps)
    | ({ platform: 'telegram' } & TelegramPreviewProps)
    | ({ platform: 'google-business' } & GoogleBusinessPreviewProps)
    | ({ platform: 'generic' } & GenericPreviewProps)
  );

export function PostPreview(props: PostPreviewProps): React.ReactElement {
  const {
    platform,
    mode,
    renderEditor,
    renderMediaPicker,
    renderEmojiPicker,
    renderMentionPicker,
    onMediaUrlsChange,
    ...rest
  } = props;

  const isEdit = mode === 'edit' || rest.editable === true;
  const showToolbar =
    isEdit &&
    (renderMediaPicker !== undefined ||
      renderEmojiPicker !== undefined ||
      renderMentionPicker !== undefined);

  // When renderEditor is supplied, suppress the platform's built-in textarea
  // by setting editable=false on the underlying preview, and render the
  // consumer's editor in its place above the (read-only) preview frame.
  const platformProps = {
    ...rest,
    editable: isEdit && renderEditor === undefined,
  };

  const editorNode = renderEditor?.({
    platform,
    value: rest.content ?? '',
    onChange: (next: string) => rest.onContentChange?.(next),
  });

  const toolbarNode = showToolbar ? (
    <div className="meda-post-preview__toolbar" role="toolbar">
      {renderMediaPicker?.({
        platform,
        current: rest.mediaUrls,
        onPick: (next) => onMediaUrlsChange?.(next),
      })}
      {renderEmojiPicker?.({
        onSelect: (emoji) => rest.onContentChange?.((rest.content ?? '') + emoji),
      })}
      {renderMentionPicker?.({
        platform,
        query: '',
        onSelect: () => undefined,
      })}
    </div>
  ) : null;

  const PreviewElement = renderPlatform(platform, platformProps);

  if (editorNode === undefined && toolbarNode === null) {
    return PreviewElement;
  }

  return (
    <div className="meda-post-preview" data-platform={platform}>
      {toolbarNode}
      {editorNode}
      {PreviewElement}
    </div>
  );
}

function renderPlatform(
  platform: PlatformId,
  // biome-ignore lint/suspicious/noExplicitAny: dispatch table erases the
  // discriminant; type safety is enforced at the public PostPreviewProps boundary.
  props: any,
): React.ReactElement {
  switch (platform) {
    case 'instagram':
      return <InstagramPreview {...(props as InstagramPreviewProps)} />;
    case 'twitter':
      return <TwitterPreview {...(props as TwitterPreviewProps)} />;
    case 'facebook':
      return <FacebookPreview {...(props as FacebookPreviewProps)} />;
    case 'linkedin':
      return <LinkedInPreview {...(props as LinkedInPreviewProps)} />;
    case 'tiktok':
      return <TikTokPreview {...(props as TikTokPreviewProps)} />;
    case 'youtube':
      return <YouTubePreview {...(props as YouTubePreviewProps)} />;
    case 'threads':
      return <ThreadsPreview {...(props as ThreadsPreviewProps)} />;
    case 'bluesky':
      return <BlueSkyPreview {...(props as BlueSkyPreviewProps)} />;
    case 'discord':
      return <DiscordPreview {...(props as DiscordPreviewProps)} />;
    case 'telegram':
      return <TelegramPreview {...(props as TelegramPreviewProps)} />;
    case 'google-business':
      return <GoogleBusinessPreview {...(props as GoogleBusinessPreviewProps)} />;
    case 'generic':
      return <GenericPreview {...(props as GenericPreviewProps)} />;
  }
}
```

- [ ] **Step 2: Run the dispatch tests**

Run: `pnpm test -- --run src/post-preview/post-preview.test.tsx`
Expected: PASS (all 7 tests).

- [ ] **Step 3: Run the full suite to confirm no regressions**

Run: `pnpm test`
Expected: PASS (all existing tests + new ones).

- [ ] **Step 4: Commit test + implementation together**

```bash
git add src/post-preview/post-preview.tsx src/post-preview/post-preview.test.tsx
git -c commit.gpgsign=false commit -m "Add PostPreview dispatch component with platform discriminant and edit-mode slots"
```

---

## Phase 2 — Consolidate post-preview public API

### Task 2.1: Trim `post-preview/index.ts`

**Files:**
- Modify: `src/post-preview/index.ts`

- [ ] **Step 1: Replace the file contents**

Overwrite `src/post-preview/index.ts` with:

```ts
// open/meda/src/post-preview/index.ts
//
// Subpath barrel for `@medalsocial/meda/post-preview`. Single top-level
// `PostPreview` component dispatches per-platform via the `platform` prop.
// Per-platform components, chromes, and helpers remain internal.

export { PostPreview, type PostPreviewProps } from './post-preview.js';
export type {
  BlueSkyLabels,
  BlueSkyPreviewProps,
  DiscordEmbedDraft,
  DiscordLabels,
  DiscordPreviewProps,
  FacebookLabels,
  FacebookPreviewProps,
  GenericLabels,
  GenericPreviewProps,
  GoogleBusinessLabels,
  GoogleBusinessPreviewProps,
  InstagramLabels,
  InstagramPostType,
  InstagramPreviewProps,
  LinkedInLabels,
  LinkedInMentionData,
  LinkedInMentionPickerContext,
  LinkedInPreviewProps,
  TelegramInlineKeyboardButton,
  TelegramInlineKeyboardMarkup,
  TelegramLabels,
  TelegramPollState,
  TelegramPreviewProps,
  ThreadsLabels,
  ThreadsPreviewProps,
  TikTokLabels,
  TikTokPreviewProps,
  TwitterLabels,
  TwitterMentionPickerContext,
  TwitterPreviewProps,
  TwitterTheme,
  YouTubeLabels,
  YouTubePreviewProps,
} from './platforms/index.js';
export {
  DEFAULT_BLUESKY_LABELS,
  DEFAULT_DISCORD_LABELS,
  DEFAULT_FACEBOOK_LABELS,
  DEFAULT_GENERIC_LABELS,
  DEFAULT_GOOGLE_BUSINESS_LABELS,
  DEFAULT_INSTAGRAM_LABELS,
  DEFAULT_LINKEDIN_LABELS,
  DEFAULT_TELEGRAM_LABELS,
  DEFAULT_THREADS_LABELS,
  DEFAULT_TIKTOK_LABELS,
  DEFAULT_TWITTER_LABELS,
  DEFAULT_YOUTUBE_LABELS,
} from './platforms/index.js';
export type {
  PlatformId,
  PostPreviewBaseProps,
  PostPreviewFrame,
  PostPreviewSlots,
} from './types.js';
```

Note: this drops the per-platform `*Preview` component exports, all `*Chrome` exports, `PhoneStatusBar`, `PlatformChrome`, and `PlatformChromeProps`. They remain importable internally via relative paths in tests and stories.

- [ ] **Step 2: Run typecheck**

Run: `pnpm typecheck`
Expected: PASS. Failures here will be in test/story files that import the removed names — those are addressed in Task 2.2 and Phase 3 stories deletion (Task 2.3).

- [ ] **Step 3: Run unit tests**

Run: `pnpm test`
Expected: PASS — internal tests under `src/post-preview/platforms/` and `src/post-preview/chrome/` import from local relative paths, not the barrel, so they're unaffected.

- [ ] **Step 4: Commit**

```bash
git add src/post-preview/index.ts
git -c commit.gpgsign=false commit -m "Trim post-preview barrel to PostPreview + types"
```

---

### Task 2.2: Update `post-preview/wcag.test.tsx`

**Files:**
- Modify: `src/post-preview/wcag.test.tsx`

- [ ] **Step 1: Read the existing file**

Run: `cat src/post-preview/wcag.test.tsx`

The current file imports per-platform `*Preview` components from `./platforms/index.js` (relative — still works). If it imports from `./index.js` (barrel — broken after Task 2.1), update those imports to use `./post-preview.js` for `PostPreview` and `./platforms/index.js` for any internal-only imports.

- [ ] **Step 2: Add a `PostPreview` axe pass alongside the existing platform passes**

If the file has a structure like `describe('post-preview wcag', () => { it('Instagram has no violations', ...) })`, add at the top of the `describe`:

```tsx
import { PostPreview } from './post-preview.js';
import { axe } from 'vitest-axe';
import { render } from '@testing-library/react';

it('PostPreview (instagram) has no violations', async () => {
  const { container } = render(
    <PostPreview platform="instagram" displayName="Acme" username="acme" content="Hello" />,
  );
  expect(await axe(container)).toHaveNoViolations();
});

it('PostPreview (twitter) has no violations', async () => {
  const { container } = render(
    <PostPreview platform="twitter" displayName="Acme" username="acme" content="Hello" />,
  );
  expect(await axe(container)).toHaveNoViolations();
});

it('PostPreview (generic) has no violations', async () => {
  const { container } = render(
    <PostPreview platform="generic" displayName="Acme" username="acme" content="Hello" />,
  );
  expect(await axe(container)).toHaveNoViolations();
});
```

If the existing imports broke after Task 2.1, replace `from './index.js'` with `from './platforms/index.js'` for per-platform components and `from './chrome/index.js'` for chromes.

- [ ] **Step 3: Run the wcag test**

Run: `pnpm test -- --run src/post-preview/wcag.test.tsx`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/post-preview/wcag.test.tsx
git -c commit.gpgsign=false commit -m "Add PostPreview axe coverage; fix imports for trimmed barrel"
```

---

### Task 2.3: Replace per-platform stories with single PostPreview story

**Files:**
- Create: `src/post-preview/__stories__/post-preview.stories.tsx`
- Delete: 15 existing platform/responsive/extras stories under `src/post-preview/__stories__/`
- Keep: `src/post-preview/__stories__/fixtures.ts`

- [ ] **Step 1: Write the new consolidated story**

Create `src/post-preview/__stories__/post-preview.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { PostPreview, type PostPreviewProps } from '../post-preview.js';
import { genericFixture, instagramFixture, twitterFixture } from './fixtures.js';

const PLATFORMS: PostPreviewProps['platform'][] = [
  'instagram',
  'twitter',
  'facebook',
  'linkedin',
  'tiktok',
  'youtube',
  'threads',
  'bluesky',
  'discord',
  'telegram',
  'google-business',
  'generic',
];

const meta: Meta<typeof PostPreview> = {
  title: 'PostPreview',
  component: PostPreview,
  parameters: { layout: 'centered' },
  argTypes: {
    platform: {
      control: { type: 'select' },
      options: PLATFORMS,
    },
    mode: {
      control: { type: 'inline-radio' },
      options: ['preview', 'edit'],
    },
  },
  args: {
    platform: 'instagram',
    mode: 'preview',
    ...genericFixture,
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Edit: Story = {
  args: { mode: 'edit' },
};

export const WithSlots: Story = {
  args: {
    mode: 'edit',
    renderEmojiPicker: () => <button type="button">😀</button>,
    renderMediaPicker: () => <button type="button">Image</button>,
  },
};
```

If the existing `fixtures.ts` doesn't already export `genericFixture`, `instagramFixture`, and `twitterFixture` shaped as the platform-specific props, add them as new exports. They should match `PostPreviewBaseProps`:

```ts
// in fixtures.ts — add if missing
export const genericFixture = {
  displayName: 'Acme Studios',
  username: 'acme',
  content: 'A quick demo of the unified PostPreview component.',
  mediaUrls: [],
};
export const instagramFixture = { ...genericFixture };
export const twitterFixture = { ...genericFixture };
```

- [ ] **Step 2: Delete the per-platform / per-aspect stories**

Run from worktree root:

```bash
rm \
  src/post-preview/__stories__/all-platforms.stories.tsx \
  src/post-preview/__stories__/bluesky.stories.tsx \
  src/post-preview/__stories__/discord.stories.tsx \
  src/post-preview/__stories__/facebook.stories.tsx \
  src/post-preview/__stories__/generic.stories.tsx \
  src/post-preview/__stories__/google-business.stories.tsx \
  src/post-preview/__stories__/instagram.stories.tsx \
  src/post-preview/__stories__/linkedin.stories.tsx \
  src/post-preview/__stories__/platform-extras.stories.tsx \
  src/post-preview/__stories__/responsive.stories.tsx \
  src/post-preview/__stories__/telegram.stories.tsx \
  src/post-preview/__stories__/threads.stories.tsx \
  src/post-preview/__stories__/tiktok.stories.tsx \
  src/post-preview/__stories__/twitter.stories.tsx \
  src/post-preview/__stories__/youtube.stories.tsx
```

- [ ] **Step 3: Run `check:stories`**

Run: `pnpm check:stories`
Expected: 0 warnings for `src/post-preview/__stories__/` (the only remaining file is `post-preview.stories.tsx` with 3 stories, under the soft cap of 3 stories per file — the cap is "exceeds soft cap of 3", so 3 is fine; if the rule is "≤ 3", we're good. If `check:stories` reports the new file as "exceeds 3", reduce to 2 stories by inlining `WithSlots` into `Edit` controls).

- [ ] **Step 4: Verify Storybook builds**

Run: `pnpm storybook` (start) → manually open http://localhost:6006 → confirm a single "PostPreview" page exists with platform select control. Stop Storybook (Ctrl+C).

- [ ] **Step 5: Commit**

```bash
git add src/post-preview/__stories__/
git -c commit.gpgsign=false commit -m "Collapse post-preview stories to a single PostPreview page with controls"
```

---

## Phase 3 — Trim email-builder exports

### Task 3.1: Rewrite `email-builder/index.ts`

**Files:**
- Modify: `src/email-builder/index.ts`

- [ ] **Step 1: Overwrite the file**

```ts
// open/meda/src/email-builder/index.ts
//
// Subpath barrel for `@medalsocial/meda/email-builder`.
//
// Single top-level `EmailBuilder` component. Heavy/optional integrations
// (rich text editor, media browser, saved blocks library) are injected via
// render-prop slots — see `EmailBuilderProps`. Block primitives, palettes,
// inspectors, and renderers remain internal implementation details.

export { EmailBuilder } from './email-builder.js';
export {
  type RenderToEmailHtmlOptions,
  renderToEmailHtml,
} from './render-to-email-html.js';
export { createStarterDocument } from './starter-shell.js';
export {
  type Alignment,
  BLOCK_KINDS,
  type BlockKind,
  type BlockPropsMap,
  type ButtonBlockProps,
  type ColumnLayout,
  type ColumnsBlockProps,
  type DevicePreview,
  type DividerBlockProps,
  defaultEmailBuilderLabels,
  type EmailBlock,
  type EmailBrand,
  type EmailBuilderLabels,
  type EmailBuilderProps,
  type EmailDocument,
  type EmailEnvelope,
  type FooterBlockProps,
  type HeadingBlockProps,
  type ImageBlockProps,
  type MediaPickerContext,
  type SavedBlocksContext,
  type SocialBlockProps,
  type SocialLink,
  type SpacerBlockProps,
  type SpacingValue,
  type TextBlockProps,
} from './types.js';
```

This removes from public exports: `BlockErrorBoundary`, `BlockPalette`, `BlockRenderer`, `BuilderCanvas`, `BuilderHeader`, `BuilderLeftTabs`, `EnvelopeCard`, `FloatingBar`, `MobileDrawer`, `MobileTabBar`, `PropertyInspector`, `ViewControls`, `BLOCK_REGISTRY`, `BlockMeta`, `COLUMN_WIDTHS`, `createBlock`, `getColumnWidths`, `getDefaultBlockProps`. They remain accessible internally via relative imports.

- [ ] **Step 2: Run typecheck**

Run: `pnpm typecheck`
Expected: PASS for production code. The `__stories__/block-palette.stories.tsx` and `__stories__/property-inspector.stories.tsx` will fail to compile — addressed in Task 3.2.

- [ ] **Step 3: Commit**

```bash
git add src/email-builder/index.ts
git -c commit.gpgsign=false commit -m "Trim email-builder barrel to EmailBuilder + helpers + types"
```

---

### Task 3.2: Delete the auxiliary email-builder stories

**Files:**
- Delete: `src/email-builder/__stories__/block-palette.stories.tsx`
- Delete: `src/email-builder/__stories__/property-inspector.stories.tsx`

- [ ] **Step 1: Delete the demo stories**

```bash
rm \
  src/email-builder/__stories__/block-palette.stories.tsx \
  src/email-builder/__stories__/property-inspector.stories.tsx
```

The remaining `email-builder.stories.tsx` exercises the consolidated `EmailBuilder` component.

- [ ] **Step 2: Run typecheck + tests**

Run: `pnpm typecheck && pnpm test`
Expected: PASS.

- [ ] **Step 3: Run `check:stories`**

Run: `pnpm check:stories`
Expected: 0 warnings for `src/email-builder/__stories__/`.

- [ ] **Step 4: Commit**

```bash
git add src/email-builder/__stories__/
git -c commit.gpgsign=false commit -m "Remove block-palette and property-inspector demo stories"
```

---

## Phase 4 — Trim workflow-builder exports

### Task 4.1: Rewrite `workflow-builder/index.ts`

**Files:**
- Modify: `src/workflow-builder/index.ts`

- [ ] **Step 1: Overwrite the file**

```ts
// open/meda/src/workflow-builder/index.ts
//
// Subpath barrel for `@medalsocial/meda/workflow-builder`.
//
// Top-level `WorkflowBuilder` component plus the sibling list-row components
// (`WorkflowCard`, `WorkflowCardCompact`) used to render workflow summaries
// outside of the builder. Canvas, header, toolbox, nodes, edges, and node
// helpers remain internal implementation details.

export type {
  WorkflowBuilderLabels,
  WorkflowBuilderProps,
  WorkflowCardCompactProps,
  WorkflowCardProps,
  WorkflowEdge,
  WorkflowHeaderProps,
  WorkflowNode,
  WorkflowNodeData,
  WorkflowNodeKind,
  WorkflowStatus,
  WorkflowSummary,
  WorkflowToolboxItem,
} from './types.js';
export { defaultWorkflowBuilderLabels } from './types.js';
export { WorkflowBuilder } from './workflow-builder.js';
export { WorkflowCard } from './workflow-card.js';
export { WorkflowCardCompact } from './workflow-card-compact.js';
```

This removes from public exports: `WorkflowCanvas`, `WorkflowCanvasProps`, `WorkflowHeader`, `WorkflowToolbox`, `WorkflowToolboxProps`, `ActionNode`, `BaseWorkflowNode`, `BaseWorkflowNodeProps`, `ConditionNode`, `DelayNode`, `EndNode`, `TriggerNode`, `workflowNodeTypes`, `DefaultWorkflowEdge`, `workflowEdgeTypes`, `renderWorkflowIcon`, `resolveWorkflowIcon`, `getDefaultNodeSentence`, `NODE_HEIGHT`, `NODE_KIND_STYLES`, `NODE_WIDTH`.

`WorkflowHeaderProps` is kept exported because it's referenced by `WorkflowBuilderProps` (pass-through configuration). If typecheck reports `WorkflowHeaderProps` as unused-export, remove it.

- [ ] **Step 2: Run typecheck**

Run: `pnpm typecheck`
Expected: PASS for production code. Stories importing the removed pieces (`workflow-canvas.stories.tsx`, `workflow-toolbox.stories.tsx`) will fail — addressed in Task 4.2.

- [ ] **Step 3: Commit**

```bash
git add src/workflow-builder/index.ts
git -c commit.gpgsign=false commit -m "Trim workflow-builder barrel to WorkflowBuilder + WorkflowCard + types"
```

---

### Task 4.2: Delete the auxiliary workflow-builder stories

**Files:**
- Delete: `src/workflow-builder/__stories__/workflow-canvas.stories.tsx`
- Delete: `src/workflow-builder/__stories__/workflow-toolbox.stories.tsx`
- Keep: `src/workflow-builder/__stories__/workflow-builder.stories.tsx`
- Keep: `src/workflow-builder/__stories__/workflow-card.stories.tsx` (still a public sibling component)

- [ ] **Step 1: Delete the demo stories**

```bash
rm \
  src/workflow-builder/__stories__/workflow-canvas.stories.tsx \
  src/workflow-builder/__stories__/workflow-toolbox.stories.tsx
```

- [ ] **Step 2: Run typecheck + tests + check:stories**

Run: `pnpm typecheck && pnpm test && pnpm check:stories`
Expected: PASS, 0 warnings for `src/workflow-builder/__stories__/`.

- [ ] **Step 3: Commit**

```bash
git add src/workflow-builder/__stories__/
git -c commit.gpgsign=false commit -m "Remove workflow-canvas and workflow-toolbox demo stories"
```

---

## Phase 5 — Bundle, changeset, final gate

### Task 5.1: Replace `.size-limit.cjs` per-platform / per-piece entries

**Files:**
- Modify: `.size-limit.cjs`

- [ ] **Step 1: Inspect the current file**

Run: `cat .size-limit.cjs`

Locate the post-preview per-platform entries (each named `'post-preview / Twitter'`, `'post-preview / LinkedIn'`, etc.). They use `import: '{ TwitterPreview, TwitterChrome }'` style. After consolidation, those names are no longer exported from the barrel, so size-limit will fail.

- [ ] **Step 2: Replace per-platform entries with two consolidated entries**

In the `module.exports` array, replace ALL `'post-preview / *'` entries with:

```js
  {
    name: 'post-preview',
    path: 'dist/post-preview/index.js',
    limit: '45 kB',
  },
  {
    name: 'post-preview / one platform (instagram)',
    path: 'dist/post-preview/index.js',
    import: '{ PostPreview }',
    limit: '30 kB',
  },
```

Rationale comment to add above the entries:

```js
  // post-preview surface — single PostPreview entry. The component routes
  // to all 12 platform internals, so the full-barrel import pulls in the
  // matrix; the second entry exercises tree-shaking on the named export.
  // Bumping these limits requires a written rationale (see CONTRIBUTING.md).
```

- [ ] **Step 3: Build and run size-limit**

Run: `pnpm build && pnpm size`
Expected: PASS. If a budget is exceeded, raise it by ~15 % and add a one-line rationale comment above the entry citing the measured value.

- [ ] **Step 4: Commit**

```bash
git add .size-limit.cjs
git -c commit.gpgsign=false commit -m "Consolidate post-preview size-limit entries to single PostPreview surface"
```

---

### Task 5.2: Replace per-feature changesets with a single consolidated entry

**Files:**
- Delete: `.changeset/email-builder.md`, `.changeset/post-preview.md`, `.changeset/workflow-builder.md`
- Create: `.changeset/builder-consolidation.md`
- Untouched: `.changeset/calendar.md` (separate feature)

- [ ] **Step 1: Delete the three feature changesets**

```bash
rm \
  .changeset/email-builder.md \
  .changeset/post-preview.md \
  .changeset/workflow-builder.md
```

- [ ] **Step 2: Create the consolidated entry**

Write `.changeset/builder-consolidation.md`:

```md
---
'@medalsocial/meda': minor
---

Add `EmailBuilder`, `PostPreview`, and `WorkflowBuilder` as the single
top-level entry points for their respective surfaces.

`PostPreview` is a new component that accepts a discriminated `platform`
prop (`instagram`, `twitter`, `facebook`, `linkedin`, `tiktok`, `youtube`,
`threads`, `bluesky`, `discord`, `telegram`, `google-business`, `generic`)
plus the existing per-platform props inline. It exposes render-prop slots
for `renderEditor`, `renderMediaPicker`, `renderEmojiPicker`, and
`renderMentionPicker` so consumers can plug in their own rich text editor,
media library, and pickers.

`EmailBuilder` and `WorkflowBuilder` no longer export internal pieces
(palettes, inspectors, canvases, headers, toolboxes, node/edge helpers)
from their barrels — those remain internal. `WorkflowCard` and
`WorkflowCardCompact` continue to be exported as standalone list-row
components.
```

- [ ] **Step 3: Verify changesets status**

Run: `pnpm changeset status`
Expected: Reports `@medalsocial/meda` as receiving a `minor` bump from `builder-consolidation.md` and `calendar.md` (calendar is the separate, pre-existing entry).

- [ ] **Step 4: Commit**

```bash
git add .changeset/
git -c commit.gpgsign=false commit -m "Consolidate per-feature changesets into a single builder-consolidation entry"
```

---

### Task 5.3: Final quality gate

- [ ] **Step 1: Run the full quality gate**

Run: `pnpm lint && pnpm typecheck && pnpm test && pnpm check:stories && pnpm build && pnpm size`
Expected: PASS at every step.

- [ ] **Step 2: Verify Storybook still works end-to-end**

Run: `pnpm storybook` (background), open http://localhost:6006, navigate to:
- **PostPreview** — single page, change `platform` control, confirm each of the 12 platforms renders.
- **EmailBuilder** — single page, no `BlockPalette` / `PropertyInspector` standalone pages.
- **WorkflowBuilder** — single page; `WorkflowCard` page still present.

Stop Storybook.

- [ ] **Step 3: Verify dist contents**

Run: `ls dist/post-preview/ dist/email-builder/ dist/workflow-builder/`
Expected: Each directory contains an `index.js` and `index.d.ts`. Internal files (chromes, platform components, builder pieces) are bundled into `index.js`; consumers see only the top-level barrel exports in the `.d.ts`.

- [ ] **Step 4: Final commit (no-op if Steps 1–3 made no edits)**

If quality gate edits were required (e.g., a missing import in a story), commit with a focused message. Otherwise skip.

- [ ] **Step 5: Pause and ask the user before pushing**

Do NOT run `git push` automatically. Pushing publishes the branch and may trigger CI / open a PR via auto-sync. Ask the user explicitly before pushing.

---

## Self-Review

**Spec coverage:**

- [x] `EmailBuilder` exports trimmed → Task 3.1
- [x] `WorkflowBuilder` exports trimmed → Task 4.1
- [x] `PostPreview` discriminated component → Tasks 1.1–1.3
- [x] Slot props (`renderEditor`, `renderMediaPicker`, `renderEmojiPicker`, `renderMentionPicker`) → Task 1.3
- [x] `mode='edit'` sugar → Task 1.3
- [x] `WorkflowCard` / `WorkflowCardCompact` kept exported → Task 4.1
- [x] Single Storybook page per builder → Tasks 2.3, 3.2, 4.2
- [x] Tests: integration test for dispatch → Task 1.2; per-platform tests unaffected (internal imports); WCAG covers PostPreview → Task 2.2
- [x] size-limit consolidated → Task 5.1
- [x] Single changeset → Task 5.2

**Type consistency check:** `PostPreviewProps`, `PostPreviewSlots`, `PlatformId` defined once in Task 1.1 / Task 1.3 and re-exported in Task 2.1. Per-platform `*PreviewProps` continue to be exported from `platforms/index.ts` (re-exported in the trimmed barrel in Task 2.1).

**Placeholder scan:** No "TBD"/"TODO"/"add error handling" left.

**Known caveats:**

1. **`check:stories` cap of 3.** The new `post-preview.stories.tsx` has 3 stories; if the soft cap is `> 3` (warns at 4), we're fine. If `check:stories` flags 3, Task 2.3 Step 3 instructs collapsing to 2.
2. **Pre-commit hook runs full lint + test + check:stories.** Each commit in this plan invokes the hook; failures abort the commit and require fixing before retry. Never use `--no-verify`.
3. **`renderEditor` UX trade-off.** When `renderEditor` is supplied, the platform component renders read-only and the consumer's editor sits above it (instead of replacing the in-place textarea). This avoids modifying all 12 platform components. Consumers wanting in-place editing continue to use `editable` + `onContentChange`.
4. **localStorage mock.** Already added in commit `9dbb041` (vitest.setup.ts). All tasks below assume the test environment is unblocked.
