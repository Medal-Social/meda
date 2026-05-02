import type { Meta, StoryObj } from '@storybook/react-vite';
import { LinkedInPreview } from '../platforms/linkedin.js';

const meta = {
  title: 'post-preview/LinkedIn',
  component: LinkedInPreview,
  // Platform previews replicate brand chrome at exact swatches; visual fidelity
  // is the goal so disable strict color-contrast on captions.
  parameters: { a11y: { config: { rules: [{ id: 'color-contrast', enabled: false }] } } },
  args: {
    displayName: 'Acme Studios',
    username: 'Building software · 2nd',
    avatarUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
    content: 'Just shipped a new LinkedIn integration. What do you think?',
  },
} satisfies Meta<typeof LinkedInPreview>;
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

export const WithMentions: Story = {
  args: {
    content: 'Big thanks to Jane Doe for shipping this!',
    mentions: [{ offset: 14, length: 8, urn: 'urn:li:person:abc123', name: 'Jane Doe' }],
  },
};
