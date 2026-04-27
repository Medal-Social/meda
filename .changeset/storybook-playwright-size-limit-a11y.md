---
'@medalsocial/meda': minor
---

Bring meda into compliance with Medal-Social's design-system testing policy:

- **Storybook 10** with `@storybook/react-vite`, `@storybook/addon-a11y`, and `@storybook/addon-themes`. One `*.stories.tsx` colocated next to every primitive in `chat/`, `panel/`, `shell/`, `timeline/`, and `voice/` (~27 stories total, deterministic data so visual snapshots are stable). Storybook now mirrors the demo's Tailwind + tokens pipeline via `src/__stories__/storybook-globals.css` so primitives render with their production styling.
- **Playwright visual regression** via `tests/visual/primitives.spec.ts` — discovers every story from Storybook's `index.json`, screenshots `#storybook-root`, diffs against committed PNG baselines under `tests/visual/primitives.spec.ts-snapshots/`. The `Visual regression` workflow runs the diff in CI and uploads the Playwright HTML report as an artifact on failure. No SaaS dependency, no secrets — baselines are reviewed via `git diff` of the PNG files.
- **`size-limit`** with one entry per published export (`main`, `chat`, `panel`, `shell`, `timeline`, `voice`, `styles.css`). Limits set at current measured size + ~15 % headroom; new CI job in `ci.yml` fails the build on a breach. Bump rule documented in `CONTRIBUTING.md`.
- **Per-folder a11y test files** (`src/<section>/wcag.test.tsx`) covering every primitive with `expect(await axe(container)).toHaveNoViolations()`. Replaces the earlier 3-component `src/__tests__/wcag.test.tsx`. The vitest-axe matcher type augmentation moved to `src/__tests__/vitest-axe.d.ts` and the value-side `expect.extend` to `vitest.setup.ts` so each new test file is a thin import + render.

No changes to the public component API. Stories and tests are dev-only — `tsconfig.build.json` excludes `*.stories.tsx`, `__stories__/`, `__tests__/`, and `tests/` so they never reach the published `dist/`.
