import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { SAMPLE_MARKS } from '../__stories__/fixtures.js';
import { ScrubBar } from './scrub-bar.js';

const meta = {
  title: 'Timeline/ScrubBar',
  component: ScrubBar,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ width: 640 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ScrubBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { durationMs: 180_000, positionMs: 90_000, marks: SAMPLE_MARKS, onSeek: () => {} },
};

export const Live: Story = {
  args: {
    durationMs: 180_000,
    positionMs: 178_000,
    isLive: true,
    marks: SAMPLE_MARKS,
    onSeek: () => {},
  },
};

export const WithTransport: Story = {
  render: (args) => {
    const [pos, setPos] = useState(args.positionMs);
    const [playing, setPlaying] = useState(false);
    return (
      <ScrubBar
        {...args}
        positionMs={pos}
        onSeek={setPos}
        isPlaying={playing}
        onPlayPause={() => setPlaying((p) => !p)}
        onSkipBack={() => setPos((p) => Math.max(0, p - 5_000))}
        onSkipForward={() => setPos((p) => Math.min(args.durationMs, p + 5_000))}
      />
    );
  },
  args: { durationMs: 180_000, positionMs: 90_000, marks: SAMPLE_MARKS, onSeek: () => {} },
};
