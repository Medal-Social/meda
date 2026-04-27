import type { Meta, StoryObj } from '@storybook/react-vite';
import { ToolCallBlock } from './tool-call-block.js';

const meta = {
  title: 'Chat/ToolCallBlock',
  component: ToolCallBlock,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ToolCallBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    call: {
      id: 'tc1',
      name: 'list_events',
      args: { date: '2026-04-26', tz: 'Europe/Stockholm' },
      resultSummary: '3 events',
      latencyMs: 92,
    },
  },
};

export const NoArgs: Story = {
  args: { call: { id: 'tc2', name: 'sync_state', args: {}, resultSummary: 'ok' } },
};

export const NoResult: Story = {
  args: {
    call: { id: 'tc3', name: 'cancel_event', args: { eventId: 'evt_42' } },
  },
};
