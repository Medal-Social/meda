import '@testing-library/jest-dom/vitest';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { MarketingAnnouncementBar } from '../../../src/marketing/marketing-announcement-bar.js';
import { MarketingBentoCard } from '../../../src/marketing/marketing-bento-card.js';
import { MarketingBentoGrid } from '../../../src/marketing/marketing-bento-grid.js';
import { MarketingCTA } from '../../../src/marketing/marketing-cta.js';
import { MarketingFAQ } from '../../../src/marketing/marketing-faq.js';
import { MarketingFooter } from '../../../src/marketing/marketing-footer.js';
import { MarketingHeader } from '../../../src/marketing/marketing-header.js';
import { MarketingHeaderLogo } from '../../../src/marketing/marketing-header-logo.js';
import { MarketingHero } from '../../../src/marketing/marketing-hero.js';
import { MarketingNumberedFeatures } from '../../../src/marketing/marketing-numbered-features.js';
import { MarketingShell } from '../../../src/marketing/marketing-shell.js';
import { MarketingTrustBar } from '../../../src/marketing/marketing-trust-bar.js';

describe('Marketing landing v5 — a11y', () => {
  it('has no axe violations for the assembled v5 shell', async () => {
    const { container } = render(
      <MarketingShell
        header={
          <MarketingHeader
            logo={<MarketingHeaderLogo word="Medal" />}
            navItems={[
              { id: 'pricing', label: 'Pricing', href: '/pricing' },
              {
                id: 'products',
                label: 'Products',
                hasMenu: true,
                panel: <section aria-label="Products menu">Products panel</section>,
              },
            ]}
          />
        }
        footer={
          <MarketingFooter
            brand="Medal"
            columns={[{ title: 'Product', links: [{ label: 'Pricing', href: '#' }] }]}
            bottomSlot={<span>© 2026 Medal Social</span>}
          />
        }
      >
        <MarketingHero
          eyebrow={
            <MarketingAnnouncementBar href="/changelog">New: AI Composer</MarketingAnnouncementBar>
          }
          headline="Marketing that runs itself."
          subtitle="One platform to plan, post, nurture, convert."
          ctas={
            <>
              <a href="/sign-up" className="text-sm">
                Start free
              </a>
              <a href="/tour" className="text-sm">
                See how it works
              </a>
            </>
          }
          meta="Free 14-day trial"
        />
        <MarketingTrustBar
          stats={[
            { value: '10k+', label: 'founders' },
            { value: '4.8/5', label: 'rating' },
          ]}
        />
        <MarketingNumberedFeatures
          title="Built to move marketing numbers"
          features={[
            { id: '01', index: '01', title: 'Plan', description: 'Plan with AI' },
            { id: '02', index: '02', title: 'Post', description: 'Post everywhere' },
            { id: '03', index: '03', title: 'Convert', description: 'Convert leads' },
          ]}
        />
        <MarketingBentoGrid>
          <MarketingBentoCard colSpan={6} title="A" description="a" />
          <MarketingBentoCard colSpan={6} title="B" description="b" />
        </MarketingBentoGrid>
        <MarketingFAQ items={[{ id: 'q1', question: 'Q?', answer: 'A.' }]} />
        <MarketingCTA
          title="Ready to ship?"
          subtitle="Start free."
          ctas={
            <a href="/sign-up" className="text-sm">
              Start free
            </a>
          }
        />
      </MarketingShell>
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
