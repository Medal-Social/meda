import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { BASE_FIXTURE } from './__stories__/fixtures.js';
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
} from './index.js';

const platforms: Array<[string, (p: object) => ReactElement]> = [
  ['BlueSky', (p) => <BlueSkyPreview {...(p as never)} />],
  ['Discord', (p) => <DiscordPreview {...(p as never)} />],
  ['Facebook', (p) => <FacebookPreview {...(p as never)} />],
  ['Generic', (p) => <GenericPreview {...(p as never)} platform="custom" />],
  ['GoogleBusiness', (p) => <GoogleBusinessPreview {...(p as never)} />],
  ['Instagram', (p) => <InstagramPreview {...(p as never)} />],
  ['LinkedIn', (p) => <LinkedInPreview {...(p as never)} />],
  ['Telegram', (p) => <TelegramPreview {...(p as never)} />],
  ['Threads', (p) => <ThreadsPreview {...(p as never)} />],
  ['TikTok', (p) => <TikTokPreview {...(p as never)} />],
  ['Twitter', (p) => <TwitterPreview {...(p as never)} />],
  ['YouTube', (p) => <YouTubePreview {...(p as never)} />],
];

// Platform brand chromes use authentic swatches that intentionally fail
// strict color-contrast checks (e.g. Twitter dim/lights-out, Discord, TikTok,
// YouTube). Visual fidelity is the goal — disable the rule rather than alter
// the brand surface.
const AXE_OPTIONS = {
  rules: {
    'color-contrast': { enabled: false },
  },
} as const;

describe('post-preview accessibility (axe)', () => {
  for (const [name, Component] of platforms) {
    it(`${name} has no axe violations`, async () => {
      const { container } = render(<Component {...BASE_FIXTURE} />);
      const results = await axe(container, AXE_OPTIONS);
      expect(results).toHaveNoViolations();
    });
  }
});
