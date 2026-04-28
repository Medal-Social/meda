import type { Meta, StoryObj } from '@storybook/react-vite';
import { VoiceLevel } from './voice-level.js';

const meta = {
  title: 'Audio/VoiceLevel',
  component: VoiceLevel,
  tags: ['autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
} satisfies Meta<typeof VoiceLevel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { level: 0.6, variant: 'ring' },
};
