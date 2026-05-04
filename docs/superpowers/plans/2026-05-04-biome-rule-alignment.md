# Biome Rule Alignment Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement task-by-task.

**Goal:** Bring meda's biome ruleset in line with `medal-monorepo/biome.json` and pin biome to the latest patch (`2.4.14`).

**Branch:** `chore/biome-rule-alignment` off `dev` (after #132 merges).

**Architecture:** Single-file change to `biome.json` adding the rule overrides + an exact pin in `package.json`. The hard part is fixing the violations the new rules surface — meda already has 18 `noExplicitAny` warnings in `src/kanban/kanban-drop-handler.test.ts` and a stale `biome-ignore` suppression in `src/list/list-row.tsx`. After the rule change those become errors and must be repaired.

**Spec:** None — this PR follows the apps/web ruleset verbatim where it makes sense. Decision points called out inline.

---

## Pre-flight survey (run before opening the PR)

Before changing `biome.json`, snapshot what each new rule will surface so the PR scope is bounded.

```bash
# Each command lists violations that the rule will produce as errors.
# Copy outputs into the PR description so reviewers see the full picture.
pnpm exec biome lint --error-on-warnings src/                          # baseline
# Per-rule probes (run from repo root):
pnpm exec biome lint --rule suspicious/noExplicitAny=error src/
pnpm exec biome lint --rule suspicious/noConsole=error src/
pnpm exec biome lint --rule suspicious/noDebugger=error src/
pnpm exec biome lint --rule suspicious/noEvolvingTypes=error src/
pnpm exec biome lint --rule suspicious/noTsIgnore=error src/
pnpm exec biome lint --rule suspicious/noFocusedTests=error src/
pnpm exec biome lint --rule suspicious/noArrayIndexKey=error src/
pnpm exec biome lint --rule correctness/noUnusedImports=error src/
pnpm exec biome lint --rule correctness/noUnusedVariables=error src/
pnpm exec biome lint --rule correctness/useExhaustiveDependencies=error src/
pnpm exec biome lint --rule correctness/useHookAtTopLevel=error src/
pnpm exec biome lint --rule style/useImportType=error src/
pnpm exec biome lint --rule style/noNestedTernary=error src/
pnpm exec biome lint --rule style/useErrorMessage=error src/
```

Expected **zero-violation** rules (small or already enforced as warn): `noDoubleEquals`, `noConstEnum`, `noEvolvingTypes`, `noFocusedTests`, `noArrayIndexKey`, `noTsIgnore`, `noNestedTernary`. Confirm via the probes; if any return non-zero, add a fix task.

---

## File map

### Modified
- `biome.json` — add `linter.rules` overrides matching apps/web. Pin `$schema` to `2.4.14`.
- `package.json` — pin `@biomejs/biome` to exact `2.4.14` (no caret).
- `pnpm-lock.yaml` — regenerated.

### Likely fixes (sized from baseline survey)
- `src/kanban/kanban-drop-handler.test.ts` — 18 `as any` casts. Replace with `as unknown as DragEndEvent` or per-field typed mocks. ~5 min.
- `src/list/list-row.tsx:71` — stale `biome-ignore lint/a11y/useSemanticElements` suppression with no effect (already a warning). Remove or update.
- Anything else the survey surfaces.

---

## Tasks

### Task 1: Baseline the violation count

**Files:** none (read-only survey)

- [ ] **Step 1: Run the per-rule probes**

```bash
cd /Users/ali/Documents/Code/medal-monorepo/open/meda
for rule in \
  suspicious/noExplicitAny suspicious/noConsole suspicious/noDebugger \
  suspicious/noEvolvingTypes suspicious/noTsIgnore suspicious/noFocusedTests \
  suspicious/noArrayIndexKey correctness/noUnusedImports \
  correctness/noUnusedVariables correctness/useExhaustiveDependencies \
  correctness/useHookAtTopLevel style/useImportType style/noNestedTernary \
  style/useErrorMessage; do
  echo "=== $rule ==="
  pnpm exec biome lint --rule "$rule=error" src/ 2>&1 | tail -3
done
```

Expected: `kanban-drop-handler.test.ts` (18 noExplicitAny) and `list-row.tsx` (1 stale suppression). Document any others in the PR description.

- [ ] **Step 2: Open issues for each non-trivial cluster**

If any rule yields >5 violations across multiple files, create a tracked task here before continuing. Trivial single-file violations roll into Task 4.

---

### Task 2: Pin biome version exactly

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml` (regenerated)
- Modify: `biome.json` (`$schema` URL)

- [ ] **Step 1: Pin in `package.json`**

Change:
```json
"@biomejs/biome": "^2.4.12"
```
to:
```json
"@biomejs/biome": "2.4.14"
```

- [ ] **Step 2: Update lockfile**

```bash
pnpm install
```

- [ ] **Step 3: Bump the schema URL in `biome.json`**

Change:
```json
"$schema": "https://biomejs.dev/schemas/2.4.12/schema.json"
```
to:
```json
"$schema": "https://biomejs.dev/schemas/2.4.14/schema.json"
```

- [ ] **Step 4: Verify**

```bash
pnpm exec biome --version    # → 2.4.14
pnpm lint                     # baseline still passes (recommended-only rules)
```

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml biome.json
git commit -S -m "Pin @biomejs/biome to 2.4.14 (exact)"
```

---

### Task 3: Adopt apps/web's rule overrides

**Files:**
- Modify: `biome.json`

- [ ] **Step 1: Replace the `linter` block in `biome.json`**

Current:
```json
"linter": {
  "enabled": true,
  "rules": { "recommended": true }
}
```

New (mirrors `medal-monorepo/biome.json`):
```json
"linter": {
  "enabled": true,
  "rules": {
    "recommended": true,
    "correctness": {
      "noUnusedVariables": "error",
      "noUnusedImports": "error",
      "noUnusedFunctionParameters": "error",
      "noUnusedPrivateClassMembers": "error",
      "noInvalidUseBeforeDeclaration": "error",
      "useExhaustiveDependencies": "error",
      "useHookAtTopLevel": "error",
      "useValidTypeof": "error"
    },
    "suspicious": {
      "noConsole": "error",
      "noDebugger": "error",
      "noDoubleEquals": "error",
      "noEvolvingTypes": "error",
      "noExplicitAny": "error",
      "noArrayIndexKey": "error",
      "noAssignInExpressions": "error",
      "noConfusingVoidType": "warn",
      "noConstEnum": "error",
      "noDuplicateCase": "error",
      "noDuplicateClassMembers": "error",
      "noDuplicateJsxProps": "error",
      "noDuplicateObjectKeys": "error",
      "noEmptyBlockStatements": "warn",
      "noFallthroughSwitchClause": "error",
      "noFocusedTests": "error",
      "noGlobalIsFinite": "error",
      "noGlobalIsNan": "error",
      "noImplicitAnyLet": "warn",
      "noRedeclare": "error",
      "noShadowRestrictedNames": "error",
      "noSkippedTests": "warn",
      "noTsIgnore": "error",
      "noUnsafeNegation": "error",
      "useAwait": "warn",
      "useErrorMessage": "error"
    },
    "style": {
      "noNonNullAssertion": "warn",
      "noNestedTernary": "error",
      "noParameterAssign": "error",
      "useBlockStatements": "off",
      "useConst": "error",
      "useImportType": "error",
      "useNumericSeparators": "error"
    }
  }
}
```

Differences vs apps/web:
- `useNumericSeparators` is the last rule visible in the apps/web grep snippet; if apps/web has more rules in the `style` block, copy the rest verbatim. **Verify against `medal-monorepo/biome.json` before committing.**

- [ ] **Step 2: Run lint**

```bash
pnpm exec biome check --diagnostic-level=error .
```
Expected: errors in `src/kanban/kanban-drop-handler.test.ts` and `src/list/list-row.tsx`. These are addressed in Task 4 — do NOT commit yet.

---

### Task 4: Fix the violations the new rules surface

#### Task 4a: `src/kanban/kanban-drop-handler.test.ts` — 18 `as any` casts

**Files:**
- Modify: `src/kanban/kanban-drop-handler.test.ts`

- [ ] **Step 1: Replace `as any` with typed mocks**

The test passes synthetic `dnd-kit` `DragEndEvent` objects to `handleKanbanColumnDrop`. Replace each `as any` with the actual type:

```ts
import type { DragEndEvent } from '@dnd-kit/core';
// ...

const result = handleKanbanColumnDrop({
  event: {
    active: { id: 't1' },
    over: null,
  } as unknown as DragEndEvent,
  items: ITEMS,
  columns: COLUMNS,
});
```

Apply the same pattern to all 18 sites. The single `as unknown as DragEndEvent` cast at the outer object boundary is acceptable; the inner `id` / `data` fields no longer need `as any`.

- [ ] **Step 2: Verify**

```bash
pnpm exec biome lint --rule suspicious/noExplicitAny=error src/kanban/
pnpm test -- --run src/kanban/
```

#### Task 4b: `src/list/list-row.tsx:71` — stale suppression

**Files:**
- Modify: `src/list/list-row.tsx`

- [ ] **Step 1: Remove the no-effect suppression**

The current `// biome-ignore lint/a11y/useSemanticElements:` comment doesn't apply to the targeted node anymore. Either:
- Remove the comment entirely if the rule no longer fires, or
- Move it adjacent to the node it applies to.

Determine which by running:
```bash
pnpm exec biome lint --rule a11y/useSemanticElements=error src/list/list-row.tsx
```

#### Task 4c: any other violations from Task 1's survey

Add per-cluster sub-tasks here based on the baseline output. Don't change scope mid-PR — if a cluster is large (>20 sites or touches behavior), defer to a follow-up.

- [ ] **Step 1: Verify all rules clean**

```bash
pnpm exec biome check --diagnostic-level=error .
```
Expected: zero errors. Warnings (e.g. `noConfusingVoidType`, `noEmptyBlockStatements`) are acceptable.

- [ ] **Step 2: Commit**

```bash
git add src/
git commit -S -m "Fix biome rule violations surfaced by the apps/web ruleset"
```

---

### Task 5: Activate the new ruleset and verify

- [ ] **Step 1: Commit `biome.json`**

```bash
git add biome.json
git commit -S -m "Adopt apps/web biome rule overrides in meda"
```

- [ ] **Step 2: Full quality gate**

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm check:stories && pnpm build
pnpm exec biome lint --error-on-warnings .   # bonus: surface lingering warnings
```
Expected: PASS at every step. Warnings present are intentional per the ruleset and shouldn't fail.

- [ ] **Step 3: Open PR against `dev`**

PR title: `chore: align biome rules with apps/web; pin to 2.4.14`

PR body: include the per-rule baseline survey output from Task 1 so reviewers see exactly what the new rules caught and how each cluster was repaired.

---

## Out of scope (revisit later)

- Adopting apps/web's `vcs` block (auto-detect dev as default branch). Could pull in next pass.
- Migrating to a `biome-extends`-style shared config so apps/web and meda inherit from one source. Heavier refactor; do once if/when a third package needs the same rules.
- Per-folder rule overrides (e.g. relax `noConsole` for `scripts/`). Add only if the survey shows we need them.

## Self-Review

- [x] Spec coverage — N/A (no spec; this plan is the spec).
- [x] Type consistency — `DragEndEvent` import path is the same as apps/web (`@dnd-kit/core`).
- [x] Placeholder scan — no TBDs; all rule lists are concrete.
- [x] Latest biome — pinned to `2.4.14`, schema URL bumped accordingly.
- [x] Pre-existing warnings — explicit fix tasks for the only two known clusters (kanban test + list-row suppression).
