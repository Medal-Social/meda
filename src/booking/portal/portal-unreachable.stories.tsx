import type { Meta, StoryObj } from '@storybook/react-vite';
import { DEMO_PHONE, demoFormatEn, demoFormatNb } from '../__stories__/fixtures.js';
import {
  portalUnreachableLabelsEn,
  portalUnreachableLabelsNb,
} from '../__stories__/labels.portal.js';
import {
  BookingColumn,
  bookingStoryParameters,
  SecondBrand,
} from '../__stories__/story-helpers.js';
import { bookingButtonClass } from '../internal/ui.js';
import { PortalUnreachable } from './portal-unreachable.js';

const meta: Meta<typeof PortalUnreachable> = {
  title: 'Booking/PortalUnreachable',
  component: PortalUnreachable,
  parameters: bookingStoryParameters,
  args: {
    labels: portalUnreachableLabelsNb,
    format: demoFormatNb,
    phone: DEMO_PHONE,
    retryHref: '/account',
    logout: (
      <button type="button" className={bookingButtonClass({ variant: 'outline' })}>
        Logg ut
      </button>
    ),
  },
  render: (args) => (
    <BookingColumn>
      <PortalUnreachable {...args} />
    </BookingColumn>
  ),
};
export default meta;

type Story = StoryObj<typeof PortalUnreachable>;

export const Default: Story = {};

/** English, with no number on file. */
export const English: Story = {
  args: {
    labels: portalUnreachableLabelsEn,
    format: demoFormatEn,
    phone: null,
    logout: (
      <button type="button" className={bookingButtonClass({ variant: 'outline' })}>
        Log out
      </button>
    ),
  },
};

export const SecondBrandTheme: Story = {
  name: 'Second brand',
  render: (args) => (
    <SecondBrand>
      <PortalUnreachable {...args} />
    </SecondBrand>
  ),
};
