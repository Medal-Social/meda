import type { Meta, StoryObj } from '@storybook/react-vite';
import { MonthView } from '../month-view.js';
import { REFERENCE_MONTH, SAMPLE_EVENTS } from './fixtures.js';

const meta: Meta<typeof MonthView> = {
  title: 'Data Views/Calendar/MonthView',
  component: MonthView,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof MonthView>;

export const Default: Story = {
  render: () => (
    <div className="p-6">
      <MonthView date={REFERENCE_MONTH} events={SAMPLE_EVENTS} />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div className="p-6">
      <MonthView date={REFERENCE_MONTH} events={[]} />
    </div>
  ),
};
