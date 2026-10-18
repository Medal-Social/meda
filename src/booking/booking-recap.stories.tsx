import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { demoFormatEn, demoFormatNb } from './__stories__/fixtures.js';
import { bookingRecapLabelsEn, bookingRecapLabelsNb } from './__stories__/labels.details.js';
import { BookingColumn, bookingStoryParameters } from './__stories__/story-helpers.js';
import { BookingRecap, type BookingRecapProps } from './booking-recap.js';

/** Thursday 17 September 2026, 15:00 Oslo. */
const START = Date.UTC(2026, 8, 17, 13);
const HALF_HOUR = 30 * 60_000;

function Demo(props: BookingRecapProps) {
  return (
    <BookingColumn>
      <BookingRecap {...props} />
    </BookingColumn>
  );
}

const meta = {
  title: 'Booking/BookingRecap',
  component: Demo,
  parameters: bookingStoryParameters,
  args: {
    lines: [
      {
        startTs: START,
        endTs: START + HALF_HOUR,
        services: ['Barneklipp'],
        stylist: { name: 'Ada Demo' },
      },
    ],
    totalOre: 39_000,
    format: demoFormatNb,
    labels: bookingRecapLabelsNb,
    onEdit: fn(),
    // «Første ledige» resolved to Ada while Bo was free at the same minute.
    alternatives: [{ resourceId: 'res-bo', name: 'Bo Eksempel (Demo)' }],
    onSwap: fn(),
  },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Family: Story = {
  args: {
    alternatives: [],
    lines: [
      {
        startTs: START,
        endTs: START + HALF_HOUR,
        services: ['Barneklipp'],
        stylist: { name: 'Ada Demo' },
        who: 'Mia',
      },
      {
        startTs: START,
        endTs: START + 2 * HALF_HOUR,
        services: ['Klipp', 'Skjegg'],
        stylist: { name: 'Bo Eksempel (Demo)' },
        who: 'Deg',
      },
    ],
    totalOre: 99_000,
  },
};

export const English: Story = {
  args: {
    format: demoFormatEn,
    labels: bookingRecapLabelsEn,
  },
};
