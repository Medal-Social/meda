# @medalsocial/meda

See [CLAUDE.md](./CLAUDE.md) for the contributor and agent guide.

## Review guidelines

These guidelines apply to automated code review (e.g. ChatGPT Codex Connector).

### Skip merge-up PRs

Do not flag issues on PRs whose head branch is `dev`, matches `changeset-release/*`,
or matches `chore/auto-sync-*`. These are merge-up / release-promotion PRs that
re-package code already reviewed at the feat → dev stage. Re-reviewing them
produces stale, duplicate findings that block the release flow.

If the PR was opened against `prod` from one of those branches, treat it as
already reviewed and skip.
