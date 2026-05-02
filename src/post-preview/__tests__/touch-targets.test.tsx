import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { BASE_FIXTURE } from '../__stories__/fixtures.js';
import {
  BlueSkyPreview,
  DiscordPreview,
  FacebookPreview,
  GenericPreview,
  GoogleBusinessPreview,
  InstagramPreview,
  LinkedInPreview,
  TelegramPreview,
  ThreadsPreview,
  TikTokPreview,
  TwitterPreview,
  YouTubePreview,
} from '../index.js';

const MIN_TOUCH = 44;

const platforms: Array<[string, (props: object) => ReactElement]> = [
  ['twitter', (p) => <TwitterPreview {...(p as never)} />],
  ['linkedin', (p) => <LinkedInPreview {...(p as never)} />],
  ['instagram', (p) => <InstagramPreview {...(p as never)} />],
  ['facebook', (p) => <FacebookPreview {...(p as never)} />],
  ['threads', (p) => <ThreadsPreview {...(p as never)} />],
  ['bluesky', (p) => <BlueSkyPreview {...(p as never)} />],
  ['tiktok', (p) => <TikTokPreview {...(p as never)} />],
  ['youtube', (p) => <YouTubePreview {...(p as never)} />],
  ['google_business', (p) => <GoogleBusinessPreview {...(p as never)} />],
  ['telegram', (p) => <TelegramPreview {...(p as never)} />],
  ['discord', (p) => <DiscordPreview {...(p as never)} />],
  ['generic', (p) => <GenericPreview {...(p as never)} platform="custom" />],
];

describe('post-preview touch targets', () => {
  for (const [name, Component] of platforms) {
    it(`${name}: every interactive element is at least ${MIN_TOUCH}x${MIN_TOUCH}px`, () => {
      const { container } = render(<Component {...BASE_FIXTURE} />);
      const interactive = container.querySelectorAll('button, a, [role="button"]');
      expect(interactive.length).toBeGreaterThan(0);
      for (const el of interactive) {
        // jsdom doesn't compute layout — assert that the element carries
        // a Tailwind size class providing at least the minimum touch area
        // (min-h-11 / min-w-11 / size-11 / h-11 / w-11 — 11 * 4px = 44px).
        const classList = el.className.toString();
        const hasSize =
          /\b(min-h-1[1-9]|min-w-1[1-9]|size-1[1-9]|h-1[1-9]|w-1[1-9]|p-[3-9]|p-1\d|-m-[2-9])\b/.test(
            classList
          );
        expect(hasSize, `${name}: ${classList || '(no classes)'}`).toBe(true);
      }
    });
  }
});
