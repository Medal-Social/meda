import type { Meta, StoryObj } from '@storybook/react-vite';
import { PostPreview, type PostPreviewProps } from '../post-preview.js';
import { BASE_FIXTURE, FIXTURE_MEDIA } from './fixtures.js';

const PLATFORMS: PostPreviewProps['platform'][] = [
  'instagram',
  'twitter',
  'facebook',
  'linkedin',
  'tiktok',
  'youtube',
  'threads',
  'bluesky',
  'discord',
  'telegram',
  'google_business',
  'generic',
];

interface StoryArgs {
  platform: PostPreviewProps['platform'];
  mode: 'preview' | 'edit';
  displayName: string;
  username: string;
  avatarUrl?: string;
  content: string;
  mediaUrls: string[];
}

const defaults: StoryArgs = {
  platform: 'instagram',
  mode: 'preview',
  ...BASE_FIXTURE,
  mediaUrls: [FIXTURE_MEDIA.square],
};

function render(args: StoryArgs) {
  const props = args as unknown as PostPreviewProps;
  return (
    <div style={{ width: '100%', maxWidth: 480, margin: '0 auto' }}>
      <PostPreview {...props} />
    </div>
  );
}

const meta: Meta<StoryArgs> = {
  title: 'PostPreview',
  component: PostPreview as Meta<StoryArgs>['component'],
  parameters: {
    a11y: { config: { rules: [{ id: 'color-contrast', enabled: false }] } },
  },
  argTypes: {
    platform: {
      control: { type: 'select' },
      options: PLATFORMS,
    },
    mode: {
      control: { type: 'inline-radio' },
      options: ['preview', 'edit'],
    },
  },
  args: defaults,
  render,
};

export default meta;

type Story = StoryObj<StoryArgs>;

export const Default: Story = {};

export const Edit: Story = {
  args: { mode: 'edit' },
};

export const WithSlots: Story = {
  args: { mode: 'edit' },
  render: (args) => (
    <div style={{ width: '100%', maxWidth: 480, margin: '0 auto' }}>
      <PostPreview
        {...(args as unknown as PostPreviewProps)}
        renderEmojiPicker={() => (
          <button type="button" aria-label="Insert emoji">
            😀
          </button>
        )}
        renderMediaPicker={() => (
          <button type="button" aria-label="Add media">
            Image
          </button>
        )}
      />
    </div>
  ),
};
