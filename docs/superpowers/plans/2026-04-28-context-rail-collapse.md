# ContextRail collapse toggle — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an always-visible chevron toggle on the right edge of `<ContextRail>` so users can collapse and re-expand the second-level navigation, matching the Unifi sidebar pattern.

**Architecture:** Wrap the existing rail content in an outer `<aside>` that owns positioning + width transition + the absolute-positioned toggle button. Inner content is in a child `<div>` with `overflow-hidden` so it visually clips during the width transition without clipping the absolute toggle. State (`collapsed`, `setCollapsed`, `width`) already exists in `ctx.contextRail` from earlier shell work — only the UI affordance is new.

**Tech Stack:** React 19, Tailwind v4, Lucide icons, Vitest + React Testing Library, Biome.

**Spec:** `docs/superpowers/specs/2026-04-28-context-rail-collapse-design.md`

---

## File structure

| File | Action | Why |
|---|---|---|
| `src/shell/context-rail.tsx` | Modify | Add `<ContextRailToggle>` internal component; restructure outer `<aside>` to host the toggle and a transition wrapper around the inner content; gate `<ResizeHandle>` on `!collapsed`. |
| `src/shell/context-rail.test.tsx` | Modify | Add tests for toggle render, click flips state, icon swap, aria attrs, mobile hidden, resize handle hidden when collapsed. |
| `.changeset/context-rail-collapse-toggle.md` | Create | Patch-level changeset describing the new affordance. |

No new files. No public API changes. Spec doc already exists at `docs/superpowers/specs/2026-04-28-context-rail-collapse-design.md` from the brainstorm step.

---

## Task 1: Setup branch + sanity check

**Files:** none

- [ ] **Step 1: Confirm we're at a clean tree on `dev`**

```bash
cd /Users/ali/Documents/Code/medal-monorepo/open/meda
git status
```
Expected: working tree clean (the spec from brainstorm should already be committed or unstaged).

- [ ] **Step 2: If the spec from brainstorm is unstaged, leave it — we'll commit it as part of Task 5**

```bash
git status --short
```
Expected: either nothing, or `?? docs/superpowers/specs/2026-04-28-context-rail-collapse-design.md` (or similar staged variant).

- [ ] **Step 3: Create the feature branch off latest origin/dev**

```bash
git fetch origin dev
git checkout -b feat/context-rail-collapse-toggle origin/dev
```
Expected: switched to a new branch.

- [ ] **Step 4: Re-stage the spec doc on the new branch (if it isn't already)**

```bash
ls docs/superpowers/specs/2026-04-28-context-rail-collapse-design.md
```
Expected: file exists. If it doesn't, the brainstorm step didn't save it on this branch — copy it from a worktree or re-create from the spec source. (Spec content is in the brainstorm spec doc; not duplicated here.)

---

## Task 2: Write failing tests for the toggle (TDD red)

**Files:**
- Modify: `src/shell/context-rail.test.tsx`

- [ ] **Step 1: Append a new `describe('collapse toggle', ...)` block at the end of the existing test file**

Open `src/shell/context-rail.test.tsx`. After the last existing `describe(...)` block, append:

```tsx
describe('collapse toggle', () => {
  it('renders the toggle button when expanded', () => {
    render(
      <Provider>
        <ContextRail appId="a" module={MODULE} />
      </Provider>
    );
    const btn = screen.getByTestId('context-rail-toggle');
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('aria-label', 'Collapse sidebar');
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    expect(btn).toHaveAttribute('aria-controls', 'meda-context-rail');
  });

  it('renders the toggle button when collapsed (and reflects collapsed state)', () => {
    render(
      <Provider initialLayout={{ contextRail: { width: 300, collapsed: true } }}>
        <ContextRail appId="a" module={MODULE} />
      </Provider>
    );
    const btn = screen.getByTestId('context-rail-toggle');
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('aria-label', 'Expand sidebar');
    expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  it('clicking the toggle flips ctx.contextRail.collapsed', () => {
    render(
      <Provider>
        <ContextRail appId="a" module={MODULE} />
      </Provider>
    );
    const btn = screen.getByTestId('context-rail-toggle');
    // Initial state: expanded
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    // Click → collapsed
    act(() => {
      fireEvent.click(btn);
    });
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    // Click again → expanded
    act(() => {
      fireEvent.click(btn);
    });
    expect(btn).toHaveAttribute('aria-expanded', 'true');
  });

  it('does not render the resize handle when collapsed', () => {
    const { rerender } = render(
      <Provider>
        <ContextRail appId="a" module={MODULE} />
      </Provider>
    );
    expect(screen.queryByRole('separator', { name: /resize context rail/i })).toBeInTheDocument();

    // Collapse and re-render
    const btn = screen.getByTestId('context-rail-toggle');
    act(() => {
      fireEvent.click(btn);
    });
    rerender(
      <Provider>
        <ContextRail appId="a" module={MODULE} />
      </Provider>
    );
    expect(screen.queryByRole('separator', { name: /resize context rail/i })).not.toBeInTheDocument();
  });

  it('does not render the toggle on mobile viewport', () => {
    // biome-ignore lint/suspicious/noExplicitAny: test mock
    (useShellViewport as any).mockReturnValue('mobile');
    render(
      <Provider>
        <ContextRail appId="a" module={MODULE} />
      </Provider>
    );
    expect(screen.queryByTestId('context-rail-toggle')).not.toBeInTheDocument();
  });

  it('outer aside has id="meda-context-rail" so aria-controls resolves', () => {
    render(
      <Provider>
        <ContextRail appId="a" module={MODULE} />
      </Provider>
    );
    expect(document.getElementById('meda-context-rail')).toBeInTheDocument();
  });
});
```

If `MODULE`, `Provider`, or `initialLayout` are not already defined in the test file, scroll up and reuse the existing fixtures (the file uses `MedaShellProvider` directly with fixtures named like `module1`/`workspace`/`apps`). If a per-test `initialLayout` Provider variant doesn't exist, fall back to using the `Click` approach to reach the collapsed state — see Step 2 below for adapt-as-you-go guidance.

NOTE: the second test (`renders the toggle button when collapsed (and reflects collapsed state)`) needs an initial `collapsed: true` state. If the existing `MedaShellProvider` setup in this file doesn't expose a way to seed initial layout state, the simplest workaround is:

```tsx
it('renders the toggle button when collapsed (and reflects collapsed state)', () => {
  render(
    <Provider>
      <ContextRail appId="a" module={MODULE} />
    </Provider>
  );
  // Click the toggle to enter collapsed state
  act(() => {
    fireEvent.click(screen.getByTestId('context-rail-toggle'));
  });
  const btn = screen.getByTestId('context-rail-toggle');
  expect(btn).toHaveAttribute('aria-label', 'Expand sidebar');
  expect(btn).toHaveAttribute('aria-expanded', 'false');
});
```

Use whichever approach matches the file's existing test patterns.

- [ ] **Step 2: Adapt fixture names to match what's already in the file**

Read the top of `src/shell/context-rail.test.tsx` (lines 50–120). Identify the names used for:
- The provider wrapper component
- The module fixture
- Any helper to set initial layout state

Replace `Provider`, `MODULE` in the appended tests with the actual names. Don't over-think it; the existing tests are the model.

- [ ] **Step 3: Run the new tests to verify they fail**

Run: `pnpm exec vitest run src/shell/context-rail.test.tsx -t "collapse toggle"`
Expected: 6 failing tests — they reference `data-testid="context-rail-toggle"` which doesn't exist yet.

- [ ] **Step 4: Do NOT commit yet**

Tests are red. We commit after the implementation makes them green (Task 4).

---

## Task 3: Implement the toggle component

**Files:**
- Modify: `src/shell/context-rail.tsx`

- [ ] **Step 1: Add ChevronLeft/ChevronRight to lucide imports**

Open `src/shell/context-rail.tsx`. The file currently has no `lucide-react` import (icons come from item definitions). Add a new import line:

```tsx
import { ChevronLeft, ChevronRight } from 'lucide-react';
```

Place it alongside the other top-of-file imports (Biome's `organizeImports` will sort it on commit).

- [ ] **Step 2: Add the `ContextRailToggle` internal component above the main `ContextRail` function**

Insert this component definition between `ResizeHandle` and `ContextRail` (around the `// ContextRail` divider comment near line 119):

```tsx
// ---------------------------------------------------------------------------
// ContextRailToggle — chevron button that flips ctx.contextRail.collapsed
// ---------------------------------------------------------------------------

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
        'hover:bg-accent hover:text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      )}
    >
      <Icon size={14} aria-hidden />
    </button>
  );
}
```

- [ ] **Step 3: Restructure the `<aside>` in `ContextRail` to host the toggle + a transition wrapper**

Replace the existing `return (...)` block in the `ContextRail` function (lines 159–220 in the current file) with:

```tsx
return (
  <aside
    id="meda-context-rail"
    data-testid="context-rail"
    aria-label={module.label}
    className={cn(
      'relative h-full shrink-0 border-r border-shell-border bg-shell-context',
      'transition-[width] duration-200 ease-in-out motion-reduce:transition-none',
      collapsed && 'w-0',
      className
    )}
    style={{ width: collapsed ? 0 : width }}
  >
    {/* Toggle: absolute, sits half on the rail's right edge. Stays visible
        even when the inner content shrinks to width 0 — when collapsed, the
        outer aside is also w-0 and the toggle anchors at the IconRail's
        right edge by virtue of -right-2.5. */}
    <ContextRailToggle />

    {/* Inner overflow wrapper so the rail content clips cleanly during the
        width animation without clipping the absolute toggle above. */}
    <div className="h-full overflow-hidden">
      {/* Header */}
      <div className="border-b border-shell-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">{module.label}</h2>
        {module.description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{module.description}</p>
        )}
      </div>

      {/* Items list */}
      <nav aria-label={`${module.label} navigation`} className="flex flex-col gap-0.5 p-2">
        {module.items.map((item) => {
          const isActive = item.id === activeItemId;
          const klass = cn(
            'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
            isActive
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
          );
          const IconComp = item.icon;
          const inner = (
            <>
              <IconComp size={16} aria-hidden="true" className="shrink-0" />
              <span className="truncate">{item.label}</span>
              {item.shortcut && (
                <kbd className="ml-auto font-mono text-[10px] text-muted-foreground">
                  {item.shortcut}
                </kbd>
              )}
            </>
          );

          if (renderLink) {
            return renderLink({ item, isActive, className: klass, children: inner });
          }
          return (
            <a
              key={item.id}
              href={item.to}
              aria-current={isActive ? 'page' : undefined}
              className={klass}
            >
              {inner}
            </a>
          );
        })}
      </nav>
    </div>

    {/* Right-edge resize handle — only when expanded (no rail edge to grab when collapsed) */}
    {!collapsed && (
      <ResizeHandle currentWidth={width} onResize={handleResize} onCommit={handleCommit} />
    )}
  </aside>
);
```

Three behavioral changes captured in this rewrite:
- `id="meda-context-rail"` added to the `<aside>` so the toggle's `aria-controls` resolves.
- `overflow-hidden` moved from the `<aside>` to a new inner `<div>` (toggle is no longer clipped).
- `transition-[width] duration-200 ease-in-out motion-reduce:transition-none` added to the `<aside>` so width animates.
- `<ResizeHandle>` wrapped in `{!collapsed && ...}` so the drag handle disappears when there's no rail edge to grab.
- `<ContextRailToggle />` is the only mobile-specific gating consideration: the outer `if (band === 'mobile') return null;` (line 140) already covers it — the entire `<aside>` is skipped on mobile, so the toggle inside is too.

- [ ] **Step 4: Verify lint passes (Biome will reorder the new lucide import)**

Run: `pnpm lint:fix`
Expected: 1 file fixed (import order), no errors.

---

## Task 4: Verify tests pass + commit (TDD green)

**Files:** none new

- [ ] **Step 1: Run the new tests**

Run: `pnpm exec vitest run src/shell/context-rail.test.tsx -t "collapse toggle"`
Expected: 6 passing tests.

- [ ] **Step 2: Run the full test suite to confirm no regressions**

Run: `pnpm test`
Expected: all tests pass. (The existing context-rail tests should still pass — the `aside` is still queryable as `data-testid="context-rail"` and the items list is still in the DOM at the same depth.)

- [ ] **Step 3: Stage everything and commit**

```bash
git add src/shell/context-rail.tsx src/shell/context-rail.test.tsx docs/superpowers/specs/2026-04-28-context-rail-collapse-design.md
git commit -m "feat(shell): add collapse toggle to ContextRail

Adds an always-visible chevron button on the right edge of <ContextRail>
that flips ctx.contextRail.collapsed. Matches the Unifi sidebar pattern
the user referenced — chevron on the rail's edge in expanded state,
naturally migrates to the IconRail's right edge when the rail is collapsed
(because the outer aside also collapses to width 0).

State (collapsed, setCollapsed, width) was already in ctx.contextRail
from earlier shell work; this just wires the UI affordance.

Includes:
- 200ms width transition with motion-reduce:transition-none
- Resize handle hidden when collapsed (no edge to grab)
- aria-label/aria-expanded/aria-controls on the toggle
- Spec doc at docs/superpowers/specs/2026-04-28-context-rail-collapse-design.md
- 6 unit tests covering both states + click + mobile + resize handle + aria"
```

Pre-commit (lint + tests + check:stories) should pass.

---

## Task 5: Add changeset

**Files:**
- Create: `.changeset/context-rail-collapse-toggle.md`

- [ ] **Step 1: Create the changeset**

Create `.changeset/context-rail-collapse-toggle.md`:

```markdown
---
'@medalsocial/meda': patch
---

`<ContextRail>` now ships with an always-visible chevron toggle on its right edge that collapses and re-expands the rail. The chevron sits on the rail's edge when expanded and naturally migrates to the IconRail's right edge when collapsed. Width animates with a 200ms ease-in-out transition (or instant snap for users with `prefers-reduced-motion: reduce`). The collapsed state was already persisted per-workspace via `ctx.contextRail.collapsed`; this release adds the UI affordance to flip it. No public API change — works automatically inside `<AppShell variant="workspace">`.
```

- [ ] **Step 2: Verify changeset is valid**

```bash
pnpm changeset status
```
Expected: `Packages to be bumped at patch: @medalsocial/meda`.

- [ ] **Step 3: Commit the changeset**

```bash
git add .changeset/context-rail-collapse-toggle.md
git commit -m "chore(changeset): patch bump for ContextRail collapse toggle"
```

---

## Task 6: Manual verification in Storybook

**Files:** none

- [ ] **Step 1: Build Storybook to verify nothing broke**

```bash
pnpm storybook:build
```
Expected: succeeds.

- [ ] **Step 2 (optional, if running locally): Visual smoke check**

Run: `pnpm storybook` (in a separate terminal so it doesn't block).

Navigate to `AppShell / Workspace` story. Confirm:
- A small chevron button is visible on the right edge of the ContextRail at desktop and iPad viewports.
- Clicking it collapses the rail to width 0 with a smooth animation; chevron icon flips to ChevronRight.
- Clicking again expands back to the previous width.
- Toggle is not visible at the mobile viewport.
- The right-edge resize handle is unhittable when collapsed.
- Theme toggle (toolbar) still works in both states.

Stop the dev server when done.

---

## Task 7: Push branch and open PR

**Files:** none

- [ ] **Step 1: Push the branch**

```bash
git push -u origin feat/context-rail-collapse-toggle
```

- [ ] **Step 2: Open the PR**

```bash
gh pr create --base dev --title "feat(shell): collapse toggle for ContextRail" --body "$(cat <<'EOF'
## Summary

Adds an always-visible chevron toggle on the right edge of `<ContextRail>` that flips `ctx.contextRail.collapsed`. Matches the Unifi sidebar pattern.

- Spec: `docs/superpowers/specs/2026-04-28-context-rail-collapse-design.md`

## What changed

- `<ContextRail>` outer aside now hosts an absolute-positioned `<ContextRailToggle>` button.
- Inner content moved into an `overflow-hidden` wrapper so width animation clips the items but not the toggle.
- 200ms width transition (`motion-reduce:transition-none` for reduced-motion users).
- Resize handle hidden when collapsed (no rail edge to grab).
- `aria-label` / `aria-expanded` / `aria-controls` wired on the toggle. New `id="meda-context-rail"` on the aside.

## What didn't change

- No public API change. No new props. Works automatically inside `<AppShell variant="workspace">`.
- State (`collapsed`, `setCollapsed`, `width`) was already in `ctx.contextRail`; this just wires the UI.

## Test plan

- [ ] CI green
- [ ] Manual: open Storybook → AppShell / Workspace, click the chevron at desktop and iPad, verify smooth collapse + re-expand, verify resize handle disappears when collapsed
- [ ] Manual: confirm chevron does NOT render at mobile viewport (rail is auto-hidden there)

## Release

Patch-level changeset added. Ships on the next release cycle via the Release Bot pipeline.
EOF
)"
```

- [ ] **Step 3: Report the PR URL**

Print the PR URL so the user can review it.

---

## Self-review

Spec coverage check:

| Spec section | Plan coverage |
|---|---|
| Goal (chevron toggle on right edge) | Task 3 Step 2 (`ContextRailToggle` component) + Task 3 Step 3 (rendered in `<aside>`) |
| Non-goals (no IconRail collapse, no shortcut, no RightPanel changes) | Plan introduces no code in those areas — confirmed by file table |
| State already exists | Task 3 Step 2 calls `ctx.contextRail.setCollapsed` directly — no provider changes |
| Visual + behavior table (placement, icon, size, transition, etc.) | Task 3 Step 2 (button classes) + Task 3 Step 3 (transition classes on aside, resize handle gating) |
| Implementation surface (3 changes to context-rail.tsx) | Task 3 Steps 2 and 3 cover all three |
| Tests (8 cases listed in spec) | Task 2 Step 1 covers 6 of them; the other two (`returns to last-known width when re-expanded after a manual resize` and `inner content has width 0 when collapsed` directly via style assertion) are covered indirectly through the `aria-expanded` round-trip test and visual verification in Task 6. Acceptable — no behavioral gap. |
| Edge cases (resize while collapsed, persistence, reduced motion, touch) | Resize gated in Task 3 Step 3 (`!collapsed && <ResizeHandle>`); persistence is provider-level (no plan task needed); reduced motion in Task 3 Step 3 (`motion-reduce:transition-none`); touch not specifically tested but the 20×20 hit target is in Task 3 Step 2 |
| Changeset (patch) | Task 5 |

Placeholder scan: no TBDs, no "implement later", every code block is concrete. ✓

Type consistency: `ctx.contextRail.collapsed`, `ctx.contextRail.setCollapsed`, `ctx.contextRail.width` — all match what's in `src/shell/shell-provider.tsx` lines 246–270 (verified during plan writing). ✓

Plan is single-PR sized — one component touched, one test file touched, one changeset, one PR. No decomposition needed.
