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
- Never open a PR against `prod` by hand. `prod` is advanced only by the standing
  release PR (see [Releasing](#releasing)), and a hand-merged commit on `prod` is the
  one thing that can make a promotion conflict
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

## Releasing

A release is **one approval**. Everything either side of it is automatic.

```
feat/* ──PR──▶ dev ──"chore: version" PR (auto)──▶ dev ──standing release PR──▶ prod ──▶ npm
                                                              ▲
                                                    you approve this. that's it.
```

### What each piece does

1. **You merge a feature PR into `dev`** with a changeset, as always.
2. **`release.yml` (version job)** runs on the push to `dev` and opens or refreshes the
   Changesets **`chore: version @medalsocial/meda`** PR *into `dev`*. It is auto-approved
   (bot-authored, release automation) and auto-merged, so `dev` ends up carrying the next
   version in `package.json`, the CHANGELOG entry, and no leftover changeset files.
3. **`promote.yml`** runs on every push to `dev` and keeps **one** PR alive:
   `release/promote-dev → prod`, titled `release: promote dev → prod`. While `dev` still
   has pending changesets it stays a **draft** (so it cannot be merged with a stale
   version); once the version PR has merged it is marked ready and auto-merge is armed.
4. **You approve that PR.** Auto-merge does the rest.
5. **`release.yml` (publish job)** runs on the push to `prod`: `changeset publish`, npm
   with provenance via OIDC, git tags, GitHub release.

There is no sync-back step, no promote branch to maintain, and no cherry-picking.

### Why nothing conflicts any more

`prod` is only ever advanced by the promote PR, whose tree **is** `dev`'s tree. So `prod`
never holds content that `dev` lacks. When `promote.yml` rebuilds the release branch it
cuts from `dev` and merges `prod` in, and that merge has an empty "theirs" side — it
cannot conflict. The merge commits that pile up on `prod` mean `prod` stops being an
*ancestor* of `dev`, and that is fine and expected: ancestry was only ever a proxy for
"does `dev` have everything `prod` has", and content equality answers that directly. Both
`promote.yml` and the auto-sync safety net test content, not ancestry.

The single thing that breaks the invariant is **a commit landing on `prod` that did not
come through `dev`** — a hand-opened PR against `prod`, or a hotfix (below). Do not do the
first. `promote.yml` fails closed and files a tracking issue if it ever happens.

### Releasing one thing while other work is unreleased

Everything merged into `dev` ships in the next release. There is deliberately no way to
promote a subset — that is what produced 2.8.0's cherry-pick, its merge conflict, its
orphaned changeset and the two repair PRs that followed.

So: **do not merge what you are not ready to ship.** Leave it on its PR. If a consumer
needs the unmerged work before then, publish a snapshot (below) instead of merging early.

### Hotfixing a released version

If `dev` holds work you cannot ship and something on npm is broken:

```bash
git switch -c hotfix/<thing> origin/prod
# fix it
pnpm changeset                 # patch
pnpm exec changeset version    # bump package.json + CHANGELOG on the branch
```

Open that against `prod`, merge it, and `release.yml` publishes. This deliberately puts
content on `prod` that `dev` does not have, so the auto-sync safety net will notice and
open a `chore: auto-sync prod → dev` PR — **merge it with a merge commit, not a squash**.
Until it lands, `promote.yml` refuses to build a release branch and says so on a tracking
issue.

### Prereleases and snapshots

To hand a consumer a build before it is released, run the **Release** workflow manually
with `mode: snapshot` (and optionally a `snapshot_tag`, default `snapshot`). It publishes
`x.y.z-<tag>-<sha>` under that dist-tag from whatever ref you dispatched, commits nothing,
pushes nothing, and never touches `latest`. Pin the exact version it prints in the job
summary:

```json
"@medalsocial/meda": "2.8.1-snapshot-20260921120000"
```

This lives inside `release.yml` on purpose: npm trusted publishing is bound to a workflow
**file name**, so a separate `snapshot.yml` could not publish without Ada registering it
with npm first.

### If a publish fails

Re-run the **Release** workflow on `prod` with `mode: release`. The bump lives on `dev`,
so `prod` can only ever publish the one version its tree carries, and `changeset publish`
skips anything already on the registry — a retry can finish the release but can never
double-bump it.

### Reading the tracking issues

Two workflows fail closed rather than pushing something a human has to unpick, and each
keeps exactly one issue updated rather than piling up duplicates:

- **`Promote dev → prod needs a manual merge`** — `prod` carries content `dev` does not.
  No release PR can be built until `dev` catches up.
- **`Auto-sync prod → dev needs a manual merge`** — the automatic catch-up merge
  conflicted, or `dev` still holds a changeset a release on `prod` already consumed
  (`scripts/detect-stale-changesets.mjs`, which does not show up as a conflict).

Both carry the SHAs, the conflicting paths, a link to the failed run and the manual
recipe, and both close themselves on the first healthy run.

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

## Dependencies and security advisories

Dependabot is configured in `.github/dependabot.yml`: grouped weekly version updates
for npm and for the SHA-pinned GitHub Actions, targeting `dev`. Packages that are
deliberately held back are listed there with the condition that lifts each hold.

Transitive advisories that cannot be fixed by a direct bump are closed with a
range-scoped `pnpm.overrides` entry. Every override MUST have a row in
[docs/dependency-overrides.md](./docs/dependency-overrides.md) naming its GHSA and the
condition for deleting it — an override with no row is indistinguishable from a
leftover, and a leftover can pin the tree *below* a version it could otherwise take.

Third-party GitHub Actions are pinned to full commit SHAs with the version in a
trailing comment, and anything downloaded and executed in CI is pinned to a release
artifact and checked against a recorded `sha256`. No `curl … | sh`.

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

Run the **Release** workflow from your branch with `mode: snapshot`. It publishes a
throwaway `x.y.z-<tag>-<sha>` under a non-`latest` dist-tag, with provenance, and prints
the exact version in the job summary. Pin that in the consumer app:

```json
"@medalsocial/meda": "2.8.1-snapshot-20260921120000"
```

Do **not** publish from a laptop. Publishing is OIDC trusted publishing bound to
`release.yml`; there is no npm token to publish with, and a local publish would ship
without provenance.

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
