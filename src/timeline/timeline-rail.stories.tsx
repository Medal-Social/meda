import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { NOW_MS, SAMPLE_EVENTS } from '../__stories__/fixtures.js';
import { TimelineRail } from './timeline-rail.js';

const meta = {
  title: 'Timeline/TimelineRail',
  component: TimelineRail,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ height: 720, width: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TimelineRail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    date: new Date(NOW_MS),
    now: new Date(NOW_MS),
    events: SAMPLE_EVENTS,
    tz: 'UTC',
  },
};

export const Interactive: Story = {
  render: (args) => {
    const [zoom, setZoom] = useState(1.2);
    return <TimelineRail {...args} zoom={zoom} onZoomChange={setZoom} />;
  },
  args: {
    date: new Date(NOW_MS),
    now: new Date(NOW_MS),
    events: SAMPLE_EVENTS,
    tz: 'UTC',
  },
};
