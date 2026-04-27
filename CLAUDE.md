# @medalsocial/meda — Claude Guide

## What this is
Shared Meda UI shell and runtime package. Public open-source, published to npm.

## Branch Strategy
Two-branch flow: `feat/*` → PR → `dev` → PR → `prod`. `prod` is the default/stable branch. Changesets opens a "Release PR" (`changeset-release/prod` → `prod`) that bumps the version; merging it triggers the npm publish via OIDC.

## Release Pipeline
- CI runs on pushes and PRs to both `dev` and `prod`
- `release.yml` triggers on push to `prod`
- Changesets action either opens the Release PR or, if the version bump is already committed, publishes directly
- Uses npm OIDC trusted publishing (no static NPM_TOKEN)

## Key Rules
- Public repo — never commit secrets
- License is Apache-2.0 — do not change
- No NPM_TOKEN — publishing uses OIDC
- Authoritative source is medal-monorepo/open/meda
- Pre-commit hook runs `pnpm lint` + `pnpm test` (see `.husky/pre-commit`) — never use `--no-verify`

## Storybook MCP
The `meda-storybook` MCP server is registered in `.mcp.json` and points at `http://localhost:6006/mcp` (provided by `@storybook/addon-mcp`). When working on UI components, run `pnpm storybook` and use the `meda-storybook` MCP tools to look up existing components, docs, and stories before generating new UI.
