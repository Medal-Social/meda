import type { Meta, StoryObj } from '@storybook/react-vite';
import { loginPanelLabelsEn, loginPanelLabelsNb } from './__stories__/labels.portal.js';
import { BookingColumn, bookingStoryParameters, SecondBrand } from './__stories__/story-helpers.js';
import { LoginPanel, type LoginStartResult, type LoginVerifyResult } from './login-panel.js';
import type { VippsStartState } from './vipps-button.js';

const start = async (): Promise<LoginStartResult> => ({ ok: true });
const verify = async (): Promise<LoginVerifyResult> => ({ ok: false, reason: 'invalid' });
const vipps = async (): Promise<VippsStartState> => null;

const meta: Meta<typeof LoginPanel> = {
  title: 'Booking/LoginPanel',
  component: LoginPanel,
  parameters: bookingStoryParameters,
  args: {
    labels: loginPanelLabelsNb,
    onStartLogin: start,
    onVerify: verify,
    onSignedIn: () => undefined,
    onVipps: vipps,
    heading: (text: string) => <h1 className="font-sans text-2xl font-bold">{text}</h1>,
  },
  render: (args) => (
    <BookingColumn>
      <LoginPanel {...args} />
    </BookingColumn>
  ),
};
export default meta;

type Story = StoryObj<typeof LoginPanel>;

export const Default: Story = {};

/** English, on the code step of a Vipps confirm. */
export const English: Story = {
  args: { labels: loginPanelLabelsEn, vippsConfirm: { to: 'd•••@e•••.com' } },
};

export const SecondBrandTheme: Story = {
  name: 'Second brand',
  render: (args) => (
    <SecondBrand>
      <LoginPanel {...args} />
    </SecondBrand>
  ),
};
