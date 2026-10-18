import type { Meta, StoryObj } from '@storybook/react-vite';
import { vippsLinkLabelsEn, vippsLinkLabelsNb } from '../__stories__/labels.portal-forms.js';
import {
  BookingColumn,
  bookingStoryParameters,
  SecondBrand,
} from '../__stories__/story-helpers.js';
import { VippsLinkRow } from './vipps-link-row.js';

const meta = {
  title: 'Booking/VippsLinkRow',
  component: VippsLinkRow,
  parameters: bookingStoryParameters,
  decorators: [
    (Story) => (
      <BookingColumn>
        <Story />
      </BookingColumn>
    ),
  ],
  args: {
    labels: vippsLinkLabelsNb,
    linked: false,
    flash: null,
    onStart: async () => ({ ok: false, reason: 'unavailable' }),
  },
} satisfies Meta<typeof VippsLinkRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const EnglishLinked: Story = {
  name: 'English, linked',
  args: { labels: vippsLinkLabelsEn, linked: true },
};

export const SecondBrandTheme: Story = {
  name: 'Second brand',
  args: { flash: 'link_conflict' },
  render: (args) => (
    <SecondBrand>
      <VippsLinkRow {...args} />
    </SecondBrand>
  ),
};
