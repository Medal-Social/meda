import type { Meta, StoryObj } from '@storybook/react-vite';
import { NOW_MS } from '../__stories__/fixtures.js';
import { EventCard } from './event-card.js';

const meta = {
  title: 'Timeline/EventCard',
  component: EventCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ width: 240 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EventCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseEvent = {
  id: 'c1',
  startedAt: NOW_MS - 8 * 60 * 1000,
  endedAt: NOW_MS - 60_000,
  kind: 'session' as const,
  primary: 'Morpheus',
  secondary: '14 turns · $0.31',
};

export const Default: Story = { args: { event: baseEvent } };

export const Live: Story = {
  args: { event: { ...baseEvent, isLive: true, endedAt: undefined } },
};

export const Selected: Story = {
  args: { event: { ...baseEvent, selected: true } },
};

export const ErrorKind: Story = {
  args: {
    event: { ...baseEvent, kind: 'error', primary: 'Connection dropped', secondary: 'TLS' },
  },
};

export const Tiny: Story = {
  args: { event: { ...baseEvent, variant: 'tool-call' }, size: 'tiny' },
};
