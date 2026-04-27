import type { Meta, StoryObj } from '@storybook/react-vite';
import { MarketingLeadMagnet } from './marketing-lead-magnet.js';

function DemoForm() {
  return (
    <form aria-label="Lead magnet form" className="space-y-4">
      <label className="block text-sm font-medium text-foreground">
        Email
        <input
          className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
          placeholder="you@company.com"
          type="email"
        />
      </label>
      <button
        className="inline-flex min-h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        type="button"
      >
        Send the checklist
      </button>
    </form>
  );
}

const meta = {
  title: 'Marketing/LeadMagnet',
  component: MarketingLeadMagnet,
  parameters: { layout: 'padded' },
  args: {
    title: 'Get the launch checklist',
    description:
      'A practical campaign checklist for turning product updates into repeatable launch systems.',
    benefits: ['Messaging outline', 'QA pass', 'Analytics checklist'],
    buttonText: 'Download checklist',
    formTitle: 'Send me the checklist',
    form: <DemoForm />,
    image: (
      <div className="flex aspect-[4/3] items-center justify-center bg-muted p-8 text-center text-sm font-semibold text-muted-foreground">
        Launch checklist preview
      </div>
    ),
  },
} satisfies Meta<typeof MarketingLeadMagnet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Featured: Story = {};

export const Sidebar: Story = {
  args: {
    variant: 'sidebar',
    image: undefined,
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
};
