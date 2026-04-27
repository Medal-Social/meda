import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for Storybook visual regression.
 *
 * Boots Storybook on 127.0.0.1:6006, then runs the specs in tests/visual/
 * which iterate every story and compare against committed PNG baselines
 * under tests/visual/<spec>.spec.ts-snapshots/.
 *
 * On CI, snapshot diffs fail the build and the playwright HTML report is
 * uploaded as an artifact for side-by-side review.
 */
export default defineConfig({
  testDir: './tests/visual',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { outputFolder: 'tests/visual/report', open: 'never' }], ['list']],
  // Snapshot baselines live next to each spec under <spec>.ts-snapshots/ and
  // intentionally drop the {platform}/{projectName} suffix so the same
  // baseline is used on Linux (CI) and macOS / Windows (dev). The
  // maxDiffPixelRatio tolerance below absorbs cross-platform AA / font
  // hinting differences.
  snapshotPathTemplate: 'tests/visual/{testFilePath}-snapshots/{arg}{ext}',
  use: {
    baseURL: 'http://127.0.0.1:6006',
    screenshot: 'only-on-failure',
  },
  expect: {
    toHaveScreenshot: {
      // Generous tolerance — primitives differ across platforms in font
      // hinting and sub-pixel AA. We're guarding against structural
      // regressions, not pixel-perfect identity.
      maxDiffPixelRatio: 0.05,
    },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm storybook',
    url: 'http://127.0.0.1:6006',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
