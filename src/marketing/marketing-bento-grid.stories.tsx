import type { Meta, StoryObj } from '@storybook/react-vite';
import { BarChart, Globe, MessageSquare, Palette, Sparkles, Users, Workflow } from 'lucide-react';
import { MarketingBentoCard } from './marketing-bento-card.js';
import { MarketingBentoGrid } from './marketing-bento-grid.js';

const meta = {
  title: 'Marketing/BentoGrid',
  component: MarketingBentoGrid,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof MarketingBentoGrid>;
export default meta;
type Story = StoryObj<typeof meta>;

export const SevenCards: Story = {
  render: () => (
    <MarketingBentoGrid cols={12}>
      <MarketingBentoCard
        colSpan={6}
        rowSpan={2}
        variant="feature"
        icon={<Sparkles />}
        title="AI Marketing Copilot"
        description="Plan, draft, schedule."
      />
      <MarketingBentoCard colSpan={3} icon={<BarChart />} title="Analytics" />
      <MarketingBentoCard colSpan={3} icon={<Users />} title="CRM & Pipeline" />
      <MarketingBentoCard colSpan={3} icon={<Workflow />} title="Automations" />
      <MarketingBentoCard colSpan={3} icon={<Palette />} title="Brand AI" />
      <MarketingBentoCard colSpan={3} icon={<MessageSquare />} title="Social Composer" />
      <MarketingBentoCard colSpan={3} icon={<Globe />} title="Site & Email Builder" />
    </MarketingBentoGrid>
  ),
};
