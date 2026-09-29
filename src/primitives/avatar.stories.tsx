import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from './avatar.js';

const meta = {
  title: 'Foundations/Primitives/Avatar',
  component: Avatar,
  args: {
    name: 'Ada Lovelace',
  },
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Initials: Story = {
  args: {
    name: 'Kari Nordmann',
    size: 'md',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar name="Ada Lovelace" size="sm" />
      <Avatar name="Ada Lovelace" size="md" />
      <Avatar name="Ada Lovelace" size="lg" />
    </div>
  ),
};

export const BrokenImageFallback: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar name="Grace Hopper" src="/this-image-does-not-exist.png" />
      <Avatar name="Åse Øien" />
      <Avatar name="Cool Kids" initials="C" />
    </div>
  ),
};
