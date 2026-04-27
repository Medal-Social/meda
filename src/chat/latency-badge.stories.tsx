import type { Meta, StoryObj } from '@storybook/react-vite';
import { LatencyBadge } from './latency-badge.js';

const meta = {
  title: 'Chat/LatencyBadge',
  component: LatencyBadge,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof LatencyBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const STT: Story = { args: { kind: 'stt', ms: 240 } };
export const Claude: Story = { args: { kind: 'claude', ms: 1400 } };
export const TTS: Story = { args: { kind: 'tts', ms: 380 } };
export const SubSecond: Story = { args: { kind: 'tts', ms: 80 } };
export const OverOneSecond: Story = { args: { kind: 'claude', ms: 2350 } };
