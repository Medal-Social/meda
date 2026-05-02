import type { Meta, StoryObj } from '@storybook/react-vite';
import { TelegramPreview } from '../platforms/telegram.js';

const meta = {
  title: 'post-preview/Telegram',
  component: TelegramPreview,
  // Platform previews replicate brand chrome at exact swatches; visual fidelity
  // is the goal so disable strict color-contrast on captions.
  parameters: { a11y: { config: { rules: [{ id: 'color-contrast', enabled: false }] } } },
  args: {
    displayName: 'Acme Studios',
    username: 'acmestudios',
    avatarUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
    content: 'Just shipped a new Telegram integration. What do you think?',
  },
} satisfies Meta<typeof TelegramPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithPoll: Story = {
  args: {
    content: '',
    poll: {
      question: 'Which platform should we ship next?',
      options: ['Threads', 'Bluesky', 'Mastodon'],
    },
  },
};

export const WithReplyMarkup: Story = {
  args: {
    pinMessage: true,
    replyMarkup: {
      inline_keyboard: [
        [
          { text: 'Visit site', url: 'https://example.com' },
          { text: 'Contact', url: 'https://example.com/contact' },
        ],
      ],
    },
  },
};

export const Editable: Story = { args: { editable: true } };
