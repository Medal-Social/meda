import type { Meta, StoryObj } from '@storybook/react-vite';
import { NOW_MS } from '../__stories__/fixtures.js';
import { TurnCard } from './turn-card.js';

const meta = {
  title: 'Chat/TurnCard',
  component: TurnCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { startedAtRef: NOW_MS - 60_000, tz: 'UTC' },
} satisfies Meta<typeof TurnCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const User: Story = {
  args: {
    turn: {
      id: 't1',
      speaker: 'user',
      text: 'What time is my next call?',
      startedAt: NOW_MS - 60_000,
    },
  },
};

export const Assistant: Story = {
  args: {
    turn: {
      id: 't2',
      speaker: 'assistant',
      speakerLabel: 'Morpheus',
      modelLabel: 'claude-opus-4-7',
      text: 'Your next call is at 16:00 with the design team.',
      startedAt: NOW_MS - 50_000,
      latency: { sttMs: 240, claudeMs: 1400, ttsMs: 380 },
    },
  },
};

export const Streaming: Story = {
  args: {
    turn: {
      id: 't3',
      speaker: 'assistant',
      speakerLabel: 'Morpheus',
      text: 'Your next call is at 16:00',
      startedAt: NOW_MS - 5_000,
      streaming: true,
    },
  },
};

export const WithToolCall: Story = {
  args: {
    turn: {
      id: 't4',
      speaker: 'assistant',
      speakerLabel: 'Morpheus',
      text: 'Cancelled. I let the team know.',
      startedAt: NOW_MS - 10_000,
      latency: { sttMs: 210, claudeMs: 1100, ttsMs: 320 },
      toolCalls: [
        {
          id: 'tc1',
          name: 'cancel_event',
          args: { eventId: 'evt_42' },
          resultSummary: 'cancelled',
          latencyMs: 92,
        },
      ],
    },
  },
};

export const SystemMessage: Story = {
  args: {
    turn: {
      id: 'sys1',
      speaker: 'system',
      text: 'Connection re-established.',
      startedAt: NOW_MS - 5_000,
    },
  },
};
