import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { otpSlotsLabelsEn, otpSlotsLabelsNb } from './__stories__/labels.portal.js';
import { BookingColumn, bookingStoryParameters, SecondBrand } from './__stories__/story-helpers.js';
import { OtpSlots, type OtpSlotsProps } from './otp-slots.js';

function Controlled(props: Omit<OtpSlotsProps, 'onChange'>) {
  const [value, setValue] = useState(props.value);
  return <OtpSlots {...props} value={value} onChange={setValue} />;
}

const meta: Meta<typeof OtpSlots> = {
  title: 'Booking/OtpSlots',
  component: OtpSlots,
  parameters: bookingStoryParameters,
  args: { labels: otpSlotsLabelsNb, value: '492', onChange: () => undefined },
  render: (args) => (
    <BookingColumn>
      <Controlled {...args} />
    </BookingColumn>
  ),
};
export default meta;

type Story = StoryObj<typeof OtpSlots>;

export const Default: Story = {};

/** English, typed from the real keyboard: digits, Backspace, and an arrow key. */
export const English: Story = {
  args: { labels: otpSlotsLabelsEn, value: '' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText(otpSlotsLabelsEn['otp.label']);
    await userEvent.click(input);
    await userEvent.keyboard('4921');
    await expect(input).toHaveValue('4921');
    await userEvent.keyboard('{Backspace}');
    await expect(input).toHaveValue('492');
    await userEvent.keyboard('{ArrowLeft}');
    const slots = canvasElement.querySelectorAll('[data-slot=otp-slot]');
    await expect(slots[2]).toHaveAttribute('data-active');
  },
};

export const SecondBrandTheme: Story = {
  name: 'Second brand',
  args: { invalid: true, value: '000000' },
  render: (args) => (
    <SecondBrand>
      <Controlled {...args} />
    </SecondBrand>
  ),
};
