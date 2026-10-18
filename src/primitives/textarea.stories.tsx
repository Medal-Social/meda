import type { Meta, StoryObj } from '@storybook/react-vite';
import { Textarea } from './textarea.js';

const meta = {
  title: 'Foundations/Primitives/Textarea',
  component: Textarea,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    'aria-label': 'Note to the stylist',
    placeholder: 'Anything we should know?',
    rows: 3,
  },
};

export const Invalid: Story = {
  render: () => (
    <div className="grid max-w-sm gap-1.5">
      <label htmlFor="story-note" className="text-sm font-medium text-foreground">
        Note
      </label>
      <Textarea id="story-note" invalid aria-describedby="story-note-error" defaultValue="…" />
      <p id="story-note-error" className="text-sm text-destructive">
        Keep it under 500 characters.
      </p>
    </div>
  ),
};
