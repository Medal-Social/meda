import type { Meta, StoryObj } from '@storybook/react-vite';
import { FacebookPreview } from '../platforms/facebook.js';

const meta = {
  title: 'post-preview/Facebook',
  component: FacebookPreview,
  // Platform previews replicate brand chrome at exact swatches (e.g. text-gray-500
  // on white for timestamps). Strict axe color-contrast trips on those small
  // captions; visual fidelity is the explicit goal so disable the rule.
  parameters: { a11y: { config: { rules: [{ id: 'color-contrast', enabled: false }] } } },
  args: {
    displayName: 'Acme Studios',
    username: 'acmestudios',
    avatarUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
    content: 'Just shipped a new Facebook integration. What do you think?',
  },
} satisfies Meta<typeof FacebookPreview>;
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

export const WithLongContent: Story = {
  args: {
    content:
      'When the day comes that AI replaces the social-media manager role, ' +
      'we will all look back fondly on the era of carefully-crafted captions ' +
      'and emoji-strewn posts that made up the early 2020s.',
  },
};

export const Editable: Story = { args: { editable: true } };
