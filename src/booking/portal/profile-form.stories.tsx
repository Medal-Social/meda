import type { Meta, StoryObj } from '@storybook/react-vite';
import { profileFormLabelsEn, profileFormLabelsNb } from '../__stories__/labels.portal-forms.js';
import {
  BookingColumn,
  bookingStoryParameters,
  SecondBrand,
} from '../__stories__/story-helpers.js';
import { ProfileForm } from './profile-form.js';

const profile = {
  email: 'kari@example.com',
  firstName: 'Kari',
  lastName: 'Nordmann',
  phone: '40000000',
  marketingConsent: false,
};

const meta = {
  title: 'Booking/ProfileForm',
  component: ProfileForm,
  parameters: bookingStoryParameters,
  decorators: [
    (Story) => (
      <BookingColumn>
        <Story />
      </BookingColumn>
    ),
  ],
  args: {
    labels: profileFormLabelsNb,
    profile,
    onSave: async () => ({ ok: true, profile }),
    onConsentChange: async (accepted: boolean) => ({ ok: true, marketingConsent: accepted }),
  },
} satisfies Meta<typeof ProfileForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const English: Story = {
  args: {
    labels: profileFormLabelsEn,
    profile: { ...profile, firstName: 'Alex', lastName: 'Example', marketingConsent: true },
  },
};

export const SecondBrandTheme: Story = {
  name: 'Second brand',
  render: (args) => (
    <SecondBrand>
      <ProfileForm {...args} />
    </SecondBrand>
  ),
};
