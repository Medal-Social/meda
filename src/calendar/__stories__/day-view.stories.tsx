import type { Meta, StoryObj } from '@storybook/react-vite';
import { DayView } from '../day-view.js';
import { REFERENCE_MONTH, SAMPLE_EVENTS } from './fixtures.js';

const meta: Meta<typeof DayView> = {
  title: 'Calendar/DayView',
  component: DayView,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof DayView>;

export const Default: Story = {
  render: () => (
    <div className="p-6">
      <DayView date={REFERENCE_MONTH} events={SAMPLE_EVENTS} />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div className="p-6">
      <DayView date={REFERENCE_MONTH} events={[]} />
    </div>
  ),
};
