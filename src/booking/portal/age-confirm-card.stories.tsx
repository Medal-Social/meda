import type { Meta, StoryObj } from '@storybook/react-vite';
import { demoFormatEn, demoFormatNb } from '../__stories__/fixtures.js';
import { ageConfirmLabelsEn, ageConfirmLabelsNb } from '../__stories__/labels.portal-forms.js';
import {
  BookingColumn,
  bookingStoryParameters,
  SecondBrand,
} from '../__stories__/story-helpers.js';
import { AgeConfirmCard } from './age-confirm-card.js';

const monthsNb = Array.from({ length: 12 }, (_, i) => demoFormatNb.clock.monthName(i + 1));
const monthsEn = Array.from({ length: 12 }, (_, i) => demoFormatEn.clock.monthName(i + 1));

const meta = {
  title: 'Booking/AgeConfirmCard',
  component: AgeConfirmCard,
  parameters: bookingStoryParameters,
  decorators: [
    (Story) => (
      <BookingColumn>
        <Story />
      </BookingColumn>
    ),
  ],
  args: {
    labels: ageConfirmLabelsNb,
    name: 'Nora',
    birthYear: '2021',
    years: [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018],
    months: monthsNb,
    busy: false,
    error: null,
    onConfirm: () => undefined,
    onDismiss: () => undefined,
  },
} satisfies Meta<typeof AgeConfirmCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const English: Story = {
  args: {
    labels: ageConfirmLabelsEn,
    months: monthsEn,
    name: 'Alex',
    birthYear: '2019',
  },
};

export const SecondBrandTheme: Story = {
  name: 'Second brand',
  render: (args) => (
    <SecondBrand>
      <AgeConfirmCard {...args} />
    </SecondBrand>
  ),
};
