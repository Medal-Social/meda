import type { Meta, StoryObj } from '@storybook/react-vite';
import { Sparkles } from 'lucide-react';
import { MarketingAnnouncementBar } from './marketing-announcement-bar.js';

const meta = {
  title: 'Marketing/AnnouncementBar',
  component: MarketingAnnouncementBar,
  parameters: { layout: 'centered' },
  args: {
    icon: <Sparkles className="h-3.5 w-3.5" />,
    children: 'New: AI Marketing Copilot is live',
    href: '/changelog',
  },
} satisfies Meta<typeof MarketingAnnouncementBar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
