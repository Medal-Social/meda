import type { Meta, StoryObj } from '@storybook/react-vite';
import { summaryBarLabelsEn, summaryBarLabelsNb } from './__stories__/labels.details.js';
import { BookingColumn, bookingStoryParameters, SecondBrand } from './__stories__/story-helpers.js';
import { SummaryBar } from './summary-bar.js';

const meta = {
  title: 'Booking/SummaryBar',
  component: SummaryBar,
  parameters: bookingStoryParameters,
  decorators: [
    (Story) => (
      <BookingColumn>
        <Story />
      </BookingColumn>
    ),
  ],
  args: {
    line: '',
    canAdvance: false,
    step: 'who',
    onNext: () => undefined,
    labels: summaryBarLabelsNb,
  },
} satisfies Meta<typeof SummaryBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const English: Story = {
  args: {
    line: 'Kids’ cut · Ada Demo · Thursday 15:00 · £39',
    canAdvance: true,
    step: 'when',
    labels: summaryBarLabelsEn,
  },
};

export const SecondBrandTheme: Story = {
  name: 'Second brand',
  args: {
    line: 'Barneklipp · Ada Demo · torsdag 15:00 · 390 kr',
    canAdvance: true,
    step: 'when',
  },
  render: (args) => (
    <SecondBrand>
      <SummaryBar {...args} />
    </SecondBrand>
  ),
};
