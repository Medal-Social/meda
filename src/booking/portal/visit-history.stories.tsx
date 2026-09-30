import type { Meta, StoryObj } from '@storybook/react-vite';
import { demoFormatEn, demoFormatNb } from '../__stories__/fixtures.js';
import { demoPast } from '../__stories__/fixtures.portal.js';
import { visitHistoryLabelsEn, visitHistoryLabelsNb } from '../__stories__/labels.portal.js';
import {
  BookingColumn,
  bookingStoryParameters,
  SecondBrand,
} from '../__stories__/story-helpers.js';
import { VisitHistory } from './visit-history.js';

const meta: Meta<typeof VisitHistory> = {
  title: 'Booking/VisitHistory',
  component: VisitHistory,
  parameters: bookingStoryParameters,
  args: { past: demoPast, labels: visitHistoryLabelsNb, format: demoFormatNb },
  render: (args) => (
    <BookingColumn>
      <VisitHistory {...args} />
    </BookingColumn>
  ),
};
export default meta;

type Story = StoryObj<typeof VisitHistory>;

export const Default: Story = {};

export const English: Story = {
  args: { labels: visitHistoryLabelsEn, format: demoFormatEn },
};

export const SecondBrandTheme: Story = {
  name: 'Second brand',
  render: (args) => (
    <SecondBrand>
      <VisitHistory {...args} />
    </SecondBrand>
  ),
};
