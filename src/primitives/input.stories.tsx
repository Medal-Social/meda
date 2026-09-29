import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './input.js';

const meta = {
  title: 'Foundations/Primitives/Input',
  component: Input,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    'aria-label': 'Full name',
    placeholder: 'Full name',
  },
};

export const WithLabelAndError: Story = {
  render: () => (
    <div className="grid max-w-sm gap-4">
      <div className="grid gap-1.5">
        <label htmlFor="story-name" className="text-sm font-medium text-foreground">
          Parent name
        </label>
        <Input id="story-name" autoComplete="name" placeholder="Kari Nordmann" />
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="story-email" className="text-sm font-medium text-foreground">
          E-mail
        </label>
        <Input
          id="story-email"
          type="email"
          defaultValue="kari@"
          invalid
          aria-describedby="story-email-error"
        />
        <p id="story-email-error" className="text-xs text-destructive">
          Enter a valid e-mail address.
        </p>
      </div>
      <Input aria-label="Disabled" placeholder="Disabled" disabled />
    </div>
  ),
};
