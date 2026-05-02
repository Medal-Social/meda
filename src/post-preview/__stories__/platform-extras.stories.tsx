import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  type DiscordEmbedDraft,
  DiscordPreview,
  type LinkedInMentionData,
  LinkedInPreview,
  type TelegramPollState,
  TelegramPreview,
} from '../platforms/index.js';
import { BASE_FIXTURE } from './fixtures.js';

const meta: Meta = {
  title: 'post-preview / Platform Extras',
  parameters: { a11y: { config: { rules: [{ id: 'color-contrast', enabled: false }] } } },
};
export default meta;
type Story = StoryObj;

const POLL: TelegramPollState = {
  question: 'Which feature should ship next?',
  options: ['Calendar', 'Email builder', 'Workflow editor', 'All three (the right answer)'],
  multiple: false,
};

const EMBEDS: DiscordEmbedDraft[] = [
  {
    title: 'Release v2.1',
    description: 'New post previews surface, performance improvements, and a fresh CLI.',
    color: 0x5865f2,
    url: 'https://example.com/release',
    fields: [
      { name: 'Status', value: 'Stable', inline: true },
      { name: 'Downloads', value: '1.2k', inline: true },
    ],
    footerText: 'Released today',
  },
];

export const TelegramWithPoll: Story = {
  render: () => (
    <TelegramPreview {...BASE_FIXTURE} content="Help us prioritize 👇" poll={POLL} pinMessage />
  ),
};

export const DiscordWithEmbed: Story = {
  render: () => (
    <DiscordPreview {...BASE_FIXTURE} content="See the release notes:" embeds={EMBEDS} />
  ),
};

export const LinkedInWithMentionPicker: Story = {
  render: () => {
    const [content, setContent] = useState('Excited to share that @');
    return (
      <LinkedInPreview
        {...BASE_FIXTURE}
        editable
        content={content}
        onContentChange={setContent}
        renderMentionPicker={({ query, onPick, onCancel }) => (
          <div className="mt-2 rounded border bg-popover p-2 text-sm shadow">
            <div className="mb-1 text-muted-foreground text-xs">
              Showing matches for &quot;{query}&quot;
            </div>
            {(['Alex Chen', 'Bobbie Park', 'Carlos Diaz'] as const).map((name) => (
              <button
                key={name}
                type="button"
                className="block w-full rounded px-2 py-1 text-left hover:bg-accent"
                onClick={() =>
                  onPick({
                    offset: content.length - 1,
                    length: name.length + 1,
                    urn: `urn:li:person:${name}`,
                    name,
                  } satisfies LinkedInMentionData)
                }
              >
                {name}
              </button>
            ))}
            <button
              type="button"
              className="mt-1 block w-full rounded px-2 py-1 text-left text-muted-foreground text-xs hover:bg-accent"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        )}
      />
    );
  },
};
