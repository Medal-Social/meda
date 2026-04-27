import type { Meta, StoryObj } from '@storybook/react-vite';
import { VoiceOrb } from './voice-orb.js';

const meta = {
  title: 'Voice/VoiceOrb',
  component: VoiceOrb,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    chromatic: { delay: 300 }, // give R3F a moment to mount
  },
} satisfies Meta<typeof VoiceOrb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const IdleAurora: Story = {
  args: { pressed: false, phase: 'idle', variant: 'aurora' },
};
export const PressedAurora: Story = {
  args: { pressed: true, phase: 'listening', variant: 'aurora', level: 0.7 },
};
export const Thinking: Story = {
  args: { pressed: false, phase: 'thinking', variant: 'aurora' },
};
export const SpeakingMetal: Story = {
  args: { pressed: false, phase: 'speaking', variant: 'metal', outputLevel: 0.6 },
};
export const Disabled: Story = {
  args: { pressed: false, phase: 'idle', disabled: true, variant: 'aurora' },
};
