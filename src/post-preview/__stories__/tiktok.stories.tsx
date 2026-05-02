import type { Meta, StoryObj } from '@storybook/react-vite';
import { TikTokPreview } from '../platforms/tiktok.js';

const meta = {
  title: 'post-preview/TikTok',
  component: TikTokPreview,
  // Platform previews replicate brand chrome at exact swatches; visual fidelity
  // is the goal so disable strict color-contrast on captions.
  parameters: { a11y: { config: { rules: [{ id: 'color-contrast', enabled: false }] } } },
  args: {
    displayName: 'Acme Studios',
    username: 'acmestudios',
    avatarUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
    content: 'Just shipped a new TikTok integration. What do you think?',
  },
} satisfies Meta<typeof TikTokPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLongContent: Story = {
  args: {
    content:
      'When the day comes that AI replaces the social-media manager role, ' +
      'we will all look back fondly on the era of carefully-crafted captions.',
  },
};

export const Editable: Story = { args: { editable: true } };
