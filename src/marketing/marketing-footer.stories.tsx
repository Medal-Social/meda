import type { Meta, StoryObj } from '@storybook/react-vite';
import { MarketingFooter } from './marketing-footer.js';

const meta = {
  title: 'Marketing/Footer',
  component: MarketingFooter,
  parameters: { layout: 'fullscreen' },
  args: {
    brand: 'Medal',
    tagline: 'Marketing that runs itself.',
    columns: [
      {
        title: 'Product',
        links: [
          { label: 'Pricing', href: '#' },
          { label: 'Changelog', href: '#' },
          { label: 'Roadmap', href: '#' },
        ],
      },
      {
        title: 'Company',
        links: [
          { label: 'About', href: '#' },
          { label: 'Careers', href: '#' },
        ],
      },
      {
        title: 'Legal',
        links: [
          { label: 'Privacy', href: '#' },
          { label: 'Terms', href: '#' },
        ],
      },
    ],
    bottomSlot: <span>© 2026 Medal Social</span>,
  },
} satisfies Meta<typeof MarketingFooter>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
