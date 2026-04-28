import type { Meta, StoryObj } from '@storybook/react-vite';
import { MarketingCallout } from './marketing-callout.js';

const meta = {
  title: 'Marketing/Callout',
  component: MarketingCallout,
  parameters: {
    layout: 'fullscreen',
    chromatic: { modes: { desktop: { viewport: 1280 }, mobile: { viewport: 390 } } },
  },
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

export const Default: Story = {};
