import type { Meta, StoryObj } from '@storybook/react-vite';
import { WeekView } from '../week-view.js';
import { REFERENCE_MONTH, SAMPLE_EVENTS } from './fixtures.js';

const meta: Meta<typeof WeekView> = {
  title: 'Calendar/WeekView',
  component: WeekView,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof WeekView>;

export const Default: Story = {
  render: () => (
    <div className="p-6">
      <WeekView date={REFERENCE_MONTH} events={SAMPLE_EVENTS} />
    </div>
  ),
};

export const MondayStart: Story = {
  render: () => (
    <div className="p-6">
      <WeekView date={REFERENCE_MONTH} events={SAMPLE_EVENTS} weekStartsOn={1} />
    </div>
  ),
};
