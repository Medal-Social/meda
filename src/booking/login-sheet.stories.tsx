import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { loginSheetLabelsEn, loginSheetLabelsNb } from './__stories__/labels.portal.js';
import { BookingColumn, bookingStoryParameters, SecondBrand } from './__stories__/story-helpers.js';
import type { LoginStartResult, LoginVerifyResult } from './login-panel.js';
import { LoginSheet } from './login-sheet.js';
import type { VippsStartState } from './vipps-button.js';

const start = async (): Promise<LoginStartResult> => ({ ok: true });
const verify = async (): Promise<LoginVerifyResult> => ({ ok: false, reason: 'invalid' });
const vipps = async (): Promise<VippsStartState> => null;

const meta: Meta<typeof LoginSheet> = {
  title: 'Booking/LoginSheet',
  component: LoginSheet,
  parameters: bookingStoryParameters,
  args: {
    labels: loginSheetLabelsNb,
    resumePath: '/book?resume=1',
    onStartLogin: start,
    onVerify: verify,
    onVipps: vipps,
    onSignedIn: () => undefined,
  },
  render: (args) => (
    <BookingColumn>
      <LoginSheet {...args} />
    </BookingColumn>
  ),
};
export default meta;

type Story = StoryObj<typeof LoginSheet>;

export const Default: Story = {};

/** Open, in English: the trigger opens the sheet, Escape closes it and focus returns. */
export const English: Story = {
  args: { labels: loginSheetLabelsEn },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: loginSheetLabelsEn['loginSheet.trigger'] });
    await userEvent.click(trigger);
    const body = within(canvasElement.ownerDocument.body);
    const dialog = body.getByRole('dialog', { name: loginSheetLabelsEn['login.heading'] });
    await expect(dialog).toHaveAttribute('open');
    await userEvent.keyboard('{Escape}');
    await expect(dialog).not.toHaveAttribute('open');
    await expect(trigger).toHaveFocus();
    await userEvent.click(trigger);
  },
};

export const SecondBrandTheme: Story = {
  name: 'Second brand',
  args: { trigger: false, vippsConfirm: { to: 'd•••@e•••.com' } },
  render: (args) => (
    <SecondBrand>
      <LoginSheet {...args} />
    </SecondBrand>
  ),
};
