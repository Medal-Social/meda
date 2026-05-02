# Builder Consolidation — Design Spec

**Date:** 2026-05-02
**Branch:** `feat/all-builders` (target for changes)
**Status:** Approved (pending implementation plan)

## Goal

Collapse the public API surface of `email-builder`, `post-preview`, and `workflow-builder` into one top-level component each, with all variation controlled through props (and render-prop slots for heavy/optional integrations). Internal files stay split; only the **exported** surface changes.

## Motivation

Today each builder ships a granular kit of sub-components (palettes, headers, canvases, inspectors, per-platform previews, etc.) that consumers must compose themselves. Adopters report this is hard to onboard to and easy to assemble incorrectly. Consolidating to a single component per builder gives a one-import, prop-driven entry point while keeping internal modularity for maintenance and tree-shaking.

## Non-goals

- File-level consolidation. Internal files stay where they are.
- Porting the full `apps/web` composer (Lexical editors, emoji picker, polls, hashtag autocomplete, media uploaders) into the OSS package. Those remain in the consumer; meda exposes slots for them.
- Convex coupling. All three components remain fully prop-driven.
- Behavioral redesign of any platform preview, block, or node. This is API surface work only.

## Public API after consolidation

### `email-builder`

**Exported:**

- `EmailBuilder` — the existing top-level component
- `renderToEmailHtml` and `RenderToEmailHtmlOptions`
- `createStarterDocument`
- Types: `EmailBlock`, `EmailDocument`, `EmailBuilderProps`, `EmailBuilderLabels`, `EmailBrand`, `EmailEnvelope`, `BlockKind`, `BlockPropsMap`, plus per-block prop types (`HeadingBlockProps`, `TextBlockProps`, `ButtonBlockProps`, `ImageBlockProps`, `ColumnsBlockProps`, `DividerBlockProps`, `SpacerBlockProps`, `FooterBlockProps`, `SocialBlockProps`, `SocialLink`)
- `defaultEmailBuilderLabels`
- Slot context types: `MediaPickerContext`, `SavedBlocksContext`
- `Alignment`, `ColumnLayout`, `DevicePreview`, `SpacingValue`, `BLOCK_KINDS`

**Removed from public exports** (kept as internal files):

- `BlockErrorBoundary`, `BlockPalette`, `BlockRenderer`, `BuilderCanvas`, `BuilderHeader`, `BuilderLeftTabs`, `EnvelopeCard`, `FloatingBar`, `MobileDrawer`, `MobileTabBar`, `PropertyInspector`, `ViewControls`
- `BLOCK_REGISTRY`, `BlockMeta`, `COLUMN_WIDTHS`, `createBlock`, `getColumnWidths`, `getDefaultBlockProps`

The existing `EmailBuilder` already supports `renderTextEditor`, `renderMediaPicker`, `renderSavedBlocks`. No new slots required.

### `post-preview` (largest change)

**New top-level component** (currently absent — consumers must pick a platform-specific preview):

```ts
type PostPreviewSlots = {
  mode?: 'preview' | 'edit';
  renderEditor?:        (ctx: { platform: PlatformId; value: string; onChange: (next: string) => void }) => ReactNode;
  renderMediaPicker?:   (ctx: { platform: PlatformId; current: string[] | undefined; onPick: (next: string[]) => void }) => ReactNode;
  renderEmojiPicker?:   (ctx: { onSelect: (emoji: string) => void }) => ReactNode;
  renderMentionPicker?: (ctx: { platform: PlatformId; query: string; onSelect: (mention: unknown) => void }) => ReactNode;
};

type PostPreviewProps = PostPreviewSlots & (
  | ({ platform: 'instagram' }       & InstagramPreviewProps)
  | ({ platform: 'twitter' }         & TwitterPreviewProps)
  | ({ platform: 'facebook' }        & FacebookPreviewProps)
  | ({ platform: 'linkedin' }        & LinkedInPreviewProps)
  | ({ platform: 'tiktok' }          & TikTokPreviewProps)
  | ({ platform: 'youtube' }         & YouTubePreviewProps)
  | ({ platform: 'threads' }         & ThreadsPreviewProps)
  | ({ platform: 'bluesky' }         & BlueSkyPreviewProps)
  | ({ platform: 'discord' }         & DiscordPreviewProps)
  | ({ platform: 'telegram' }        & TelegramPreviewProps)
  | ({ platform: 'google-business' } & GoogleBusinessPreviewProps)
  | ({ platform: 'generic' }         & GenericPreviewProps)
);
```

Consumer call site reads naturally because props are flat:

```tsx
<PostPreview
  platform="instagram"
  displayName="Acme Studios"
  username="acme"
  content="Hello world"
  mediaUrls={[url]}
  instagramPostType="carousel"
  labels={{ likes: (n) => `${n} loves` }}
  mode="edit"
  renderEditor={({ value, onChange }) => <RichEditor value={value} onChange={onChange} />}
/>
```

Each `*PreviewProps` already `extends PostPreviewBaseProps`, so spreading `& *PreviewProps` carries `displayName`, `content`, `mediaUrls`, `editable`, `onContentChange`, `frame`, `characterLimit`, `className`, `avatarUrl` plus the platform-specific extras (e.g. `instagramPostType`, `twitterTheme`, `discordEmbeds`). TypeScript narrows correctly when the `platform` literal is supplied.

`labels` stays a `Partial<*Labels>` per platform (already part of each `*PreviewProps`). The slot `mode` is sugar for `editable: true` — `<PostPreview mode="edit">` is equivalent to passing `editable={true}` and `mode` wins if both are set. The `editable` prop remains supported for direct callers but is not advertised in new examples.

**Exported:**

- `PostPreview`
- `PlatformId`, `PostPreviewFrame`, `PostPreviewBaseProps`
- All platform `*PreviewData` and `*Labels` types
- All `DEFAULT_*_LABELS` constants
- `InstagramPostType`, `TwitterTheme`, `LinkedInMentionData`, `LinkedInMentionPickerContext`, `TwitterMentionPickerContext`, `DiscordEmbedDraft`, `TelegramInlineKeyboardButton`, `TelegramInlineKeyboardMarkup`, `TelegramPollState` (existing platform-specific value types)

**Removed from public exports** (kept as internal files):

- 13 individual `*Preview` components
- 13 individual `*Chrome` components and `PhoneStatusBar`
- `PlatformChrome`, `PlatformChromeProps`
- All per-platform chrome prop types

### `workflow-builder`

**Exported:**

- `WorkflowBuilder` — the existing top-level builder
- `WorkflowCard`, `WorkflowCardCompact` — sibling list-row components, separate use case (kept exported)
- Types: `WorkflowBuilderProps`, `WorkflowBuilderLabels`, `WorkflowCardProps`, `WorkflowCardCompactProps`, `WorkflowSummary`, `WorkflowStatus`, `WorkflowNode`, `WorkflowEdge`, `WorkflowNodeData`, `WorkflowNodeKind`, `WorkflowToolboxItem`
- `defaultWorkflowBuilderLabels`

**Removed from public exports** (kept as internal files):

- `WorkflowCanvas`, `WorkflowCanvasProps`
- `WorkflowHeader`, `WorkflowHeaderProps`
- `WorkflowToolbox`, `WorkflowToolboxProps`
- All node components: `ActionNode`, `BaseWorkflowNode`, `BaseWorkflowNodeProps`, `ConditionNode`, `DelayNode`, `EndNode`, `TriggerNode`, `workflowNodeTypes`
- All edge exports: `DefaultWorkflowEdge`, `workflowEdgeTypes`
- `renderWorkflowIcon`, `resolveWorkflowIcon`
- `getDefaultNodeSentence`, `NODE_HEIGHT`, `NODE_KIND_STYLES`, `NODE_WIDTH`

## Internal architecture

```
src/post-preview/
├── post-preview.tsx          ← NEW: discriminated dispatch component
├── index.ts                  ← REWRITTEN: prune granular exports
├── public.ts                 ← unchanged (re-exports index.ts)
├── platforms/                ← unchanged (now internal)
├── chrome/                   ← unchanged (now internal)
├── internal/                 ← unchanged
└── types.ts                  ← unchanged
```

`post-preview.tsx` is a thin switch over `props.platform` that forwards to the existing per-platform component, threading the slot props through. No logic duplication.

`email-builder/` and `workflow-builder/` only need their `index.ts` rewritten — no new component files.

## Storybook

- One Storybook page per builder (three total), replacing the per-platform / per-piece pages.
- `PostPreview` story exposes `platform` as a `select` argType with all 12 values.
- `mode`, slot toggles (`renderEditor` on/off mock, etc.), and `frame` are exposed as story controls.
- Existing per-platform stories collapse into the single `PostPreview` page via the `platform` control.
- `EmailBuilder` and `WorkflowBuilder` stories already exist; we trim the auxiliary stories that demoed individual pieces.

## Tests

- Existing per-platform tests in `src/post-preview/platforms/` and `src/post-preview/chrome/` continue to import and test the internal components directly. They are unit tests of internals, unaffected by export changes.
- Add one integration test: `src/post-preview/post-preview.test.tsx` that asserts:
  - Each `platform` value renders the correct internal component.
  - Slot props (`renderEditor`, `renderMediaPicker`, `renderEmojiPicker`, `renderMentionPicker`) are forwarded.
  - `mode='edit'` engages editable surface where applicable.
- Existing `wcag.test.tsx` files continue to run; add a top-level `PostPreview` axe pass over a representative subset of platforms (instagram, twitter, generic).
- `email-builder` and `workflow-builder` tests are unaffected — only their `index.ts` exports change.

## Build, bundle, types

- `dist/post-preview/`, `dist/email-builder/`, `dist/workflow-builder/` rebuild with the trimmed surface.
- `.size-limit.cjs` per-platform/per-piece budgets are replaced with single per-builder budgets. Total bundle should be **smaller** (one entry per subpath rather than the granular tree-shake-on-import model that already required all chrome/platform files to ship).
- TypeScript declaration files reflect only the new public surface. No `@deprecated` markers — this is a pre-stable consolidation; consumers on `feat/all-builders` upgrade in one cut.

## Backwards compatibility

`feat/all-builders` is a pre-release integration branch. There are no external consumers of the granular post-preview exports yet (the platform components were introduced on `feat/post-preview` in the current cycle and have not shipped to `prod`). We can hard-cut the granular exports without a deprecation cycle.

For `email-builder` and `workflow-builder`, the granular exports are likewise on `feat/email-builder` / `feat/workflow-builder` and have not shipped to `prod`. Same hard-cut applies.

## Changeset

A single changeset entry replaces the four existing per-feature changesets:

```
---
'@medalsocial/meda': minor
---

Add `EmailBuilder`, `PostPreview`, and `WorkflowBuilder` as the single top-level
entry points for their respective surfaces. PostPreview accepts a discriminated
`platform` prop and exposes render-prop slots (renderEditor, renderMediaPicker,
renderEmojiPicker, renderMentionPicker) for heavy editor integrations.
```

## Out of scope (revisit later)

- Lexical-based rich text editor inside meda
- Built-in emoji picker, hashtag autocomplete, mention autocomplete
- Media uploader / Mux integration
- Polls, threads, multi-image grids beyond what current platform previews already support
- Convex bindings or storage adapters
