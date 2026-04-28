import type { Meta, StoryObj } from '@storybook/react-vite';
import { VoiceOrb } from './voice-orb.js';

const meta = {
  title: 'Audio/VoiceOrb',
  component: VoiceOrb,
  tags: ['autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
} satisfies Meta<typeof VoiceOrb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { pressed: false, phase: 'idle', variant: 'aurora' },
};
