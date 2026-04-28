---
'@medalsocial/meda': patch
---

Adds Storybook authoring conventions ahead of the larger story-tree cleanup: Chromatic viewport modes (`desktop` 1280, `ipad` 768, `mobile` 390), `pnpm check:stories` lint script (warn-only initially), and `docs/STORIES.md` authoring guide. Declares `engines.node >= 22` since the lint script uses `fs.globSync`. No runtime behavior, exports, or rendered components changed.
