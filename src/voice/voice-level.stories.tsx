import type { Meta, StoryObj } from '@storybook/react-vite';
import { VoiceLevel } from './voice-level.js';

const meta = {
  title: 'Voice/VoiceLevel',
  component: VoiceLevel,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof VoiceLevel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BarsLow: Story = { args: { level: 0.2, variant: 'bars' } };
export const BarsHigh: Story = { args: { level: 0.85, variant: 'bars' } };
export const Wave: Story = { args: { level: 0.6, variant: 'wave' } };
export const Ring: Story = { args: { level: 0.6, variant: 'ring' } };
