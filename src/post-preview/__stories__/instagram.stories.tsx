import type { Meta, StoryObj } from '@storybook/react-vite';
import { InstagramPreview } from '../platforms/instagram.js';

const meta = {
  title: 'post-preview/Instagram',
  component: InstagramPreview,
  // Platform previews replicate brand chrome at exact swatches; visual fidelity
  // is the goal so disable strict color-contrast on captions.
  parameters: { a11y: { config: { rules: [{ id: 'color-contrast', enabled: false }] } } },
  args: {
    displayName: 'Acme Studios',
    username: 'acmestudios',
    avatarUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
    content: 'Just shipped a new Instagram integration. What do you think?',
  },
} satisfies Meta<typeof InstagramPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    mediaUrls: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=800&fit=crop',
    ],
  },
};

export const Carousel: Story = {
  args: {
    mediaUrls: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&h=800&fit=crop',
    ],
  },
};

export const Reel: Story = { args: { instagramPostType: 'reel' } };

export const Editable: Story = { args: { editable: true } };
