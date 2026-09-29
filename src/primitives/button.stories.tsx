import type { Meta, StoryObj } from '@storybook/react-vite';
import { CalendarPlus } from 'lucide-react';
import { Button } from './button.js';

const meta = {
  title: 'Foundations/Primitives/Button',
  component: Button,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'outline'],
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
    },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Book a session',
  },
};

export const VariantsAndSizes: Story = {
  render: () => (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm">
          <CalendarPlus aria-hidden="true" />
          Small
        </Button>
        <Button size="md">
          <CalendarPlus aria-hidden="true" />
          Medium
        </Button>
        <Button size="lg">
          <CalendarPlus aria-hidden="true" />
          Large
        </Button>
      </div>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button loading loadingLabel="Booking">
        Confirm booking
      </Button>
      <Button variant="outline" disabled>
        Fully booked
      </Button>
      <Button variant="outline" render={<a href="#booking" />}>
        Rendered as a link
      </Button>
    </div>
  ),
};
