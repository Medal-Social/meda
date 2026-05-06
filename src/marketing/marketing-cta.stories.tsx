import type { Meta, StoryObj } from '@storybook/react-vite';
import { MarketingCTA } from './marketing-cta.js';

const meta = {
  title: 'Marketing/CTA',
  component: MarketingCTA,
  parameters: { layout: 'fullscreen' },
  args: {
    title: 'Ready to let marketing run itself?',
    subtitle: 'Free 14-day trial. Cancel anytime.',
    ctas: (
      <>
        <a
          href="/sign-up"
          className="inline-flex items-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
        >
          Start free
        </a>
        <a
          href="/contact"
          className="inline-flex items-center rounded-full border border-border px-5 py-2 text-sm font-medium"
        >
          Talk to sales
        </a>
      </>
    ),
  },
} satisfies Meta<typeof MarketingCTA>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
