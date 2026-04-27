import type { Meta, StoryObj } from '@storybook/react-vite';
import { MarketingCallout } from './marketing-callout.js';

const meta = {
  title: 'Marketing/Callout',
  component: MarketingCallout,
  parameters: { layout: 'fullscreen' },
  args: {
    eyebrow: 'Launch campaign',
    title: 'Turn every product update into pipeline',
    description:
      'A focused callout block for landing pages, launch notes, and campaign moments that need clear next steps.',
    ctas: [
      { label: 'Book demo', href: '#demo' },
      { label: 'Read playbook', href: '#playbook', variant: 'secondary' },
    ],
  },
} satisfies Meta<typeof MarketingCallout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Band: Story = {};

export const Card: Story = {
  args: {
    variant: 'card',
    align: 'start',
    title: 'Capture demand before it goes cold',
  },
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
};
