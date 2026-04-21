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

- Branch from `dev`
- Write or update tests for any behavior change
- Ensure `pnpm test` and `pnpm build` pass before submitting
- Add a changeset with `pnpm changeset` for any user-facing change
- Do not commit generated `dist/` artifacts

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
