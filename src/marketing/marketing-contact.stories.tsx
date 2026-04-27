import type { Meta, StoryObj } from '@storybook/react-vite';
import { MarketingContact } from './marketing-contact.js';

function DemoForm() {
  return (
    <form aria-label="Demo contact form" className="space-y-4">
      <label className="block text-sm font-medium text-foreground">
        Work email
        <input
          className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
          placeholder="you@company.com"
          type="email"
        />
      </label>
      <label className="block text-sm font-medium text-foreground">
        What are you launching?
        <textarea
          className="mt-2 min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          placeholder="Tell us about the campaign."
        />
      </label>
      <button
        className="inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        type="button"
      >
        Send request
      </button>
    </form>
  );
}

const meta = {
  title: 'Marketing/Contact',
  component: MarketingContact,
  parameters: { layout: 'fullscreen' },
  args: {
    intro: 'Give buyers a direct path to the team behind the campaign.',
    form: <DemoForm />,
    office: {
      title: 'Oslo office',
      address: 'Torggata 1, 0181 Oslo',
      email: 'hello@medalsocial.com',
      phone: '+47 22 00 00 00',
      hours: 'Mon-Fri, 09:00-17:00',
    },
    contactPerson: {
      title: 'Direct contact',
      name: 'Ali',
      role: 'Marketing lead',
      description: 'Helps teams package launches into crisp, trackable campaigns.',
      email: 'ali@medalsocial.com',
      phone: '+47 99 00 00 00',
    },
  },
} satisfies Meta<typeof MarketingContact>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Compact: Story = {
  args: {
    compact: true,
  },
};
