import type { Meta, StoryObj } from '@storybook/react-vite';
import { demoRebook, demoRebookHref } from '../__stories__/fixtures.portal.js';
import { rebookCardsLabelsEn, rebookCardsLabelsNb } from '../__stories__/labels.portal.js';
import {
  BookingColumn,
  bookingStoryParameters,
  SecondBrand,
} from '../__stories__/story-helpers.js';
import { RebookCards } from './rebook-cards.js';

const meta: Meta<typeof RebookCards> = {
  title: 'Booking/RebookCards',
  component: RebookCards,
  parameters: bookingStoryParameters,
  args: { suggestions: demoRebook, hrefFor: demoRebookHref, labels: rebookCardsLabelsNb },
  render: (args) => (
    <BookingColumn>
      <RebookCards {...args} />
    </BookingColumn>
  ),
};
export default meta;

type Story = StoryObj<typeof RebookCards>;

export const Default: Story = {};

/** English, for a new user with nothing to rebook. */
export const Empty: Story = {
  args: { suggestions: [], labels: rebookCardsLabelsEn },
};

export const SecondBrandTheme: Story = {
  name: 'Second brand',
  render: (args) => (
    <SecondBrand>
      <RebookCards {...args} />
    </SecondBrand>
  ),
};
