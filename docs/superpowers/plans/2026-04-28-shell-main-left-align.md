# ShellMain Left-Align Workspace Layout — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop centering content inside `ShellMain`'s default `workspace` layout so collapsing the `ContextRail` no longer leaves a wide unused band on the left.

**Architecture:** Drop `mx-auto` from the `workspace` entry of `layoutClass` in `src/shell/shell-main.tsx`. Keep `max-w-[1280px]` and existing horizontal padding. Add a unit assertion locking the new behavior in. `centered` and `fullbleed` layouts unchanged.

**Tech Stack:** TypeScript, React 19, Tailwind classes, Vitest + Testing Library, Biome lint, Storybook + Chromatic for visual regression.

**Spec:** [`docs/superpowers/specs/2026-04-28-shell-main-left-align-design.md`](../specs/2026-04-28-shell-main-left-align-design.md)

---

## File Structure

- **Modify** `src/shell/shell-main.tsx` — remove `mx-auto` from `layoutClass.workspace` (line 13).
- **Modify** `src/shell/shell-main.test.tsx` — extend the `default layout="workspace"` describe block with a negative assertion that the rendered `<main>` has no `mx-auto` class.
- **No changes** to `centered`, `fullbleed`, `IconRail`, `ContextRail`, `RightPanel`, layout state, tokens, or stories source. Storybook/Chromatic baselines for the `Workspace` story will need re-approval but the story file itself is not edited.

---

## Task 1: Lock new behavior with a failing test

**Files:**
- Modify: `src/shell/shell-main.test.tsx:6-27` (the `ShellMain — default layout="workspace"` describe block)

- [ ] **Step 1: Add the failing assertion**

Open `src/shell/shell-main.test.tsx`. Inside the existing `describe('ShellMain — default layout="workspace"', …)` block, add a third `it` test immediately after the existing `it('sets data-meda-shell-main-layout="workspace"', …)` (after line 26, before the closing `});` on line 27). Insert exactly:

```tsx
  it('does not apply mx-auto (workspace layout left-aligns content)', () => {
    render(
      <ShellMain>
        <div />
      </ShellMain>
    );
    const main = screen.getByRole('main');
    expect(main.className).not.toContain('mx-auto');
  });
```

The block should now contain three `it` cases: the existing `applies max-w-[1280px] and padding classes`, `sets data-meda-shell-main-layout="workspace"`, and the new `does not apply mx-auto …`.

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd /Users/ali/Documents/Code/medal-monorepo/open/meda
pnpm vitest run src/shell/shell-main.test.tsx
```

Expected: the new assertion fails with a message like `expect(received).not.toContain(expected) … "mx-auto"`. The other tests in the file still pass.

- [ ] **Step 3: Commit the failing test**

```bash
git add src/shell/shell-main.test.tsx
git commit -m "test(shell): assert workspace layout does not center via mx-auto"
```

Note: the project pre-commit hook runs `pnpm lint` + `pnpm test` (and `check:stories`). The failing test will block the commit. Run the commit anyway to confirm — then proceed to Task 2 to make it pass before re-attempting the commit.

If the pre-commit hook blocks, leave the test staged and move to Task 2; you'll commit them together.

---

## Task 2: Make the test pass

**Files:**
- Modify: `src/shell/shell-main.tsx:12-16` (the `layoutClass` map)

- [ ] **Step 1: Drop `mx-auto` from the workspace entry**

Open `src/shell/shell-main.tsx`. The current `layoutClass` map looks like:

```ts
const layoutClass: Record<ShellMainLayout, string> = {
  workspace: 'mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8',
  centered: 'mx-auto w-full max-w-2xl px-4 py-6 sm:px-6',
  fullbleed: 'w-full',
};
```

Replace the `workspace` line with:

```ts
  workspace: 'w-full max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8',
```

The final map must be:

```ts
const layoutClass: Record<ShellMainLayout, string> = {
  workspace: 'w-full max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8',
  centered: 'mx-auto w-full max-w-2xl px-4 py-6 sm:px-6',
  fullbleed: 'w-full',
};
```

Do not touch `centered` or `fullbleed`. Do not change padding or `max-w-[1280px]`.

- [ ] **Step 2: Run the targeted test to verify it now passes**

```bash
cd /Users/ali/Documents/Code/medal-monorepo/open/meda
pnpm vitest run src/shell/shell-main.test.tsx
```

Expected: all five tests in `shell-main.test.tsx` pass — the existing `workspace` `applies max-w-[1280px] and padding classes`, the existing `data-meda-shell-main-layout` attribute test, the new `does not apply mx-auto` test, and the unchanged `centered`, `fullbleed`, `content-visibility`, and `custom className` cases.

- [ ] **Step 3: Run the full unit suite**

```bash
cd /Users/ali/Documents/Code/medal-monorepo/open/meda
pnpm test
```

Expected: every test file passes (the project currently runs 78 files / 426 tests). Investigate any failure — `mx-auto` was not asserted by any other workspace-layout test as of writing, so no other test should break. If something does fail, do not paper over it; understand the dependency before continuing.

- [ ] **Step 4: Run lint**

```bash
cd /Users/ali/Documents/Code/medal-monorepo/open/meda
pnpm lint
```

Expected: pre-existing warnings (`noUselessFragments` and `noNonNullAssertion` in `context-rail.test.tsx`) are unchanged. No new findings introduced by this change.

- [ ] **Step 5: Commit**

```bash
git add src/shell/shell-main.tsx src/shell/shell-main.test.tsx
git commit -m "feat(shell): left-align ShellMain workspace layout"
```

The pre-commit hook will run `pnpm lint`, `pnpm test`, and `check:stories`. All must pass before the commit lands.

---

## Task 3: Verify visually in Storybook

This task produces no code or commits — it confirms the change reads right and prepares the Chromatic re-baseline.

**Files:** none.

- [ ] **Step 1: Start Storybook**

```bash
cd /Users/ali/Documents/Code/medal-monorepo/open/meda
pnpm storybook
```

Wait for the dev server to come up at `http://localhost:6006`.

- [ ] **Step 2: Open the Workspace story**

Navigate to the `Shell / AppShell` group and select the `Workspace` story (defined at `src/shell/app-shell.stories.tsx:107`). Confirm:

1. The "Inbox" heading and description sit flush with the left padding of `ShellMain` (i.e., immediately to the right of the `ContextRail`'s right edge plus `ShellMain`'s `px-4 sm:px-6 lg:px-8` padding). There is no symmetric whitespace band between the rail and the content.
2. Click the `ContextRail` collapse toggle (the small pull-tab on the right edge of the rail). The rail collapses to width 0; the content stays anchored to its left padding offset and no longer reads as floating in the middle of the canvas. The right edge of the content remains capped at `1280px`.
3. Re-expand the rail. Content shifts right as a block by exactly the rail's width — no horizontal jump within the work area.

If any of those three observations don't hold, stop and re-read `src/shell/shell-main.tsx`. The likely cause is an extra `mx-auto` left in the merged `className`.

- [ ] **Step 3: Confirm `centered` and `fullbleed` are unchanged**

In the same Storybook session, open any story that uses `layout="centered"` or `layout="fullbleed"` (e.g., the `Auth` story uses a different shell variant; for `centered`/`fullbleed` use the demo or any story that explicitly sets the prop). Confirm `centered` content remains horizontally centered with `max-w-2xl`, and `fullbleed` still spans edge-to-edge.

- [ ] **Step 4: Note Chromatic re-baseline**

When the resulting commit lands on a branch that runs Chromatic, the `Workspace` story snapshot will diff. That is expected. Approve the new baseline as part of the PR review — do not change the implementation to chase the old snapshot.

---

## Task 4: Add a changeset

**Files:**
- Create: `.changeset/shell-main-left-align.md` (filename can be anything; pnpm changeset uses random words by default — this stable name is fine).

- [ ] **Step 1: Write the changeset**

Create `.changeset/shell-main-left-align.md` with exactly:

```markdown
---
"@medalsocial/meda": patch
---

`ShellMain`'s default `workspace` layout now left-aligns content within its `max-w-[1280px]` cap instead of centering it. This removes the unused band that appeared on the left of the work area when `ContextRail` was collapsed. Pages that need horizontally centered reading should opt into `layout="centered"`; pages that want full bleed already use `layout="fullbleed"`.
```

- [ ] **Step 2: Verify changeset is valid**

```bash
cd /Users/ali/Documents/Code/medal-monorepo/open/meda
pnpm changeset status
```

Expected: the new changeset is listed and reports a `patch` bump for `@medalsocial/meda`. If `pnpm changeset status` is not configured in this repo, skip this step — the file format is what matters.

- [ ] **Step 3: Commit the changeset**

```bash
git add .changeset/shell-main-left-align.md
git commit -m "chore: changeset for ShellMain workspace left-align"
```

---

## Self-Review Notes

- **Spec coverage:** Decision (drop `mx-auto`) → Task 2. Test plan (assert no `mx-auto` on workspace) → Task 1. Test plan (visual review of `Workspace` story with rail collapsed/expanded) → Task 3. Changeset → Task 4. `centered` / `fullbleed` left untouched → enforced by Task 2 step 1 explicit final state and Task 3 step 3 visual check.
- **Placeholder scan:** No TBDs, no "implement appropriately", every code change shows the exact final string.
- **Type consistency:** No new types or methods introduced. The only identifier referenced (`layoutClass.workspace`) matches its existing definition site.
- **Risk callouts** from spec (Chromatic baseline churn, downstream consumer shift) are surfaced in Task 3 step 4 and Task 4 step 1 changeset copy respectively.
