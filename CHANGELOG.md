# @medalsocial/meda

## 1.6.0

### Minor Changes

- [#109](https://github.com/Medal-Social/meda/pull/109) [`9fbe80e`](https://github.com/Medal-Social/meda/commit/9fbe80eeff4ae7e240b796098a4f62061ff8210a) Thanks [@alioftech](https://github.com/alioftech)! - Add adoption-friendly workspace shell composition improvements: AppTabs now accepts rendered React node icons and router render links, workspace shells support header center and banner slots, the command palette is mounted automatically in workspace shells, mobile panel tabs are more readable, and auth/mobile drawer styling exposes safer override hooks.

### Patch Changes

- [#109](https://github.com/Medal-Social/meda/pull/109) [`afe8eaa`](https://github.com/Medal-Social/meda/commit/afe8eaa30a8ead4a4e2b62c5e96f59301d586dea) Thanks [@alioftech](https://github.com/alioftech)! - Expose workspace AppShell main layout/class hooks and update the Meda marketing site to use AppShell mobile chrome.

- [#109](https://github.com/Medal-Social/meda/pull/109) [`9fbe80e`](https://github.com/Medal-Social/meda/commit/9fbe80eeff4ae7e240b796098a4f62061ff8210a) Thanks [@alioftech](https://github.com/alioftech)! - Surface workspace menu items, workspace menu footer content, and the theme toggle in the mobile workspace Menu drawer.

- [#109](https://github.com/Medal-Social/meda/pull/109) [`9fbe80e`](https://github.com/Medal-Social/meda/commit/9fbe80eeff4ae7e240b796098a4f62061ff8210a) Thanks [@alioftech](https://github.com/alioftech)! - Replace the `themeAdapter="next-themes"` bridge internals so Meda no longer renders next-themes' inline script through React, avoiding the React 19 script-tag warning in consumer apps.

## 1.5.0

### Minor Changes

- [#80](https://github.com/Medal-Social/meda/pull/80) [`0c32faf`](https://github.com/Medal-Social/meda/commit/0c32faf83ae56e4d44a1ad7003f6e739279ad00c) Thanks [@alioftech](https://github.com/alioftech)! - `<AppShell variant="workspace">` now accepts a `workspace` config that lets consumers replace the WorkspaceSwitcher's package-default dropdown items with their own. Previously the "Manage workspaces / Settings / Profile / Sign out" entries were hardcoded inside `WorkspaceSwitcher` with no `onClick` or `href`, so they did nothing when clicked — a blocker for any real adopter.

  ```tsx
  <AppShell
    variant="workspace"
    workspace={{
      menuItems: [
        { id: 'settings', label: 'Settings', href: '/settings/users' },
        { id: 'profile',  label: 'Profile',  href: '/identity' },
        { id: 'sign-out', label: 'Sign out', onClick: () => signOut(), variant: 'destructive' },
      ],
      menuFooter: <CustomBottomSlot />,
    }}
    iconRail={...}
  >
  ```

  The new `WorkspaceMenuItem` shape supports `href`, `onClick`, optional `icon`, optional `separatorAfter`, and a `variant: 'default' | 'destructive'` tone hint. When `menuItems` is omitted the package-default items render unchanged (1.x behavior), so this is fully additive and non-breaking.

  The theme toggle is preserved automatically — meda still inserts it between the items and the footer so consumers don't need to reimplement theme cycling.

  `WorkspaceSwitcherProps.menuFooter` is the preferred name; `workspaceMenuFooter` is kept as a deprecated alias for backwards compatibility.

### Patch Changes

- [#86](https://github.com/Medal-Social/meda/pull/86) [`36b0ed1`](https://github.com/Medal-Social/meda/commit/36b0ed1f7e827027c5e8d1346cf8a1b4d793a358) Thanks [@alioftech](https://github.com/alioftech)! - fix(shell): preserve icon on `href` workspace menu items and avoid icon-render crash

  - `WorkspaceMenuItem` entries with `href` now render their icon. The previous
    implementation passed `<a href={item.href}>{item.label}</a>` to Base UI's
    `render` prop, and the cloned anchor's own children overrode the
    `DropdownMenuItem` children, silently dropping the icon. The anchor is now
    childless so Base UI merges the menuitem's icon + label children into it.
  - `renderConfiguredIcon` no longer crashes when `icon` is a non-element
    `ReactNode` object (e.g. an array of nodes). Previously any non-primitive,
    non-element value fell through to `createElement`, producing
    "Element type is invalid". The function now only invokes `createElement` for
    callable components and `forwardRef`/`memo`-shaped objects, and renders any
    other `ReactNode` as-is.

- [#80](https://github.com/Medal-Social/meda/pull/80) [`2368241`](https://github.com/Medal-Social/meda/commit/2368241cd014edfa9b1ad64526704bf83db93d31) Thanks [@alioftech](https://github.com/alioftech)! - Fix `<AppShell variant="workspace">` IconRail layout collapsing when consumed via Tailwind v4. Meda's exported `theme.css` now declares `@source "../**/*.js"` so utility classes used only by meda components (e.g. `h-full`, `mt-auto`, `py-3.5`, `bg-shell-rail`) are generated even when the consumer app doesn't reference them itself.

  Without this directive, Tailwind v4 silently dropped those classes and the IconRail rendered with content height instead of full viewport height — utility items stacked tight against the divider near the top of the rail instead of pinning to the bottom, and the first icon sat flush against the header. The directive is resolved relative to the CSS file location at build time, so it scans the package's own dist output regardless of where it's installed.

## 1.4.0

### Minor Changes

- [#73](https://github.com/Medal-Social/meda/pull/73) [`79fb98a`](https://github.com/Medal-Social/meda/commit/79fb98a31c9a29c68da70604169d1e0a8202811c) Thanks [@alioftech](https://github.com/alioftech)! - Adds auth adoption controls, `AppShell` auth branding shorthand, and an optional better-auth adapter subpath.

- [#75](https://github.com/Medal-Social/meda/pull/75) [`439e475`](https://github.com/Medal-Social/meda/commit/439e475e7e1c0c8f2e93fe38456d47d469f43711) Thanks [@alioftech](https://github.com/alioftech)! - Add shell primitive and Next recipe package subpaths, plus registry metadata for copyable AppShell adoption recipes.

- [#74](https://github.com/Medal-Social/meda/pull/74) [`3bb777c`](https://github.com/Medal-Social/meda/commit/3bb777c23ef050a542e4786b2b0da2fcc996d071) Thanks [@alioftech](https://github.com/alioftech)! - Add render-boundary adapter props for auth provider buttons, shell rail links, and right panel tabs so consumers can integrate routers, analytics, and wrapper components while preserving Meda ARIA, state, and event props.

- [#76](https://github.com/Medal-Social/meda/pull/76) [`970a8e6`](https://github.com/Medal-Social/meda/commit/970a8e6d8f8e60c68b199666c67c56f66f6a8dfd) Thanks [@alioftech](https://github.com/alioftech)! - Add a public theme bridge helper for app-scoped Meda token CSS and strengthen Next recipe accessibility/composition contracts.

## 1.3.0

### Minor Changes

- [#68](https://github.com/Medal-Social/meda/pull/68) [`983e648`](https://github.com/Medal-Social/meda/commit/983e6481875787122e65b0087fd05a014018e33c) Thanks [@alioftech](https://github.com/alioftech)! - Document shell adoption helpers with a Storybook workspace example covering `iconRail.renderLink` pass-through, the `panel.open`, `panel.close`, `panel.toggle`, and `contextRail.toggle` helpers, and `CommandDefinition.hotkey` as a display-only alias where `shortcut` wins when both are supplied.

- [#69](https://github.com/Medal-Social/meda/pull/69) [`5a496a2`](https://github.com/Medal-Social/meda/commit/5a496a29b2f87f4fd6fca6daa77fefe71a4e6e8f) Thanks [@alioftech](https://github.com/alioftech)! - Add dynamic shell composition APIs: context modules can render custom content in desktop and mobile rails, and route content can register right-panel views with PanelViewsProvider.

## 1.2.0

### Minor Changes

- [#60](https://github.com/Medal-Social/meda/pull/60) [`801df78`](https://github.com/Medal-Social/meda/commit/801df78fc6aed9d851a6ac2ee897dad5813b3cd4) Thanks [@alioftech](https://github.com/alioftech)! - Add `KanbanBoard` (kanban subpath), `ListRow` (list subpath), `RailDropSlot` (shell), and `LaneTimeline` (timeline). New primitives `Checkbox` and `Collapsible` in `components/ui/`. Kanban accepts a `labels` prop for i18n and per-column `accentClass` + `icon` (no shared status registry). `LaneTimeline` is a swimlane Gantt with built-in time-window math, range selector (1h/6h/24h/7d), date switcher, now-line, and legend; consumer passes pre-grouped `Lane[]`. Adds `@dnd-kit/{core,sortable,utilities}` peer deps.

### Patch Changes

- [#63](https://github.com/Medal-Social/meda/pull/63) [`d588262`](https://github.com/Medal-Social/meda/commit/d58826288d7ec66cfa216eb549b379167a27f6af) Thanks [@alioftech](https://github.com/alioftech)! - Fix `KanbanBoardProps.className` not being applied to the board wrapper. Fix `ListCell.shrink` flag being inverted from its documented behavior — `shrink={true}` now correctly allows shrinking; `shrink={false}` adds `flex-shrink-0`. Backwards-compatible for default usage.

## 1.1.2

### Patch Changes

- [#56](https://github.com/Medal-Social/meda/pull/56) [`8649dc7`](https://github.com/Medal-Social/meda/commit/8649dc753e58bc5a0b835203bfa553b9d723e239) Thanks [@alioftech](https://github.com/alioftech)! - `ShellMain`'s default `workspace` layout now left-aligns content within its `max-w-[1280px]` cap instead of centering it. This removes the unused band that appeared on the left of the work area when `ContextRail` was collapsed. Pages that need horizontally centered reading should opt into `layout="centered"`; pages that want full bleed already use `layout="fullbleed"`.

## 1.1.1

### Patch Changes

- [#50](https://github.com/Medal-Social/meda/pull/50) [`7fdf4bb`](https://github.com/Medal-Social/meda/commit/7fdf4bb30264527de8011e2b1e7cd3d062c82d69) Thanks [@alioftech](https://github.com/alioftech)! - `<ContextRail>` now ships with an always-visible chevron toggle on its right edge that collapses and re-expands the rail. The chevron sits on the rail's edge when expanded and naturally migrates to the IconRail's right edge when collapsed. Width animates with a 200ms ease-in-out transition (or instant snap for users with `prefers-reduced-motion: reduce`). The collapsed state was already persisted per-workspace via `ctx.contextRail.collapsed`; this release adds the UI affordance to flip it. No public API change — works automatically inside `<AppShell variant="workspace">`.

## 1.1.0

### Minor Changes

- [#40](https://github.com/Medal-Social/meda/pull/40) [`b52f514`](https://github.com/Medal-Social/meda/commit/b52f514633e7a404ccf1681fb9067af1259bbff4) Thanks [@alioftech](https://github.com/alioftech)! - Storybook cleanup and AppShell unification. The package is on `1.0.0-rc.1` with no real-world consumers yet, so the API reshape below ships as a `minor` to land before `1.0.0` rather than as a `major`. Treat this as part of the original `1.0.0` API surface — the components removed below were never depended on by any external app.

  **API surface changes (rolled into the `1.0.0` release):**

  - `<AppShell>` now requires a `variant` prop: `"auth" | "workspace" | "chat"`. Composition is config-driven via `iconRail`, `contextRail`, `rightPanel`, `globalActions`, and `auth` props.
  - `MobileHeader`, `MobileBottomNav`, `MobileDrawers`, `ShellAuthFrame`, and `ShellAuthThemeToggle` are removed. Their behavior is now internal to `<AppShell variant="auth">` and `<AppShell variant="workspace">`. The viewport switch is automatic.

  **New:**

  - Chromatic viewport modes (`desktop`, `ipad`, `mobile`) configured in `.storybook/preview.ts`.
  - `pnpm check:stories` lint script enforces story authoring conventions (banned export names, banned parameter shapes, story budget per file).
  - `docs/STORIES.md` authoring guide.

  **Migration:**
  Replace hand-composed shells with the new variant API:

  ```tsx
  <AppShell>
    <ShellHeader />
    <MobileHeader />
    <AppShellBody>
      <IconRail mainItems={items} />
      <ContextRail module={module} />
      <ShellMain>{children}</ShellMain>
      <RightPanel panelViews={views} />
    </AppShellBody>
    <MobileBottomNav />
    <MobileDrawers menuItems={items} module={module} panelViews={views} />
  </AppShell>
  ```

  ```tsx
  <AppShell
    variant="workspace"
    iconRail={{ mainItems: items }}
    contextRail={{ appId: "inbox", module }}
    rightPanel={{ panelViews: views }}
  >
    {children}
  </AppShell>
  ```

### Patch Changes

- [#39](https://github.com/Medal-Social/meda/pull/39) [`28be52b`](https://github.com/Medal-Social/meda/commit/28be52bcef5f198fb0eb917a3e8e94da3e5212ae) Thanks [@alioftech](https://github.com/alioftech)! - Adds Storybook authoring conventions ahead of the larger story-tree cleanup: Chromatic viewport modes (`desktop` 1280, `ipad` 768, `mobile` 390), `pnpm check:stories` lint script (warn-only initially), and `docs/STORIES.md` authoring guide. Declares `engines.node >= 22` since the lint script uses `fs.globSync`. No runtime behavior, exports, or rendered components changed.

- [#41](https://github.com/Medal-Social/meda/pull/41) [`2775ad9`](https://github.com/Medal-Social/meda/commit/2775ad9c6f4ed028d74970251d44ad98759a8921) Thanks [@alioftech](https://github.com/alioftech)! - Storybook navigation polish: AppShell now sits directly under Foundations to match its centrality, and its child stories render in Workspace → Auth → Chat → Docs order. Drops the dead `Shell v2` and `Chat` top-level entries from the storySort and updates the Get Started introduction + demo navigation labels to match the new IA. No runtime or API change.

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
