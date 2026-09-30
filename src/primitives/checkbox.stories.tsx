import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from './checkbox.js';

const meta = {
  title: 'Foundations/Primitives/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    'aria-label': 'Accept the terms',
  },
};

export const WithLabels: Story = {
  render: () => (
    <div className="grid max-w-sm gap-4 text-sm">
      <div className="flex items-start gap-3">
        <Checkbox id="story-terms" invalid aria-describedby="story-terms-error" />
        <div className="grid gap-1">
          <label htmlFor="story-terms" className="cursor-pointer">
            I accept the booking terms
          </label>
          <p id="story-terms-error" className="text-destructive">
            Tick the box to continue.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Checkbox id="story-news" defaultChecked />
        <label htmlFor="story-news" className="cursor-pointer">
          Send me news and offers by e-mail
        </label>
      </div>
      <div className="flex items-center gap-3">
        <Checkbox id="story-off" disabled />
        <label htmlFor="story-off">Disabled</label>
      </div>
    </div>
  ),
};
