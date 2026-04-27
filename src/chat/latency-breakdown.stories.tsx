import type { Meta, StoryObj } from '@storybook/react-vite';
import { LatencyBreakdown } from './latency-breakdown.js';

const meta = {
  title: 'Chat/LatencyBreakdown',
  component: LatencyBreakdown,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof LatencyBreakdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { sttMs: 240, claudeMs: 1400, ttsMs: 380 },
};

export const NoLegend: Story = {
  args: { sttMs: 240, claudeMs: 1400, ttsMs: 380, showLegend: false },
};

export const ClaudeDominant: Story = {
  args: { sttMs: 90, claudeMs: 4200, ttsMs: 220 },
};

export const Zero: Story = {
  args: { sttMs: 0, claudeMs: 0, ttsMs: 0 },
};
