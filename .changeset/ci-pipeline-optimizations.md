---
---

chore(ci): pipeline optimizations and auto-merge automation. Adds `pnpm` setup-node caching across `ci`, `release`, `deploy-worker`, and `chromatic` workflows; caches Playwright Chromium browsers between runs; cancels in-progress PR runs for `ci`, `codeql`, and `chromatic` (release flow deliberately excluded so duplicate runs surface as failures); gates the Storybook build on stories/config path changes via a dedicated `storybook.yml`; collapses `size-limit` into the `build` job to remove a duplicate install + build; auto-merges the recurring dev → prod and Changesets Release PRs; and auto-opens a `prod → dev` sync PR after each release lands.
