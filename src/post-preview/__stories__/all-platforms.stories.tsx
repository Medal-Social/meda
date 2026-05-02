import type { Meta, StoryObj } from '@storybook/react-vite';
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
import { BASE_FIXTURE, FIXTURE_MEDIA } from './fixtures.js';

const meta: Meta = {
  title: 'post-preview / All Platforms',
  // Cross-cutting story renders every platform's brand chrome at exact
  // swatches; visual fidelity is the goal so disable strict color-contrast.
  parameters: { a11y: { config: { rules: [{ id: 'color-contrast', enabled: false }] } } },
};
export default meta;
type Story = StoryObj;

const platforms = [
  { name: 'Twitter / X', Component: TwitterPreview },
  { name: 'LinkedIn', Component: LinkedInPreview },
  { name: 'Instagram', Component: InstagramPreview },
  { name: 'Facebook', Component: FacebookPreview },
  { name: 'Threads', Component: ThreadsPreview },
  { name: 'BlueSky', Component: BlueSkyPreview },
  { name: 'TikTok', Component: TikTokPreview },
  { name: 'YouTube', Component: YouTubePreview },
  { name: 'Google Business', Component: GoogleBusinessPreview },
  { name: 'Telegram', Component: TelegramPreview },
  { name: 'Discord', Component: DiscordPreview },
  {
    name: 'Generic',
    Component: (p: object) => <GenericPreview {...(p as never)} platform="custom" />,
  },
] as const;

export const Grid: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {platforms.map(({ name, Component }) => (
        <div key={name}>
          <h3 className="mb-2 font-semibold text-sm">{name}</h3>
          <Component {...BASE_FIXTURE} mediaUrls={[FIXTURE_MEDIA.landscape]} />
        </div>
      ))}
    </div>
  ),
};
