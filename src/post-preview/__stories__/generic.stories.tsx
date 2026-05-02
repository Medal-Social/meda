import type { Meta, StoryObj } from '@storybook/react-vite';
import { GenericPreview } from '../platforms/generic.js';

const meta = {
  title: 'post-preview/Generic',
  component: GenericPreview,
  parameters: { a11y: { config: { rules: [{ id: 'color-contrast', enabled: false }] } } },
  args: {
    platform: 'mastodon',
    displayName: 'Acme Studios',
    username: 'acmestudios',
    avatarUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
    content: 'Just shipped a new Mastodon integration. What do you think?',
  },
} satisfies Meta<typeof GenericPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const KnownPlatformId: Story = {
  args: { platform: 'instagram' },
};

export const Editable: Story = { args: { editable: true } };
