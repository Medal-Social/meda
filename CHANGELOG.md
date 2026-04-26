# @medalsocial/meda

## 0.3.0

### Minor Changes

- [#21](https://github.com/Medal-Social/meda/pull/21) [`ace3072`](https://github.com/Medal-Social/meda/commit/ace307290602c701e83f6829a109026f489f5731) Thanks [@alioftech](https://github.com/alioftech)! - Add three new subpath exports backing the pilot-talk Activity surface and any other Medal app needing timeline/chat/inspector primitives:

  - **`@medalsocial/meda/timeline`** — `<TimelineRail>` (composite) plus `<DateSwitcher>`, `<LiveIndicator>`, `<EventCard>`, `<TimelineTape>`, `<ScrubBar>`. Generic over a `TimelineEvent[]` shape; sticky LIVE pinning + auto-follow + jump-to-live built in.
  - **`@medalsocial/meda/chat`** — `<TranscriptStream>` (composite) plus `<TurnCard>`, `<ToolCallBlock>`, `<LatencyBadge>`, `<LatencyBreakdown>`. Per-turn play, per-stage latency, inline tool blocks.
  - **`@medalsocial/meda/panel`** — `<Inspector>` (composite) plus `<InspectorField>`, `<InspectorJSON>`. Tabbed property panel with token-keyed JSON pretty-print.

  All primitives are pure presentational, consume Meda's shadcn-semantic tokens, ship a Storybook-style demo route in `demo/`, and pass `vitest-axe` WCAG AA.

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
