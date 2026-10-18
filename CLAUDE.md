# @medalsocial/meda — Claude Guide

## What this is
Shared Meda UI shell and runtime package. Public open-source, published to npm.

## Branch Strategy
Two-branch flow: `feat/*` → PR → `dev` → standing release PR → `prod`. `prod` is the default/stable branch and is advanced ONLY by that release PR — never open a PR against `prod` by hand.

The version bump happens on `dev`, not on `prod`. That is the whole trick: `prod`'s tree is always a tree `dev` already had, so promotion cannot conflict and there is never anything to sync back. See CONTRIBUTING.md → "Releasing".

## Release Pipeline
- CI runs on pushes and PRs to both `dev` and `prod`
- `release.yml` runs on push to **`dev`** (opens/refreshes the `chore: version @medalsocial/meda` PR into `dev` — auto-approved and auto-merged) and on push to **`prod`** (publishes; fails closed if a changeset is still pending)
- `promote.yml` runs on push to `dev` and keeps one `release/promote-dev → prod` PR alive: a draft until `dev` is release-ready, then ready with auto-merge armed. It is deliberately NOT auto-approved — **the approval on that PR is the release**
- Snapshots / prereleases: run `release.yml` manually with `mode: snapshot`
- Uses npm OIDC trusted publishing (no static NPM_TOKEN). Trusted publishing is bound to the workflow FILE NAME + the `npm` environment — do not rename `release.yml` and do not move publishing into another workflow

## Key Rules
- Public repo — never commit secrets
- License is Apache-2.0 — do not change
- No NPM_TOKEN — publishing uses OIDC
- Authoritative source is medal-monorepo/open/meda
- Pre-commit hook runs `pnpm lint` + `pnpm test` (see `.husky/pre-commit`) — never use `--no-verify`

## Storybook MCP
The `meda-storybook` MCP server is registered in `.mcp.json` and points at `http://localhost:6006/mcp` (provided by `@storybook/addon-mcp`). When working on UI components, run `pnpm storybook` and use the `meda-storybook` MCP tools to look up existing components, docs, and stories before generating new UI.
