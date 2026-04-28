import type { Meta, StoryObj } from '@storybook/react-vite';
import { VoiceStatusPill } from './voice-status-pill.js';

const meta = {
  title: 'Audio/VoiceStatusPill',
  component: VoiceStatusPill,
  tags: ['autodocs'],
} satisfies Meta<typeof VoiceStatusPill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { phase: 'idle' },
};
