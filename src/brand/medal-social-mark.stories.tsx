import type { Meta, StoryObj } from '@storybook/react-vite';
import { MedalSocialMark } from './medal-social-mark.js';

const meta = {
  title: 'Brand/MedalSocialMark',
  component: MedalSocialMark,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    title: 'Medal Social',
    style: { width: 96, height: 96 },
  },
} satisfies Meta<typeof MedalSocialMark>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
