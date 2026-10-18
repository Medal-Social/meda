import type { Meta, StoryObj } from '@storybook/react-vite';
import { vippsButtonLabelsEn, vippsButtonLabelsNb } from './__stories__/labels.portal.js';
import { BookingColumn, bookingStoryParameters, SecondBrand } from './__stories__/story-helpers.js';
import { VippsButton, type VippsStartState } from './vipps-button.js';

const unavailable = async (): Promise<VippsStartState> => ({ ok: false, reason: 'unavailable' });

const meta: Meta<typeof VippsButton> = {
  title: 'Booking/VippsButton',
  component: VippsButton,
  parameters: bookingStoryParameters,
  args: { labels: vippsButtonLabelsNb, onVipps: unavailable, next: '/book?resume=1' },
  render: (args) => (
    <BookingColumn>
      <VippsButton {...args} />
    </BookingColumn>
  ),
};
export default meta;

type Story = StoryObj<typeof VippsButton>;

export const Default: Story = {};

export const English: Story = {
  args: { labels: vippsButtonLabelsEn, label: 'Continue with Vipps' },
};

export const SecondBrandTheme: Story = {
  name: 'Second brand',
  render: (args) => (
    <SecondBrand>
      <VippsButton {...args} />
    </SecondBrand>
  ),
};
