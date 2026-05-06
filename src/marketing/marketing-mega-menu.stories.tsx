import type { Meta, StoryObj } from '@storybook/react-vite';
import { BarChart, Sparkles, Workflow } from 'lucide-react';
import { MarketingMegaMenu } from './marketing-mega-menu.js';

const meta = {
  title: 'Marketing/MegaMenu',
  component: MarketingMegaMenu,
  parameters: { layout: 'centered' },
  args: {
    triggerId: 'products-trigger',
    open: true,
    onOpenChange: () => {},
    features: [
      {
        id: 'a',
        icon: <Sparkles className="h-4 w-4" />,
        title: 'AI Composer',
        description: 'Draft, schedule, post.',
        href: '/products/composer',
      },
      {
        id: 'b',
        icon: <BarChart className="h-4 w-4" />,
        title: 'Analytics',
        description: 'Channel + funnel insights.',
        href: '/products/analytics',
      },
      {
        id: 'c',
        icon: <Workflow className="h-4 w-4" />,
        title: 'Automations',
        description: 'Triggers + sequences.',
        href: '/products/automations',
      },
    ],
  },
} satisfies Meta<typeof MarketingMegaMenu>;
export default meta;
type Story = StoryObj<typeof meta>;

export const FeatureListing: Story = {
  render: (args) => (
    <div className="relative pt-16">
      <button
        type="button"
        id={args.triggerId}
        aria-haspopup="menu"
        aria-expanded
        className="rounded-full border border-border px-3 py-1.5 text-sm"
      >
        Products
      </button>
      <MarketingMegaMenu {...args} />
    </div>
  ),
};
