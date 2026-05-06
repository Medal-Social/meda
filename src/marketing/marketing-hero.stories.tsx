import type { Meta, StoryObj } from '@storybook/react-vite';
import { MarketingAnnouncementBar } from './marketing-announcement-bar.js';
import { MarketingHero } from './marketing-hero.js';

const meta = {
  title: 'Marketing/Hero',
  component: MarketingHero,
  parameters: { layout: 'fullscreen' },
  args: {
    eyebrow: (
      <MarketingAnnouncementBar href="/changelog">New: AI Composer</MarketingAnnouncementBar>
    ),
    headline: 'Marketing that runs itself.',
    subtitle: 'One platform to plan, post, nurture, and convert — every channel, automated.',
    ctas: (
      <>
        <a
          href="/sign-up"
          className="inline-flex items-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
        >
          Start free
        </a>
        <a
          href="/tour"
          className="inline-flex items-center rounded-full border border-border px-5 py-2 text-sm font-medium"
        >
          See how it works
        </a>
      </>
    ),
    meta: 'Free 14-day trial · No credit card · Cancel anytime',
    productMockup: (
      <img alt="App preview" src="https://placehold.co/1200x720/png" className="block w-full" />
    ),
  },
} satisfies Meta<typeof MarketingHero>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
