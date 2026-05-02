import type { Meta, StoryObj } from '@storybook/react-vite';
import { YouTubePreview } from '../platforms/youtube.js';

const meta = {
  title: 'post-preview/YouTube',
  component: YouTubePreview,
  parameters: { a11y: { config: { rules: [{ id: 'color-contrast', enabled: false }] } } },
  args: {
    displayName: 'Acme Studios',
    username: 'acmestudios',
    avatarUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
    content: 'Just shipped a new YouTube integration. What do you think?',
  },
} satisfies Meta<typeof YouTubePreview>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithMedia: Story = {
  args: {
    mediaUrls: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop',
    ],
  },
};

export const Editable: Story = { args: { editable: true } };
