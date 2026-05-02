import type { Meta, StoryObj } from '@storybook/react-vite';
import { PostPreview, type PostPreviewProps } from '../post-preview.js';
import { genericFixture } from './fixtures.js';

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

// Use a plain object type for the controls so Storybook's argTypes/args system
// can merge partial overrides without fighting the discriminated union.
interface StoryArgs {
  platform: PostPreviewProps['platform'];
  mode: 'preview' | 'edit';
  displayName: string;
  username: string;
  content: string;
  mediaUrls: string[];
}

const defaults: StoryArgs = {
  platform: 'instagram',
  mode: 'preview',
  ...genericFixture,
};

function render(args: StoryArgs) {
  const props = args as unknown as PostPreviewProps;
  return <PostPreview {...props} />;
}

const meta: Meta<StoryArgs> = {
  title: 'PostPreview',
  component: PostPreview as Meta<StoryArgs>['component'],
  parameters: {
    layout: 'centered',
    // Platform previews replicate brand chrome at exact swatches; visual fidelity
    // is the goal so disable strict color-contrast on platform UI elements.
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
    <PostPreview
      {...(args as unknown as PostPreviewProps)}
      renderEmojiPicker={() => <button type="button">😀</button>}
      renderMediaPicker={() => <button type="button">Image</button>}
    />
  ),
};
