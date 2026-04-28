# @medalsocial/meda

## 1.0.0

### Major Changes

- [#27](https://github.com/Medal-Social/meda/pull/27) [`e9eac4c`](https://github.com/Medal-Social/meda/commit/e9eac4c0238f615af5b993c08211ea1f2108e842) Thanks [@alioftech](https://github.com/alioftech)! - Shell v2 — breaking rewrite.

  - 4-layer token system shipped in package (canonical contract from
    `00-design-system.lib.pen` — brand purple ramp + neutral zinc + status
    ramps + surface primitives + shell semantic).
  - New components: AppShell, AppShellBody, ShellHeader (opinionated 56px),
    WorkspaceSwitcher, AppTabs, PanelToggle, IconRail (60px no expand,
    hover tooltip), RailDivider, ContextRail (resizable, persisted),
    ResizableShell, ShellMain (3 layouts), RightPanel (4 modes), MobileHeader,
    MobileBottomNav, MobileDrawers, CommandPalette (⌘K), ThemeToggle,
    MedalSocialMark.
  - Removed: ShellFrame, ShellHeaderFrame, ShellAppRail, ShellModuleNav,
    ShellPanelRail, ShellPanelToggle, NavigationArea, ShellState (use the
    new MedaShellProvider + v2 components).
  - Removed types from public surface (preserved at
    `@medalsocial/meda/shell/extras` for apps using ported legacy components):
    ShellContentLayout, ShellViewportBand, ShellTab, ShellNavItem,
    ShellRailItem, ShellModuleDefinition, ShellPanelDefinition,
    ShellCommandDefinition, ShellRouteContext, ShellHostAdapter,
    ShellViewDefinition.
  - Tailwind v4 theme bridge at `@medalsocial/meda/styles` (CSS-first via
    `@theme inline`; consumers `@import` it once). Removed `./styles.css`
    and `./tailwind.preset` exports.
  - Framework support: Vite + React, Next.js 14+ App Router, generic React.
    Optional `next-themes` peer-dep for `themeAdapter='next-themes'`.
  - See PR description for the full breaking-change list and migration
    guide.

### Minor Changes

- [#30](https://github.com/Medal-Social/meda/pull/30) [`4f6035c`](https://github.com/Medal-Social/meda/commit/4f6035c256f544e23988667622fc256360518302) Thanks [@alioftech](https://github.com/alioftech)! - Add the `@medalsocial/meda/marketing` subpath with framework-agnostic marketing components: `MarketingCallout`, `MarketingContact`, `MarketingLeadMagnet`, and shared CTA rendering. Storybook, demo, and registry entries now expose a Marketing category.

- [#30](https://github.com/Medal-Social/meda/pull/30) [`4f6035c`](https://github.com/Medal-Social/meda/commit/4f6035c256f544e23988667622fc256360518302) Thanks [@alioftech](https://github.com/alioftech)! - Bring meda into compliance with Medal-Social's design-system testing policy:

  - **Storybook 10** with `@storybook/react-vite`, `@storybook/addon-a11y`, and `@storybook/addon-themes`. One `*.stories.tsx` colocated next to every primitive in `chat/`, `panel/`, `shell/`, `timeline/`, and `voice/` (~27 stories total, deterministic data so visual review is stable). Storybook now mirrors the demo's Tailwind + tokens pipeline via `src/__stories__/storybook-globals.css` so primitives render with their production styling.
  - **Chromatic visual review** via `.github/workflows/chromatic.yml`, publishing Storybook for pull requests and pushes targeting `dev` or `prod` with the `CHROMATIC_PROJECT_TOKEN` repository secret. Chromatic owns UI diff review state, so PNG snapshot baselines are not committed to the repo.
  - **`size-limit`** with one entry per published export (`main`, `chat`, `panel`, `shell`, `timeline`, `voice`, `styles.css`). Limits set at current measured size + ~15 % headroom; new CI job in `ci.yml` fails the build on a breach. Bump rule documented in `CONTRIBUTING.md`.
  - **Per-folder a11y test files** (`src/<section>/wcag.test.tsx`) covering every primitive with `expect(await axe(container)).toHaveNoViolations()`. Replaces the earlier 3-component `src/__tests__/wcag.test.tsx`. The vitest-axe matcher type augmentation moved to `src/__tests__/vitest-axe.d.ts` and the value-side `expect.extend` to `vitest.setup.ts` so each new test file is a thin import + render.

  No changes to the public component API. Stories and tests are dev-only — `tsconfig.build.json` excludes `*.stories.tsx`, `__stories__/`, `__tests__/`, and `tests/` so they never reach the published `dist/`.

- [#20](https://github.com/Medal-Social/meda/pull/20) [`894d434`](https://github.com/Medal-Social/meda/commit/894d434d469fce6b639a857704d1b39a6de49ff1) Thanks [@alioftech](https://github.com/alioftech)! - Add three new subpath exports backing the pilot-talk Activity surface and any other Medal app needing timeline/chat/inspector primitives:

  - **`@medalsocial/meda/timeline`** — `<TimelineRail>` (composite) plus `<DateSwitcher>`, `<LiveIndicator>`, `<EventCard>`, `<TimelineTape>`, `<ScrubBar>`. Generic over a `TimelineEvent[]` shape; sticky LIVE pinning + auto-follow + jump-to-live built in.
  - **`@medalsocial/meda/chat`** — `<TranscriptStream>` (composite) plus `<TurnCard>`, `<ToolCallBlock>`, `<LatencyBadge>`, `<LatencyBreakdown>`. Per-turn play, per-stage latency, inline tool blocks.
  - **`@medalsocial/meda/panel`** — `<Inspector>` (composite) plus `<InspectorField>`, `<InspectorJSON>`. Tabbed property panel with token-keyed JSON pretty-print.

  All primitives are pure presentational, consume Meda's shadcn-semantic tokens, ship a Storybook-style demo route in `demo/`, and pass `vitest-axe` WCAG AA.

### Patch Changes

- [#30](https://github.com/Medal-Social/meda/pull/30) [`4f6035c`](https://github.com/Medal-Social/meda/commit/4f6035c256f544e23988667622fc256360518302) Thanks [@alioftech](https://github.com/alioftech)! - Add Storybook foundation documentation and token reference pages to the Meda demo site.

## 0.2.0

### Minor Changes

- [#15](https://github.com/Medal-Social/meda/pull/15) [`ea97961`](https://github.com/Medal-Social/meda/commit/ea97961259a94aea35bdd7e211569e05088a0d9d) Thanks [@alioftech](https://github.com/alioftech)! - VoiceOrb rebuilt with Three.js + R3F + GLSL shaders for production-quality audio-reactive animation. Public API preserved; new optional `outputLevel` prop for TTS playback reactivity. Adapted from ElevenLabs UI's MIT-licensed orb component with Meda token-driven theming and 5-phase state model.

- [#15](https://github.com/Medal-Social/meda/pull/15) [`ea97961`](https://github.com/Medal-Social/meda/commit/ea97961259a94aea35bdd7e211569e05088a0d9d) Thanks [@alioftech](https://github.com/alioftech)! - Add `/voice` subpath export with voice interaction primitives:

  - `useMicCapture()` hook for mic capture with AudioWorklet + RMS level
  - `<VoiceOrb>` glass-orb mic button with phase + voice-level reactivity
  - `<VoiceLevel>` level meter (bars / wave / ring variants)
  - `<VoiceStatusPill>` phase indicator badge

  Used by pilot-talk for hold-to-talk UI. The hook ships its AudioWorklet inline via Blob URL so consumers don't need to copy worklet files into their public dir.

## 0.1.1

### Patch Changes

- [#1](https://github.com/Medal-Social/meda/pull/1) [`46b31eb`](https://github.com/Medal-Social/meda/commit/46b31eb0134c1b56dc004d5304dfcf0551b63ecb) Thanks [@alioftech](https://github.com/alioftech)! - Add `.js` extensions to all relative imports in source so the emitted `dist/` is valid under Node ESM and Vitest's ESM loader.

  Previously, bundlers (Vite/rolldown/webpack) would fill in missing extensions at build time, so apps that bundled the library worked fine. But consumers running the library under raw Node ESM — notably Vitest — hit `Cannot find module './shell/public'` because the emitted JS carried bare `./X` imports that Node ESM won't resolve. This patch fixes packaging without changing any runtime behavior or public API.
