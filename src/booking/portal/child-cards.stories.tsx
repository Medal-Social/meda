import type { Meta, StoryObj } from '@storybook/react-vite';
import { demoFormatEn, demoFormatNb } from '../__stories__/fixtures.js';
import { demoKids, demoRebookHref, demoStylistNames } from '../__stories__/fixtures.portal.js';
import { childCardsLabelsEn, childCardsLabelsNb } from '../__stories__/labels.portal.js';
import {
  BookingColumn,
  bookingStoryParameters,
  SecondBrand,
} from '../__stories__/story-helpers.js';
import type { ChildSummary } from '../types.js';
import { ChildCards } from './child-cards.js';

const hrefFor = (kid: ChildSummary) =>
  demoRebookHref({
    serviceId: kid.serviceId,
    resourceId: kid.preferredResourceId ?? kid.resourceId,
  });

const meta: Meta<typeof ChildCards> = {
  title: 'Booking/ChildCards',
  component: ChildCards,
  parameters: bookingStoryParameters,
  args: {
    kids: demoKids,
    hrefFor,
    stylistNames: demoStylistNames,
    labels: childCardsLabelsNb,
    format: demoFormatNb,
  },
  render: (args) => (
    <BookingColumn>
      <ChildCards {...args} />
    </BookingColumn>
  ),
};
export default meta;

type Story = StoryObj<typeof ChildCards>;

export const Default: Story = {};

/** English, as the overview's compact rows. */
export const Compact: Story = {
  args: { variant: 'compact', labels: childCardsLabelsEn, format: demoFormatEn },
};

export const SecondBrandTheme: Story = {
  name: 'Second brand',
  render: (args) => (
    <SecondBrand>
      <ChildCards {...args} />
    </SecondBrand>
  ),
};
