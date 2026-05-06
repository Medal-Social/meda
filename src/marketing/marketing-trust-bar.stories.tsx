import type { Meta, StoryObj } from '@storybook/react-vite';
import { MarketingTrustBar } from './marketing-trust-bar.js';

const meta = {
  title: 'Marketing/TrustBar',
  component: MarketingTrustBar,
  parameters: { layout: 'fullscreen' },
  args: {
    eyebrow: 'Trusted by',
    title: 'Built for marketers who ship',
    stats: [
      { value: '10k+', label: 'founders', caption: 'using Medal' },
      { value: '4.8/5', label: 'rating' },
      { value: '93%', label: 'on-brand drafts' },
      { value: '$8k', label: 'cost replaced' },
    ],
  },
} satisfies Meta<typeof MarketingTrustBar>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
