import { expect, test } from '@playwright/test';

/**
 * Visual regression for every Storybook story.
 *
 * Discovers stories from Storybook's index.json, then for each story
 * navigates to its iframe URL and captures a screenshot of #storybook-root.
 * Baselines live under tests/visual/primitives.spec.ts-snapshots/ and are
 * committed to the repo; CI compares against them and fails on diff.
 *
 * Local workflow: `pnpm visual` runs the diff. When you intentionally change
 * a primitive's appearance, run `pnpm visual:update` to regenerate baselines
 * and commit them with the PR.
 */

interface StoryEntry {
  id: string;
  title: string;
  name: string;
  importPath: string;
  type?: string;
}

interface StoryIndex {
  v: number;
  entries: Record<string, StoryEntry>;
}

// VoiceOrb stories use react-three-fiber / WebGL — Playwright's headless
// chromium can't reliably render WebGL identically across CI runners, so we
// skip those specific stories from the visual baseline. (The a11y suite
// still covers them.) Other Voice/* stories (VoiceLevel, VoiceStatusPill)
// are pure DOM and DO get visual coverage.
const SKIP_STORY_TITLES = new Set<string>(['Voice/VoiceOrb']);
const SKIP_STORY_IDS = new Set<string>();

test.describe('Storybook primitives — visual snapshots', () => {
  let stories: StoryEntry[] = [];

  test.beforeAll(async ({ request }) => {
    const res = await request.get('http://127.0.0.1:6006/index.json');
    expect(res.ok(), `failed to fetch storybook index: ${res.status()}`).toBeTruthy();
    const index = (await res.json()) as StoryIndex;
    stories = Object.values(index.entries).filter((entry) => {
      if (entry.type && entry.type !== 'story') return false;
      if (SKIP_STORY_IDS.has(entry.id)) return false;
      if (SKIP_STORY_TITLES.has(entry.title)) return false;
      return true;
    });
    expect(stories.length, 'expected at least one story to snapshot').toBeGreaterThan(0);
  });

  test('snapshots every non-WebGL story', async ({ page }) => {
    test.setTimeout(180_000);
    // Default desktop viewport for most stories; mobile stories override below.
    const DESKTOP = { width: 1280, height: 720 };
    const MOBILE = { width: 375, height: 667 };
    for (const story of stories) {
      // Mobile-only components (MobileHeader / MobileBottomNav / MobileDrawers)
      // gate their render on useShellViewport() === 'mobile' which reads
      // matchMedia from the actual window. Resize Playwright for these
      // stories so the components actually render; otherwise they return
      // null and #storybook-root stays empty.
      const isMobileStory = story.id.includes('mobile-mobile');
      await page.setViewportSize(isMobileStory ? MOBILE : DESKTOP);

      const url = `/iframe.html?id=${encodeURIComponent(story.id)}&viewMode=story`;
      await page.goto(url, { waitUntil: 'networkidle' });
      // Storybook renders into #storybook-root and removes the `hidden`
      // attribute once the story mounts. Wait for at least one rendered
      // child so we know rendering finished.
      await page
        .locator('#storybook-root *')
        .first()
        .waitFor({ state: 'attached', timeout: 15_000 });
      // Small settle delay for fonts / decorators.
      await page.waitForTimeout(200);
      // Snapshot the full viewport — covers the story plus the themed
      // background. Targeting #storybook-root directly is unreliable because
      // Storybook 10 sometimes leaves it `hidden` in the iframe view.
      await expect(page, `story ${story.id}`).toHaveScreenshot(`${story.id}.png`, {
        animations: 'disabled',
        fullPage: false,
      });
    }
  });
});
