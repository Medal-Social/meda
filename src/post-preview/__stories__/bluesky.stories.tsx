import type { Meta, StoryObj } from '@storybook/react-vite';
import { BlueSkyPreview } from '../platforms/bluesky.js';

const meta = {
  title: 'post-preview/BlueSky',
  component: BlueSkyPreview,
  // Platform previews replicate brand chrome (timestamps in #6b7280, secondary
  // text in #9ca3af) at the original platform's exact swatches. Strict axe
  // color-contrast on the small captions fails at the 13–14px font sizes the
  // platforms use; visual fidelity is the explicit goal of this surface so
  // disable the rule at the story level.
  parameters: { a11y: { config: { rules: [{ id: 'color-contrast', enabled: false }] } } },
  args: {
    displayName: 'Acme Studios',
    username: 'acmestudios',
    avatarUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
    content: 'Just shipped a new BlueSky integration. What do you think?',
  },
} satisfies Meta<typeof BlueSkyPreview>;
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
