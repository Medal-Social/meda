import type { Meta, StoryObj } from '@storybook/react-vite';
import { NOW_MS, SAMPLE_TURNS } from '../__stories__/fixtures.js';
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

const userTurn = SAMPLE_TURNS[0];
const assistantTurn = SAMPLE_TURNS[1];
const toolTurn = SAMPLE_TURNS[3];

export const User: Story = userTurn ? { args: { turn: userTurn } } : {};
export const Assistant: Story = assistantTurn ? { args: { turn: assistantTurn } } : {};
export const Streaming: Story = assistantTurn
  ? {
      args: { turn: { ...assistantTurn, streaming: true } },
    }
  : {};
export const WithToolCall: Story = toolTurn ? { args: { turn: toolTurn } } : {};
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
