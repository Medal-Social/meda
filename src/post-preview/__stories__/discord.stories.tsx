import type { Meta, StoryObj } from '@storybook/react-vite';
import { DiscordPreview } from '../platforms/discord.js';

const meta = {
  title: 'post-preview/Discord',
  component: DiscordPreview,
  // Platform previews replicate brand chrome at exact swatches; visual fidelity
  // is the goal so disable strict color-contrast on captions.
  parameters: { a11y: { config: { rules: [{ id: 'color-contrast', enabled: false }] } } },
  args: {
    displayName: 'Acme Studios',
    username: 'acmestudios',
    avatarUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
    content: 'Just shipped a new Discord integration. What do you think?',
  },
} satisfies Meta<typeof DiscordPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithEmbed: Story = {
  args: {
    embeds: [
      {
        title: 'Meda v2 release notes',
        description: 'New post-preview surface ships with five platforms plus per-platform extras.',
        color: 0x5865f2,
        url: 'https://example.com/release-notes',
      },
    ],
  },
};

export const Editable: Story = { args: { editable: true } };
