import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { NOW_MS } from '../__stories__/fixtures.js';
import { DateSwitcher } from './date-switcher.js';

const meta = {
  title: 'Timeline/DateSwitcher',
  component: DateSwitcher,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DateSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Today: Story = {
  args: { value: new Date(NOW_MS), now: new Date(NOW_MS), tz: 'UTC', onChange: () => {} },
};

export const PastDay: Story = {
  args: {
    value: new Date(NOW_MS - 24 * 60 * 60 * 1000),
    now: new Date(NOW_MS),
    tz: 'UTC',
    onChange: () => {},
  },
};

export const Interactive: Story = {
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return <DateSwitcher {...args} value={value} onChange={setValue} />;
  },
  args: { value: new Date(NOW_MS), now: new Date(NOW_MS), tz: 'UTC', onChange: () => {} },
};
