---
'@medalsocial/meda': minor
---

Bring meda into compliance with Medal-Social's design-system testing policy:

- **Storybook 10** with `@storybook/react-vite`, `@storybook/addon-a11y`, and `@storybook/addon-themes`. One `*.stories.tsx` colocated next to every primitive in `chat/`, `panel/`, `shell/`, `timeline/`, and `voice/` (~27 stories total, deterministic data so Chromatic snapshots are stable).
- **Chromatic** wired up via a new `.github/workflows/chromatic.yml`. Workflow exits cleanly when `CHROMATIC_PROJECT_TOKEN` isn't set so PRs stay mergeable until a maintainer adds the secret.
- **`size-limit`** with one entry per published export (`main`, `chat`, `panel`, `shell`, `timeline`, `voice`, `styles.css`). Limits set at current measured size + ~15 % headroom; new CI job in `ci.yml` fails the build on a breach. Bump rule documented in `CONTRIBUTING.md`.
- **Per-folder a11y test files** (`src/<section>/wcag.test.tsx`) covering every primitive with `expect(await axe(container)).toHaveNoViolations()`. Replaces the earlier 3-component `src/__tests__/wcag.test.tsx`. The vitest-axe matcher type augmentation moved to `src/__tests__/vitest-axe.d.ts` and the value-side `expect.extend` to `vitest.setup.ts` so each new test file is a thin import + render.

No changes to the public component API. Stories and tests are dev-only — `tsconfig.build.json` excludes `*.stories.tsx`, `__stories__/`, and `__tests__/` so they never reach the published `dist/`.
