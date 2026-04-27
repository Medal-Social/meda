import type { Meta, StoryObj } from '@storybook/react-vite';
import { VoiceStatusPill } from './voice-status-pill.js';

const meta = {
  title: 'Voice/VoiceStatusPill',
  component: VoiceStatusPill,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof VoiceStatusPill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = { args: { phase: 'idle' } };
export const Listening: Story = { args: { phase: 'listening' } };
export const Thinking: Story = { args: { phase: 'thinking', thinkingForMs: 2400 } };
export const Speaking: Story = { args: { phase: 'speaking' } };
export const ErrorState: Story = { args: { phase: 'error' } };
