import type { Meta, StoryObj } from '@storybook/react-vite';
import { InspectorJSON } from './inspector-json.js';

const meta = {
  title: 'Panel/InspectorJSON',
  component: InspectorJSON,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof InspectorJSON>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SimpleObject: Story = {
  args: {
    data: { id: 't1', speaker: 'user', text: 'Hello' },
  },
};

export const Nested: Story = {
  args: {
    data: {
      turn: { id: 't1', speaker: 'assistant' },
      latency: { sttMs: 240, claudeMs: 1400, ttsMs: 380 },
      toolCalls: [{ id: 'tc1', name: 'list_events', resultSummary: '3 events' }],
    },
  },
};

export const ArrayValues: Story = {
  args: { data: [1, 2, 'three', null, true] },
};

export const Empty: Story = {
  args: { data: {} },
};
