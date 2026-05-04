import type { Meta, StoryObj } from '@storybook/react-vite';
import { AlertTriangle, Inbox } from 'lucide-react';
import { EmptyState } from './empty-state.js';

const meta = {
  title: 'Foundations/Primitives/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    action: { table: { disable: true } },
    icon: { table: { disable: true } },
    variant: {
      control: 'select',
      options: ['default', 'panel', 'inline'],
    },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;

type Story = StoryObj<typeof meta>;

const primaryAction = (
  <button
    type="button"
    className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
  >
    Compose
  </button>
);

const secondaryAction = (
  <button type="button" className="rounded-md border border-border px-3 py-2 text-sm">
    Retry
  </button>
);

export const Default: Story = {
  args: {
    variant: 'default',
    title: 'No messages',
    description: 'New conversations will appear here.',
  },
  render: (args) => (
    <div className="max-w-md rounded-md border border-border">
      <EmptyState {...args} icon={Inbox} action={primaryAction} />
    </div>
  ),
};

export const Panel: Story = {
  args: {
    variant: 'panel',
    title: 'Could not load',
    description: 'Refresh the panel and try again.',
  },
  render: (args) => (
    <div className="max-w-md rounded-md border border-border">
      <EmptyState {...args} icon={AlertTriangle} action={secondaryAction} />
    </div>
  ),
};

export const Inline: Story = {
  args: {
    variant: 'inline',
    title: 'No filters selected',
    description: 'Choose filters to narrow the list.',
  },
  render: (args) => (
    <div className="max-w-md rounded-md border border-border">
      <EmptyState {...args} />
    </div>
  ),
};
