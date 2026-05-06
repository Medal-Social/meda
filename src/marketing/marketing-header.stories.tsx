import type { Meta, StoryObj } from '@storybook/react-vite';
import { MarketingHeader } from './marketing-header.js';
import { MarketingHeaderLogo } from './marketing-header-logo.js';

const navItems = [
  { id: 'start', label: 'Start Here', href: '/start' },
  { id: 'products', label: 'Products', hasMenu: true },
  { id: 'solutions', label: 'Solutions', hasMenu: true },
  { id: 'pricing', label: 'Pricing', href: '/pricing' },
  { id: 'resources', label: 'Resources', hasMenu: true },
];

const meta = {
  title: 'Marketing/Header',
  component: MarketingHeader,
  parameters: {
    layout: 'fullscreen',
    chromatic: { modes: { desktop: { viewport: 1280 }, mobile: { viewport: 390 } } },
  },
  args: {
    logo: <MarketingHeaderLogo word="Medal" />,
    navItems,
  },
} satisfies Meta<typeof MarketingHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedOut: Story = {};
export const LoggedIn: Story = {
  args: {
    user: { name: 'Ali Tech', email: 'ali@medalsocial.com', workspaceSlug: 'medal' },
  },
};
