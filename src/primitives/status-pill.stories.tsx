import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusPill } from './status-pill.js';

const meta = {
  title: 'Foundations/Primitives/StatusPill',
  component: StatusPill,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    tone: {
      control: 'select',
      options: ['neutral', 'info', 'success', 'warning', 'danger'],
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md'],
    },
    dot: { control: 'boolean' },
  },
} satisfies Meta<typeof StatusPill>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    tone: 'neutral',
    size: 'sm',
    children: 'Idle',
  },
};

export const Tones: Story = {
  render: () => (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill tone="neutral">Neutral</StatusPill>
        <StatusPill tone="info">Info</StatusPill>
        <StatusPill tone="success">Success</StatusPill>
        <StatusPill tone="warning">Warning</StatusPill>
        <StatusPill tone="danger">Danger</StatusPill>
      </div>
      <div className="flex items-center gap-3">
        <StatusPill tone="info" size="sm">
          Small
        </StatusPill>
        <StatusPill tone="info" size="md">
          Medium
        </StatusPill>
      </div>
    </div>
  ),
};

export const WithoutDot: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <StatusPill tone="success" dot={false}>
        Connected
      </StatusPill>
      <StatusPill tone="warning" dot={false}>
        Pending
      </StatusPill>
      <StatusPill tone="danger" dot={false}>
        Failed
      </StatusPill>
    </div>
  ),
};
