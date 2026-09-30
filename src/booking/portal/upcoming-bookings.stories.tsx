import type { Meta, StoryObj } from '@storybook/react-vite';
import { DEMO_NOW, DEMO_PHONE, demoFormatEn, demoFormatNb } from '../__stories__/fixtures.js';
import { demoUpcoming } from '../__stories__/fixtures.portal.js';
import {
  upcomingBookingsLabelsEn,
  upcomingBookingsLabelsNb,
} from '../__stories__/labels.portal.js';
import {
  BookingColumn,
  bookingStoryParameters,
  SecondBrand,
} from '../__stories__/story-helpers.js';
import { UpcomingBookings } from './upcoming-bookings.js';

const SECOND_BRAND_HERO = { badge: 'bg-transparent px-0', heroMuted: 'text-primary-foreground' };

const meta: Meta<typeof UpcomingBookings> = {
  title: 'Booking/UpcomingBookings',
  component: UpcomingBookings,
  parameters: bookingStoryParameters,
  args: {
    bookings: demoUpcoming,
    phone: DEMO_PHONE,
    labels: upcomingBookingsLabelsNb,
    format: demoFormatNb,
    bookingHref: '/book',
    now: DEMO_NOW,
  },
  render: (args) => (
    <BookingColumn>
      <UpcomingBookings {...args} />
    </BookingColumn>
  ),
};
export default meta;

type Story = StoryObj<typeof UpcomingBookings>;

export const Default: Story = {};

/** English, with nothing booked. */
export const Empty: Story = {
  args: { bookings: [], labels: upcomingBookingsLabelsEn, format: demoFormatEn },
};

/**
 * The second brand's mid-luminance primary cannot carry the default tinted
 * hero lines at 4.5:1, so it takes the `badge` / `heroMuted` overrides.
 */
export const SecondBrandTheme: Story = {
  name: 'Second brand',
  args: { classNames: SECOND_BRAND_HERO },
  render: (args) => (
    <SecondBrand>
      <UpcomingBookings {...args} />
    </SecondBrand>
  ),
};
