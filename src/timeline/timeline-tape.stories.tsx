import type { Meta, StoryObj } from '@storybook/react-vite';
import { NOW_MS, SAMPLE_EVENTS } from '../__stories__/fixtures.js';
import { TimelineTape } from './timeline-tape.js';

const meta = {
  title: 'Timeline/TimelineTape',
  component: TimelineTape,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ height: 600, width: 360, overflow: 'auto', borderRight: '1px solid #333' }}>
        <Story />
      </div>
    ),
  ],
  args: { now: new Date(NOW_MS), tz: 'UTC', events: SAMPLE_EVENTS },
} satisfies Meta<typeof TimelineTape>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = {
  args: { events: [] },
  parameters: {
    // The Empty story renders an intentionally empty tape inside the
    // story decorator's scrollable wrapper. With zero events there's no
    // focusable content for the scrollable-region-focusable axe rule;
    // every other (populated) tape story satisfies the rule via its
    // EventCard buttons. This is a fixture-only edge case, not a real
    // component a11y bug.
    a11y: { test: 'todo' },
  },
};
export const TightZoom: Story = { args: { pxPerSec: 0.4 } };
export const WideZoom: Story = { args: { pxPerSec: 3.2 } };
