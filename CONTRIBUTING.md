# Contributing to @medalsocial/meda

## Getting Started

1. Fork and clone the repository
2. Install dependencies: `pnpm install`
3. Build: `pnpm build`
4. Run tests: `pnpm test`

## Development

```bash
pnpm build          # Build dist/
pnpm test           # Run unit tests
pnpm typecheck      # TypeScript check
```

## Project Structure

```
src/
  index.ts          # Main entry point
  shell/            # Shell components
scripts/
  build.mjs         # Post-compile build script
```

## Pull Requests

- Branch from `dev` and target `dev` in your PR
- Releases flow `dev → prod` via a second PR once a batch of changes is ready
- Write or update tests for any behavior change
- Ensure `pnpm lint`, `pnpm test`, and `pnpm build` pass before submitting
- Add a changeset with `pnpm changeset` for any user-facing change
- Do not commit generated `dist/` artifacts
- The pre-commit hook runs `pnpm lint` and `pnpm test`; do not bypass with `--no-verify`

## Code Style

- TypeScript strict mode, no `any`
- Use `import type` for type-only imports

## Changesets

This project uses [Changesets](https://github.com/changesets/changesets) for versioning and release notes.

For any PR that changes behavior visible to package users, add a changeset:

```bash
pnpm changeset
```

Choose `patch` for bug fixes, `minor` for new features, `major` for breaking changes.

## Releasing, and syncing `prod` back into `dev`

The normal path is `feat → dev → prod`. Pushing `prod` runs `release.yml`, which opens a
Changesets Release PR; merging **that** publishes to npm. Afterwards `auto-sync-prod-to-dev.yml`
opens a `chore: auto-sync prod → dev` PR so `dev` picks the version bump and CHANGELOG back up.

### Sync PRs into `dev` must be merged with a MERGE COMMIT

Never squash a `chore: auto-sync prod → dev` or hand-written sync PR. A squash discards the second
parent, so `prod` does not become an ancestor of `dev`, the branches stay diverged, and the next
auto-sync hits the same conflict all over again. This is not hypothetical: #222 was squashed and
#223 had to be opened purely to record the ancestry.

### Releasing from a cherry-pick onto `prod` is allowed — with two follow-ups

Sometimes a change has to ship without the rest of `dev` (for example a feature is ready while a
dependency sweep on `dev` is not). Cherry-picking it onto a branch cut from `prod` and releasing
from there is fine, and 2.8.0 shipped that way via #220. But it leaves **two** things behind, and
only one of them announces itself:

1. **A conflict on the next sync.** The cherry-picked commit and the original on `dev` touch the
   same lines from a common base, so merging `prod` into `dev` conflicts. Resolve in favour of
   whichever side is the intended future state — usually `dev`'s, since that is where the
   unreleased work lives.
2. **A released changeset left behind on `dev` — silent.** Normally a changeset reaches `prod`
   *through* `dev`, so the add is in the common ancestry and the release's deletion of it merges
   back cleanly. A cherry-pick adds it to `prod` *independently*, so at the merge base the file
   does not exist: `base=absent / prod=absent / dev=present` reads as "added by them" and git
   **keeps** `dev`'s copy without any conflict. Left in place, the next `changeset version`
   consumes it a second time, republishing notes that already shipped and over-bumping the
   version. Delete the spent file on `dev` and confirm with
   `pnpm exec changeset status --verbose`.

`scripts/detect-stale-changesets.mjs` catches case 2 automatically (see below). Case 1 fails the
sync workflow loudly.

### Reading the tracking issue

When a sync cannot be completed automatically, `auto-sync-prod-to-dev.yml` **fails closed** — it
aborts the merge, pushes nothing and opens no PR, because a conflicted branch under the
`chore/auto-sync-prod-to-dev-` prefix would be one auto-merge rule away from landing on `dev`.
Instead it writes a job summary and opens (or updates) a single issue titled
**`Auto-sync prod → dev needs a manual merge`**, containing the `prod` and `dev` SHAs, the
conflicted paths, any released-but-unremoved changesets, a link to the failed run, and the manual
recipe. Repeated failures update that one issue rather than piling up duplicates, and the first
healthy sync comments on it and closes it automatically. If you see it open, follow the recipe in
its body — and merge the resulting PR with a merge commit.

## Bundle size

We gate every PR on `pnpm size-limit` — the brotli-compressed size of each
published entry point must stay under the limits in `.size-limit.cjs`.

If you legitimately need to bump a limit (a new dep, a real feature growth):

1. Run `pnpm size-limit:why` to confirm what changed.
2. Update the limit in `.size-limit.cjs` to the new measured size + ~15 %
   headroom — never aspirationally low, never aspirationally high.
3. Justify the bump in the PR description with one sentence: *what*
   contributed the bytes, *why* it's worth it.

Reviewers MUST flag a silent limit bump.

## Visual review (Chromatic)

Visual review runs through Chromatic. The `Chromatic` GitHub workflow publishes
Storybook for pull requests and pushes targeting `dev` or `prod`, using the
repository secret `CHROMATIC_PROJECT_TOKEN`.

```bash
pnpm chromatic
```

When you intentionally change a primitive's appearance, review and accept the
expected diff in Chromatic. Do not commit visual snapshot PNGs.

Reviewers MUST verify expected Chromatic diffs before approving visual changes.

## Reporting Issues

Use [GitHub Issues](https://github.com/Medal-Social/meda/issues) to report bugs or request features.

## Developer Certificate of Origin (DCO)

All contributors must sign off their commits:

```bash
git commit -s -m "feat: your change"
```

This adds:

```
Signed-off-by: Your Name <your@email.com>
```

## Agent Skills (`skills/`)

`@medalsocial/meda` ships [TanStack Intent](https://tanstack.com/intent) skills in `skills/` that travel with each published version. Consumers running `npx @tanstack/intent install` get versioned usage guidance written into their agent config (`CLAUDE.md` / `AGENTS.md`).

**If your PR changes a public surface** — a token, a component API, a shell-region convention — **update the matching `skills/<area>/SKILL.md` in the same PR.** The `Check Skills` workflow runs `intent validate` on every PR touching `skills/` and will fail if structure breaks. A separate `stale` check runs after releases and opens a single review PR when source docs drift from skills; that is a safety net, not the primary discipline.

## AI-Assisted Changes

AI assistance is allowed, but contributors are responsible for the final patch.

- Review every AI-generated change before committing
- Write or update tests for any behavior change
- Use your own commit message and PR summary

## Working on Meda Alongside a Consumer App

Meda is published to npm. Consumers install it as a normal dependency. For iterative work that spans Meda and a consumer (e.g. a sibling app), two workflows are supported:

### 1. Snapshot release (preferred for PRs)

Use Changesets snapshot versioning to publish a throwaway preview:

```bash
pnpm changeset                          # describe the change
pnpm changeset version --snapshot dev   # versions as 0.x.y-dev-<sha>
pnpm build
pnpm publish --tag dev --no-git-checks  # publishes @medalsocial/meda@0.x.y-dev-<sha>
```

In the consumer app, pin to the snapshot:

```json
"@medalsocial/meda": "0.2.0-dev-abc1234"
```

### 2. `pnpm link` (local only)

For rapid local iteration, link the built library into the consumer:

```bash
# in this repo (run from the package root — this is where package.json lives)
pnpm build
pnpm link --global

# in the consumer
pnpm link --global @medalsocial/meda
```

Unlink before committing — never commit `pnpm link` state.
