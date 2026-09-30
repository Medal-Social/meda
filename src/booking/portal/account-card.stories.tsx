import type { Meta, StoryObj } from '@storybook/react-vite';
import { demoProfile } from '../__stories__/fixtures.portal.js';
import {
  BookingColumn,
  bookingStoryParameters,
  SecondBrand,
} from '../__stories__/story-helpers.js';
import { AccountCard } from './account-card.js';

const meta: Meta<typeof AccountCard> = {
  title: 'Booking/AccountCard',
  component: AccountCard,
  parameters: bookingStoryParameters,
  args: { profile: demoProfile },
  render: (args) => (
    <BookingColumn>
      <AccountCard {...args} />
    </BookingColumn>
  ),
};
export default meta;

type Story = StoryObj<typeof AccountCard>;

export const Default: Story = {};

/** The sidebar's card: name and number only. */
export const Compact: Story = { args: { compact: true } };

export const SecondBrandTheme: Story = {
  name: 'Second brand',
  render: (args) => (
    <SecondBrand>
      <AccountCard {...args} />
    </SecondBrand>
  ),
};
