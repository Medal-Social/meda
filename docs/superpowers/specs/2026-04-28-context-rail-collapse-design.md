# ContextRail collapse toggle

**Status:** Draft for review
**Date:** 2026-04-28
**Affects:** `@medalsocial/meda` `<ContextRail>` (used by `<AppShell variant="workspace">`)

## Goal

Add an always-visible chevron toggle on the right edge of the `<ContextRail>` so users can collapse and re-expand the second-level navigation. Matches the Unifi sidebar pattern. Frees the workspace's main content area without losing access to the rail's items, since one click brings the rail back to its last-known width.

## Non-goals

- Collapsing the `<IconRail>` (the always-on nav backbone, intentionally permanent).
- Adding a separate toggle for the `<RightPanel>` — `<PanelToggle>` in `<ShellHeader>` already handles that.
- Keyboard shortcut. Possible follow-up; not in this scope.
- Animating the chevron icon swap. Instant swap on state change.

## What already exists

The state plumbing is in place from earlier shell work:

- `LayoutState.contextRail.collapsed: boolean` in `src/shell/layout-state.tsx`
- `ctx.contextRail.collapsed` reader and `ctx.contextRail.setCollapsed(boolean)` writer in `src/shell/shell-provider.tsx`
- Storage adapter persists the field per-workspace key.
- `<ContextRail>` already reads `collapsed` and applies `w-0` / `width: 0`.

What is missing is the UI affordance to flip the boolean.

## Visual + behavior spec

| Aspect | Spec |
|---|---|
| Toggle target | Flips `ctx.contextRail.collapsed` |
| Placement (expanded) | Top-right edge of the rail, vertically positioned 12px below the rail's top. The button sits *on* the rail's right border, half on the rail and half on the main content (visual "tab" affordance). |
| Placement (collapsed) | Same vertical position. Because the inner rail content is `w-0` but the outer wrapper retains its position next to `<IconRail>`, the toggle naturally anchors to the IconRail's right edge in collapsed state with no separate code path. |
| Icon | `<ChevronLeft>` when expanded, `<ChevronRight>` when collapsed. Lucide, 14px. Instant swap on state change. |
| Button size | 20px × 20px, `border border-border bg-card text-muted-foreground rounded-md shadow-sm`. Hover: `text-foreground bg-accent`. Focus-visible ring. |
| Width transition | `transition: width 200ms ease-in-out` on the inner wrapper. `motion-reduce:transition-none` for users with reduced-motion preference. |
| Re-expand width | Restores from `ctx.contextRail.width` (already persisted). |
| Resize handle | Not rendered when `collapsed === true` (no rail edge to grab). |
| Mobile | Toggle does not render on mobile viewport. `<ContextRail>` already hides via `useShellViewport`; the toggle follows the same visibility check. |
| Accessibility | `<button aria-label="Collapse sidebar" \| "Expand sidebar"` based on state, `aria-expanded={!collapsed}`, `aria-controls="meda-context-rail"`. |

## Implementation surface

`src/shell/context-rail.tsx`:

1. Wrap the existing rail content in an outer `<div className="relative" id="meda-context-rail">` that holds the toggle and the inner content.
2. Inner wrapper retains `overflow-hidden` and the `width` style binding plus the new `transition-[width] duration-200 ease-in-out motion-reduce:transition-none` classes.
3. New internal `<ContextRailToggle />` component, rendered as an absolute child of the outer wrapper. Anchored `top-3 -right-2.5 z-20`. Reads/writes `ctx.contextRail.collapsed`.
4. Hide the toggle when `useShellViewport() === 'mobile'`.
5. Skip rendering the resize handle when `collapsed === true`.

```tsx
function ContextRailToggle() {
  const ctx = useMedaShell();
  const collapsed = ctx.contextRail.collapsed;
  const Icon = collapsed ? ChevronRight : ChevronLeft;
  return (
    <button
      type="button"
      onClick={() => ctx.contextRail.setCollapsed(!collapsed)}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      aria-expanded={!collapsed}
      aria-controls="meda-context-rail"
      data-testid="context-rail-toggle"
      className={cn(
        'absolute top-3 -right-2.5 z-20 inline-flex h-5 w-5 items-center justify-center',
        'rounded-md border border-border bg-card text-muted-foreground shadow-sm',
        'hover:text-foreground hover:bg-accent',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      )}
    >
      <Icon size={14} aria-hidden />
    </button>
  );
}
```

The outer rail container shape:

```tsx
<div className="relative" id="meda-context-rail">
  {viewport !== 'mobile' && <ContextRailToggle />}
  <div
    className={cn(
      'overflow-hidden transition-[width] duration-200 ease-in-out motion-reduce:transition-none',
      collapsed && 'w-0'
    )}
    style={{ width: collapsed ? 0 : width }}
  >
    {/* existing rail content + items */}
  </div>
  {!collapsed && <ResizeHandle ... />}
</div>
```

No changes to `<AppShellWorkspace>`, no changes to `<ShellHeader>`, no changes to the public AppShell variant API.

## Tests

New cases in `src/shell/context-rail.test.tsx`:

- `renders the toggle button when expanded`
- `renders the toggle button when collapsed`
- `clicking the toggle flips ctx.contextRail.collapsed`
- `shows ChevronLeft icon when expanded, ChevronRight when collapsed`
- `inner content has width 0 when collapsed`
- `returns to last-known width when re-expanded after a manual resize`
- `toggle button has correct aria-label and aria-expanded for both states`
- `toggle button is not rendered on mobile viewport` (mock `useShellViewport`)
- `resize handle is not rendered when collapsed`

Existing `layout-state.test.tsx` already covers persistence of `collapsed`; no changes.

## Edge cases

- **Resize-then-collapse-then-re-expand**: should restore the most recent manually-set width, not the default. Already handled because `setCollapsed` does not touch `width`.
- **Reduced motion**: `motion-reduce:transition-none` gives instant snap for users with `prefers-reduced-motion: reduce`.
- **Touch devices on iPad viewport**: chevron is `tap`-able (20×20 px is below the 44px Apple HIG ideal but matches Unifi). Acceptable for a secondary control.
- **Storybook visual coverage**: handled by the existing `AppShell Workspace` story rendered at desktop and iPad viewports. No new top-level story (would push past the per-file budget enforced by `pnpm check:stories`).

## Rollout

- Single PR to `dev`.
- Backwards-compatible. No new props on any public component, no API shape change.
- Patch-level changeset (`@medalsocial/meda: patch`). New behavior is additive UX polish.
- Ships on the next release cycle via the Release Bot pipeline.

## Risks

- **Toggle button overlapping content**: the chevron is positioned `-right-2.5` so it sits half on the rail and half on the main content. If the main content has its own visible left border at that exact pixel, the chevron sits on top. Acceptable — same as Unifi.
- **Hit target size**: 20×20 px is a small target. Acceptable as a secondary affordance; the rail items themselves are larger for primary navigation.
- **Persistence growth**: `collapsed` is one boolean per workspace key. No measurable storage impact.
