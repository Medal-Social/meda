# ShellMain — Left-align workspace layout

**Status:** Draft
**Date:** 2026-04-28
**Owner:** Ali

## Problem

When the `ContextRail` is collapsed, the `Workspace` story (and any consumer using `ShellMain`'s default `layout="workspace"`) shows a large empty band between the `IconRail` and the page content. Content reads as "starting in the middle" of the available area instead of aligned to the left edge.

The empty band is not caused by the collapsed rail. `ContextRail` renders at `width: 0` when collapsed, and `ShellMain` is `flex-1`, so the main panel correctly absorbs the reclaimed space. The visual gap comes from `ShellMain`'s `workspace` layout class:

```ts
// src/shell/shell-main.tsx:13
workspace: 'mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8',
```

`mx-auto` centers the inner box inside its flex parent. On any viewport wider than `1280px + IconRail (60) + ContextRail (0 collapsed | 260 default)`, content gets symmetric horizontal whitespace. Collapsing the rail makes the left-side whitespace dominate the screen because there is no longer a rail filling that space.

## Goal

Content inside `ShellMain`'s default `workspace` layout should hug the **left edge** of the available area, with the `1280px` max-width cap kept as a readability ceiling on the right. Content position must remain stable when `ContextRail` toggles between expanded and collapsed.

`centered` and `fullbleed` layouts are unchanged — they remain opt-in for pages that need narrow centered reading or full-bleed canvases.

## Decision

**Remove `mx-auto` from the `workspace` layout class. Keep `max-w-[1280px]` and existing padding.**

```ts
// after
workspace: 'w-full max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8',
```

The result:

- Content starts flush with `ShellMain`'s left padding (`px-4 sm:px-6 lg:px-8`).
- Empty space moves to the right edge of the viewport when the viewport exceeds `1280px + rails`.
- Toggling `ContextRail` open/closed shifts content as a block, but the content's left padding relative to `ShellMain`'s left edge is unchanged. No horizontal jump within the work area.
- Readability cap (1280px) is preserved.

### Why not the alternatives

- **Full-bleed default** (drop `max-w-[1280px]`): pages that aren't grid-laid (long prose, narrow column lists) become unreadable on ultrawide.
- **Wider cap, keep `mx-auto`**: doesn't fix the "starts in the middle" feel, just narrows the band.
- **Adaptive (center when rail open, left-align when collapsed)**: content shifts horizontally on toggle, which feels jumpy and conflicts with PR #50's goal of making the rail toggle feel lightweight.

## Scope

### In scope

- `src/shell/shell-main.tsx` — remove `mx-auto` from the `workspace` entry of `layoutClass`.
- `src/shell/shell-main.test.tsx` — add an assertion that the `workspace` layout does **not** include `mx-auto`, to lock the behavior in.
- Visual regression / Chromatic snapshots for the `Workspace` story will shift. Re-baseline expected.

### Out of scope

- `centered` layout — unchanged (still uses `mx-auto max-w-2xl`).
- `fullbleed` layout — unchanged.
- `IconRail` / `ContextRail` widths or collapse logic.
- `RightPanel` behavior.
- Changes to `--shell-context-default` or other tokens.
- Auth shell variant (uses its own composition).

## Risks

- **Chromatic baseline churn** on stories that consume `ShellMain` with default `workspace` layout (notably `app-shell.stories.tsx::Workspace`). Mitigation: re-approve baselines as part of the PR.
- **Downstream consumers** of `@medalsocial/meda` will see content shift left after upgrading. This matches stated intent and should be called out in the changeset.

## Test plan

- Unit: extend `shell-main.test.tsx` `workspace` describe block to assert `className` does not contain `mx-auto`. Confirm `max-w-[1280px]` and padding assertions still pass.
- Visual: review the `Workspace` story in Storybook with `ContextRail` collapsed and expanded. Content's left edge should sit at `IconRail.right + ContextRail.width + ShellMain.px-*`, with no symmetric whitespace.
- Regression: confirm `centered` and `fullbleed` stories are unchanged.

## Changeset

Patch bump. User-facing summary:

> `ShellMain`'s default `workspace` layout now left-aligns content within its max-width cap instead of centering it. Pages that relied on horizontal centering can opt into `layout="centered"`.
