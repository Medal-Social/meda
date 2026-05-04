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
} from './platforms/index.js';
import { PostPreview } from './post-preview.js';
import type { PostPreviewBaseProps } from './types.js';

type Props = PostPreviewBaseProps;

const platforms: Array<[string, (p: Props) => ReactElement]> = [
  ['BlueSky', (p) => <BlueSkyPreview {...p} />],
  ['Discord', (p) => <DiscordPreview {...p} />],
  ['Facebook', (p) => <FacebookPreview {...p} />],
  ['Generic', (p) => <GenericPreview {...p} platform="custom" />],
  ['GoogleBusiness', (p) => <GoogleBusinessPreview {...p} />],
  ['Instagram', (p) => <InstagramPreview {...p} />],
  ['LinkedIn', (p) => <LinkedInPreview {...p} />],
  ['Telegram', (p) => <TelegramPreview {...p} />],
  ['Threads', (p) => <ThreadsPreview {...p} />],
  ['TikTok', (p) => <TikTokPreview {...p} />],
  ['Twitter', (p) => <TwitterPreview {...p} />],
  ['YouTube', (p) => <YouTubePreview {...p} />],
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

  it('PostPreview (instagram) has no violations', async () => {
    const { container } = render(
      <PostPreview platform="instagram" displayName="Acme" username="acme" content="Hello" />
    );
    expect(await axe(container, AXE_OPTIONS)).toHaveNoViolations();
  });

  it('PostPreview (twitter) has no violations', async () => {
    const { container } = render(
      <PostPreview platform="twitter" displayName="Acme" username="acme" content="Hello" />
    );
    expect(await axe(container, AXE_OPTIONS)).toHaveNoViolations();
  });

  it('PostPreview (generic) has no violations', async () => {
    const { container } = render(
      <PostPreview platform="generic" displayName="Acme" username="acme" content="Hello" />
    );
    expect(await axe(container, AXE_OPTIONS)).toHaveNoViolations();
  });
});
