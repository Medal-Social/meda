import type { Meta, StoryObj } from '@storybook/react-vite';
import { MarketingNumberedFeatures } from './marketing-numbered-features.js';

const meta = {
  title: 'Marketing/NumberedFeatures',
  component: MarketingNumberedFeatures,
  parameters: { layout: 'fullscreen' },
  args: {
    title: 'Built to move your marketing numbers',
    features: [
      {
        id: 'a',
        index: '01',
        title: 'Plan with AI',
        description: 'Briefs, calendars, campaigns generated in minutes.',
      },
      {
        id: 'b',
        index: '02',
        title: 'Post everywhere',
        description: 'One composer, every channel — scheduled or live.',
      },
      {
        id: 'c',
        index: '03',
        title: 'Convert leads',
        description: 'Pipeline + CRM, automations, and reporting in one place.',
      },
    ],
  },
} satisfies Meta<typeof MarketingNumberedFeatures>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
