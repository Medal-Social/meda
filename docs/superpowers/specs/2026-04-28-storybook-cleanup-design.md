# Storybook cleanup and AppShell unification

**Status:** Draft for review
**Date:** 2026-04-28
**Owner:** Ali
**Affects:** `@medalsocial/meda` Storybook, public component API, downstream consumers (Picasso, pilot-talk, auto-cs)

## Goal

Cut the Storybook story tree from 120 to roughly 30 by collapsing duplicates and arg-variants into Chromatic modes and Storybook controls, and bake mobile chrome into `AppShell` so consumers compose one shell instead of hand-wiring desktop and mobile chromes side by side.

The forcing function is snapshot economics. The outcomes are story tree clarity (Storybook reads as a component catalog instead of a state matrix) and realism (the story you see is the production composition, shot at real viewports, with no parallel mobile path that can drift).

## Non-goals

- Visual redesign of any component. Pixels do not change unless a deletion uncovers a bug.
- New Studios. The Studios group is named and reserved; no Email/Workflow/Unifi implementation in this work.
- Splitting `@medalsocial/meda` into multiple packages. Revisited later when bundle pressure justifies it.
- Replacing Chromatic, Storybook, or the addon set.

## Final information architecture

```
Get Started
  ├── Introduction
  ├── Installation
  └── Theming

Foundations
  ├── Color
  ├── Typography
  ├── Spacing
  ├── Radii
  ├── Shadows
  ├── Motion
  ├── Z-Index
  ├── Iconography
  └── Mark                     [moved from Brand]

AppShell
  ├── Auth                     [3 viewports]
  ├── Workspace                [3 viewports]
  └── Chat                     [3 viewports]

Marketing
  ├── Callout
  ├── Contact
  └── LeadMagnet

Audio
  ├── VoiceOrb                 [snapshot disabled]
  ├── VoiceLevel               [snapshot disabled]
  └── VoiceStatusPill

Studios
  ├── Inspector
  ├── Timeline
  └── (Email, Workflow, Unifi, Site — reserved)
```

Approximate story count: 30 (down from 120).

## AppShell becomes a family of shells

Today: `AppShell` is a layout container. Consumers compose `ShellHeader`, `IconRail`, `ContextRail`, `ShellMain`, `RightPanel`, plus `MobileHeader`, `MobileBottomNav`, `MobileDrawers` by hand. Two parallel chromes that auto-hide via `useShellViewport`.

Proposed: `AppShell` accepts a unified config and renders the right chrome internally based on viewport.

```tsx
<AppShell
  variant="workspace"            // "auth" | "workspace" | "chat"
  iconRail={{ mainItems, utilityItems, footer }}
  contextRail={{ module, activeItemId }}
  rightPanel={{ panelViews, defaultView }}
  globalActions={<NewButton />}
>
  {children}
</AppShell>
```

Internally:

- **Desktop and iPad:** `ShellHeader` + `IconRail` + `ContextRail` + `ShellMain` + `RightPanel`, sourced from props.
- **Mobile:** `MobileHeader` + `ShellMain` + `MobileBottomNav` + `MobileDrawers`, sourced from the same props.
- The viewport switch lives inside `AppShell`. Consumers never touch `useShellViewport` for chrome decisions.

Variants:

- `variant="auth"`: split layout. Marketing panel left, form panel right. No rails, no header chrome.
- `variant="workspace"`: full work shell as today.
- `variant="chat"`: transcript-dominant layout. No rails. Header collapses to back / title / overflow. Composer and voice controls dock at bottom.

`MobileHeader`, `MobileBottomNav`, `MobileDrawers`, and `ShellAuthFrame` are **deleted** outright — no consumers are on `@medalsocial/meda` yet, so there is no migration shim to maintain. The internal variant components (`AppShellAuth`, `AppShellWorkspace`, `AppShellChat`) take over their responsibilities and may import the same UI primitives directly.

## Chromatic modes

Configured once in `.storybook/preview.ts`:

```ts
parameters: {
  chromatic: {
    modes: {
      desktop: { viewport: 1280 },
      ipad:    { viewport: 768  },
      mobile:  { viewport: 390  },
    },
  },
},
```

Theme is **not** a Chromatic-modes concern. The toolbar toggle (`withThemeByDataAttribute`) covers human verification. Dark mode is a `data-theme` attribute swap routed through CSS variables; the bug class Chromatic would catch (a hardcoded color escaping the token system) is better caught by a one-time grep on hex literals in `src/`.

Per-story mode budget:

| Category                         | Modes shot                  | Snapshots |
|----------------------------------|-----------------------------|-----------|
| `AppShell` variants              | desktop, ipad, mobile       | 3         |
| Marketing surfaces               | desktop, mobile             | 2         |
| Everything else                  | desktop                     | 1         |
| Animation-only                   | none (`disableSnapshot`)    | 0         |

## Ignore policy

Three tiers, smallest scope wins.

1. **`<div data-chromatic="ignore">`** wrapping only the moving subtree. Used for:
   - Latency `ms` text in `LatencyBadge`, `LatencyBreakdown` (rendered inside `AppShell Chat`)
   - Streaming caret in `TurnCard` Streaming variant
   - Now-line element in `LiveIndicator`, `ScrubBar`, `EventCard`

2. **`parameters.chromatic.ignoreSelectors`** at meta level when the same moving region appears across many stories of one component.

3. **`parameters.chromatic.disableSnapshot: true`** when the component IS the animation:
   - `VoiceOrb` (all stories)
   - `VoiceLevel` Bars and Wave variants (`Ring` is static enough to keep)

Time-deterministic stories prefer pinning the time prop (the `live-indicator` already accepts `now`) over ignoring the region. Ignores are for cases where pinning is impossible.

## Per-component prune

The minimal philosophy: one canonical story per component, unless the component has visually distinct composition modes that controls cannot reach in a single render. Real empty-state UI counts as a distinct mode. Arg-variant tweaks (severity, kind, label, color) become Storybook controls.

| File                                            | Today           | Keep                                 |
|-------------------------------------------------|-----------------|--------------------------------------|
| `brand/medal-social-mark.stories.tsx`           | 1               | Move to `Foundations / Mark`         |
| `chat/latency-badge.stories.tsx`                | 5               | Internal — no top-level story        |
| `chat/latency-breakdown.stories.tsx`            | 4               | Internal — no top-level story        |
| `chat/tool-call-block.stories.tsx`              | 3               | Internal — no top-level story        |
| `chat/transcript-stream.stories.tsx`            | 3               | Internal — no top-level story        |
| `chat/turn-card.stories.tsx`                    | 5               | Internal — no top-level story        |
| `marketing/marketing-callout.stories.tsx`       | 2               | 1 — Default                          |
| `marketing/marketing-contact.stories.tsx`       | 2               | 1 — Default                          |
| `marketing/marketing-lead-magnet.stories.tsx`   | 2               | 1 — Default                          |
| `panel/inspector.stories.tsx`                   | 2               | 1 — Default (under Studios/Inspector)|
| `panel/inspector-field.stories.tsx`             | 3               | Internal                             |
| `panel/inspector-json.stories.tsx`              | 4               | Internal                             |
| `shell/app-shell.stories.tsx`                   | 4               | 3 — Auth, Workspace, Chat            |
| `shell/command-palette.stories.tsx`             | 5               | Internal (lives in AppShell)         |
| `shell/context-rail.stories.tsx`                | 7               | Internal                             |
| `shell/icon-rail.stories.tsx`                   | 6               | Internal                             |
| `shell/resizable-shell.stories.tsx`             | 4               | 1 — Default                          |
| `shell/right-panel.stories.tsx`                 | 6               | Internal                             |
| `shell/shell-auth-frame.stories.tsx`            | 2               | Removed — covered by AppShell Auth   |
| `shell/shell-header-v2.stories.tsx`             | 5               | Internal                             |
| `shell/shell-main.stories.tsx`                  | 3               | Internal                             |
| `shell/mobile/mobile-bottom-nav.stories.tsx`    | 3               | Internal                             |
| `shell/mobile/mobile-drawers.stories.tsx`       | 4               | Internal                             |
| `shell/mobile/mobile-header.stories.tsx`        | 3               | Internal                             |
| `timeline/date-switcher.stories.tsx`            | 3               | Internal                             |
| `timeline/event-card.stories.tsx`               | 5               | Internal                             |
| `timeline/live-indicator.stories.tsx`           | 1               | Internal                             |
| `timeline/scrub-bar.stories.tsx`                | 3               | Internal                             |
| `timeline/timeline-rail.stories.tsx`            | 2               | Internal                             |
| `timeline/timeline-tape.stories.tsx`            | 4               | 1 — Default (under Studios/Timeline) |
| `voice/voice-level.stories.tsx`                 | 4               | 1 — Default + `disableSnapshot`      |
| `voice/voice-orb.stories.tsx`                   | 5               | 1 — Default + `disableSnapshot`      |
| `voice/voice-status-pill.stories.tsx`           | 5               | 1 — Default with `phase` control     |

"Internal" means: the component is not deleted and remains exported. It loses its top-level Storybook entry because it is documented as a part of an `AppShell` variant or a Studio. The `.stories.tsx` file may be deleted or kept under a hidden tag; preference is delete to reduce maintenance.

Visually distinct empty-state UI that survives by being moved into the relevant top-level story:

- Inspector empty state — visible in `Studios/Inspector` Default with `data` set to empty.
- Context rail empty state — visible in `AppShell Workspace` with `contextRail.module.items=[]`.
- Command palette empty state — visible in `AppShell Workspace` via play function that types a no-match query.

## Enforcement

`scripts/check-stories.mjs` (new, ~100 lines), wired into the existing pre-commit hook alongside `pnpm lint && pnpm test`, and into `chromatic.yml` before the build step.

Fails on:

1. Banned export names matching `^(Dark|Light|Mobile|Tablet|Desktop)\w*`. These are now expressed as Chromatic modes or by the toolbar theme toggle.
2. Banned parameter shapes: `parameters.themes.themeOverride` and `parameters.viewport.defaultViewport`. Use modes.
3. Story count per file: warn at >3 exports, fail at >5. Forces restructure into AppShell variants or controls.
4. Direct imports of `MobileHeader`, `MobileBottomNav`, `MobileDrawers` outside `app-shell.tsx` and the deprecation tests. Escape hatches must not be the primary API.

CI gate: `pnpm check:stories` runs in `chromatic.yml` before `pnpm chromatic`. Local pre-commit + CI gives two layers.

## Authoring guide

`docs/STORIES.md` (new, ~80 lines). Sections:

- Philosophy: one story per visually distinct shape; controls for everything else.
- Mode budget table.
- Ignore policy tiers with code examples.
- Anti-patterns (`DarkTheme`, `MobileCombined`, degenerate `Empty`) with the correction next to each.
- AppShell composition: how to use variants vs reaching for `MobileHeader` directly.

The `meda-storybook` MCP server already documented in `.mcp.json` and `CLAUDE.md` should reference `STORIES.md` so AI-authored stories follow the convention from the start.

## Release plan

This is a breaking API change but **no consumers are on the package yet**, so there is no migration shim, no `@deprecated` window, and no consumer-side migration PRs.

Single phase:
- Add Chromatic modes to `.storybook/preview.ts`.
- Implement `<AppShell variant="auth" | "workspace" | "chat">` with internal mobile chrome.
- Delete `MobileHeader`, `MobileBottomNav`, `MobileDrawers`, `ShellAuthFrame` and their stories.
- Apply prune table (delete or collapse per row).
- Add lint script and `STORIES.md`.
- Bump major version via Changesets. CHANGELOG entry summarizes the new API; no migration steps needed since no callers exist.
- Run Chromatic, accept the new baselines (most snapshots are first-time at iPad/mobile so they are net-new, not changes).

## Snapshot economics

| Bucket                       | Stories | Modes / story | Snapshots |
|------------------------------|--------:|--------------:|----------:|
| Foundations docs             |       9 |             1 |         9 |
| AppShell variants            |       3 |             3 |         9 |
| Marketing                    |       3 |             2 |         6 |
| Audio (VoiceStatusPill only) |       1 |             1 |         1 |
| Audio (Orb, Level)           |       2 |  0 (disabled) |         0 |
| Studios (Inspector, Timeline)|       2 |             1 |         2 |
| **Total**                    |   **20**|             — |   **~27** |

(Plus the Get Started MDX docs which are not snapshotted.)

| | Stories | Snapshots |
|---|---:|---:|
| Today | 120 | ~120 |
| After cleanup | ~30 | ~27 |

Net result: ~75% fewer stories to maintain, ~78% fewer snapshots, with **better** real-viewport coverage (today there is no iPad coverage; mobile is one hand-rolled story).

## Risks

- **Downstream breakage.** None — no consumers are on the package yet. This is the cheapest moment to make the change.
- **Lost coverage on currently-internal components.** A regression in `IconRail` will surface only via the `AppShell Workspace` snapshot. Mitigated because that snapshot is the one consumers actually see; an isolated `IconRail` regression that does not affect `AppShell` is not a regression worth catching.
- **`AppShell` becoming god-component.** With three variants and four sub-configs (`iconRail`, `contextRail`, `rightPanel`, `globalActions`) the file will grow. Counter-mitigation: variants render dedicated internal components (`AppShellAuth`, `AppShellWorkspace`, `AppShellChat`) and `AppShell` itself stays a switch. Each variant file stays small and focused.
- **Studios placement.** Inspector and Timeline are the only current members. Risk that the group looks empty until real Studios land. Acceptable — the group is small and named for its future.

## Open future work (out of scope here)

- Splitting Studios into `@medalsocial/meda-studios` once a real Studio with heavy deps lands.
- Visual regression strategy for the dark theme if a real bug is ever found there.
