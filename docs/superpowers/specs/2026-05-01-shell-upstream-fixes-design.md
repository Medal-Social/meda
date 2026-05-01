# Shell Upstream Fixes Design

Date: 2026-05-01
Status: Draft for review

## Goal

Fix the remaining Meda shell issues from the consumer migration notes that were not fully resolved in `@medalsocial/meda@1.6.0`.

The implementation should address:

1. `panel.focus` callback identity churn causing consumer effect loops.
2. `panelViews.register` wrapper identity churn after panel view registration changes.
3. `ContextRail` clipping custom rendered content without built-in scroll handling.
4. `ContextRail` always rendering `module.label` as a visible header, causing duplicate consumer headings.
5. `useShellViewport()` throwing in jsdom/minimal browser environments where `window.matchMedia` is missing.

Already resolved items stay out of scope: ShellMain width/layout hooks, mobile drawer blur mitigation, and mobile workspace menu availability.

## Design Principles

- Prefer better shell defaults over preserving awkward behavior when the old behavior is a footgun.
- Keep function identity stable for consumer effects and lint-compliant dependency arrays.
- Keep accessibility semantics even when visible chrome changes.
- Make the common case work without downstream wrappers.
- Keep the API small and explicit where consumers need control.

## Provider Stability

`useMedaShell().panel` currently exposes state and action functions from a memoized object. The object must keep changing when state changes, but action function identities should not change because consumers reasonably depend on methods such as `panel.focus` in effects.

The provider will define stable callbacks with `useCallback` for:

- `panel.setMode`
- `panel.setActiveView`
- `panel.setWidth`
- `panel.open`
- `panel.close`
- `panel.toggle`
- `panel.focus`

Those callbacks will use functional `setLayoutState` updates so they do not need to close over `layoutState`. Mobile-specific actions may depend on `isMobile`, but `panel.focus` itself does not need a viewport dependency.

The `panel` object remains memoized from live state values plus the stable callbacks. This keeps existing `ctx.panel.mode`, `ctx.panel.activeView`, and `ctx.panel.width` behavior intact while making `ctx.panel.focus` safe in dependency arrays.

`panelViews.register` is already implemented as a stable callback, but it is exposed through a wrapper object memoized on `panelViewRegistrations`. This means `useMedaShell().panelViews.register` can churn when registrations change. The provider will expose `panelViews.register` from a wrapper that does not recreate the `register` function when `registrations` changes. The wrapper object may still change to expose live `registrations`, but the `register` function identity must remain stable.

## ContextRail Defaults

`ContextRail` should work for both navigation-style rails and custom rendered rails without forcing consumers to wrap content or duplicate header logic.

Add two props to `ContextRail` and pass them through `AppShellContextRailConfig`:

```ts
type ContextRailHeader = 'auto' | 'visible' | 'hidden';
type ContextRailScroll = 'auto' | 'none';

interface ContextRailProps {
  header?: ContextRailHeader;
  scroll?: ContextRailScroll;
}
```

Defaults:

- `header = 'auto'`
- `scroll = 'auto'`

Header behavior:

- `header="auto"` shows Meda's visible header when the module has navigation `items` and no `module.render`.
- `header="auto"` hides Meda's visible header whenever `module.render` is present, even if the module also has navigation `items`. Custom rendered rails are expected to own their visible heading.
- `header="visible"` always renders Meda's label/description header.
- `header="hidden"` never renders Meda's visible header.

Accessibility behavior:

- The `<aside>` keeps `aria-label={module.label}` regardless of visible header mode.
- If a visible header is rendered, it should remain a semantic heading.
- If no visible header is rendered, consumers can render their own heading inside `module.render`.

Scroll behavior:

- `scroll="auto"` makes the inner body a bounded vertical scroll container.
- `scroll="none"` keeps the existing consumer-managed overflow behavior.
- Width collapse/expand clipping still works. The outer animation wrapper can keep horizontal clipping, while the body content area handles vertical scrolling.

This is a deliberate visual behavior change. It makes long ContextRail content usable by default and prevents duplicate visible headings for custom rail content.

## Viewport Fallback

`useShellViewport()` should be safe in jsdom and minimal browser-like environments.

Add a small internal helper that returns `window.matchMedia` only when it exists:

```ts
function getMatchMedia(): typeof window.matchMedia | null
```

Behavior:

- Server render still returns initial `'desktop'`.
- If `window` is undefined, viewport detection returns `'desktop'`.
- If `window.matchMedia` is missing, viewport detection returns `'desktop'`.
- The effect should no-op listener setup when `matchMedia` is missing.
- Existing breakpoint behavior remains unchanged when `matchMedia` exists.

This removes the need for unrelated tests to stub `matchMedia` unless they assert a specific viewport band.

## API Surface

Public additions:

- `ContextRailHeader`
- `ContextRailScroll`
- `ContextRailProps.header`
- `ContextRailProps.scroll`
- `AppShellContextRailConfig.header`
- `AppShellContextRailConfig.scroll`

No public prop is needed for provider callback stability or viewport fallback.

No downstream workaround API should be removed in this pass. Consumers that already wrap rail content in their own scroll area can opt out with `scroll="none"` or remove the wrapper after adopting the new default.

## Tests

Add regression coverage for provider stability:

- `panel.focus` identity remains stable after calling `panel.focus`.
- `panel.focus` remains safe in a lint-compliant effect dependency shape.
- `panelViews.register` identity remains stable after a registration changes.

Add ContextRail coverage:

- Default item-navigation rails render the visible Meda header.
- Default custom-render rails do not render the visible Meda header.
- `header="visible"` renders the header for custom-render rails.
- `header="hidden"` hides the header for item-navigation rails.
- `scroll="auto"` renders a vertical scroll container around content.
- `scroll="none"` disables the built-in vertical scroll container.

Add viewport coverage:

- `useShellViewport()` returns `'desktop'` and does not throw when `window.matchMedia` is undefined.
- Existing breakpoint tests continue to pass when `matchMedia` exists.

Existing full verification should include:

- targeted shell tests
- `pnpm test`
- `pnpm build`
- `pnpm lint`
- `git diff --check`

## Documentation And Demo Page

Update user-facing docs and the public demo/marketing page so the release is understandable without reading the changelog.

Docs to update:

- README usage notes.
- Storybook docs pages under `src/__stories__/docs/`.
- Relevant shell stories or examples that demonstrate `ContextRail`.
- Recipe output if any generated Next/AppShell guidance references ContextRail, viewport testing, or rail wrappers.

Public page to update:

- The demo/marketing site should reflect the latest AppShell behavior and current package version.
- If the page shows shell feature bullets or examples, update those to mention smarter ContextRail defaults and safer viewport behavior.
- Do not add marketing copy for internal implementation details such as callback identity churn; those belong in docs/changelog.

The docs should describe:

- `ContextRail` now scrolls by default.
- Meda's visible ContextRail header is automatic: navigation rails get the default header, custom rendered rails are expected to render their own heading unless `header="visible"` is set.
- Consumers can use `header="hidden"` and `scroll="none"` for manual control.
- `useShellViewport()` no longer requires `matchMedia` in tests unless a test needs a specific viewport result.

Docs and page copy should mention that this is a default behavior change after `1.6.0`.

## Release Notes

This should use a breaking changeset because `ContextRail` defaults change visually:

- ContextRail custom render modules no longer get a forced visible Meda header by default.
- ContextRail content scrolls vertically by default.

Provider identity stabilization and viewport fallback are non-breaking bug fixes.

## Non-Goals

- Do not redesign the ContextRail visual language.
- Do not implement the broader #102 primitive backlog.
- Do not remove existing mobile drawer or ShellMain fixes.
- Do not change downstream consumer code as part of the Meda package fix.
