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
