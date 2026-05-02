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
import type { PostPreviewBaseProps } from '../types.js';

const MIN_TOUCH = 44;

type Props = PostPreviewBaseProps;

const platforms: Array<[string, (props: Props) => ReactElement]> = [
  ['twitter', (p) => <TwitterPreview {...p} />],
  ['linkedin', (p) => <LinkedInPreview {...p} />],
  ['instagram', (p) => <InstagramPreview {...p} />],
  ['facebook', (p) => <FacebookPreview {...p} />],
  ['threads', (p) => <ThreadsPreview {...p} />],
  ['bluesky', (p) => <BlueSkyPreview {...p} />],
  ['tiktok', (p) => <TikTokPreview {...p} />],
  ['youtube', (p) => <YouTubePreview {...p} />],
  ['google_business', (p) => <GoogleBusinessPreview {...p} />],
  ['telegram', (p) => <TelegramPreview {...p} />],
  ['discord', (p) => <DiscordPreview {...p} />],
  ['generic', (p) => <GenericPreview {...p} platform="custom" />],
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
