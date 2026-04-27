import type { Meta, StoryObj } from '@storybook/react-vite';
import { NOW_MS } from '../__stories__/fixtures.js';
import { LiveIndicator } from './live-indicator.js';

const meta = {
  title: 'Timeline/LiveIndicator',
  component: LiveIndicator,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ width: 320, paddingTop: 40 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LiveIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { now: new Date(NOW_MS), tz: 'UTC' } };
