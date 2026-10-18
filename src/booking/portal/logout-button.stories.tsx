import type { Meta, StoryObj } from '@storybook/react-vite';
import { logoutLabelsEn, logoutLabelsNb } from '../__stories__/labels.portal-forms.js';
import {
  BookingColumn,
  bookingStoryParameters,
  SecondBrand,
} from '../__stories__/story-helpers.js';
import { LogoutButton } from './logout-button.js';

const meta = {
  title: 'Booking/LogoutButton',
  component: LogoutButton,
  parameters: bookingStoryParameters,
  decorators: [
    (Story) => (
      <BookingColumn>
        <Story />
      </BookingColumn>
    ),
  ],
  args: {
    labels: logoutLabelsNb,
    onLogout: async () => ({ ok: false, message: '' }),
  },
} satisfies Meta<typeof LogoutButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const English: Story = {
  args: { labels: logoutLabelsEn },
};

export const SecondBrandTheme: Story = {
  name: 'Second brand',
  render: (args) => (
    <SecondBrand>
      <LogoutButton {...args} />
    </SecondBrand>
  ),
};
