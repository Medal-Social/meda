import '@testing-library/jest-dom/vitest';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { MarketingBentoCard } from '../../../src/marketing/marketing-bento-card.js';
import { MarketingBentoGrid } from '../../../src/marketing/marketing-bento-grid.js';
import { MarketingFAQ } from '../../../src/marketing/marketing-faq.js';
import { MarketingFooter } from '../../../src/marketing/marketing-footer.js';
import { MarketingHeader } from '../../../src/marketing/marketing-header.js';
import { MarketingHeaderLogo } from '../../../src/marketing/marketing-header-logo.js';
import { MarketingShell } from '../../../src/marketing/marketing-shell.js';
import { MarketingTrustBar } from '../../../src/marketing/marketing-trust-bar.js';

describe('Marketing landing v5 — a11y', () => {
  it('has no axe violations for the assembled phase-1 shell', async () => {
    const { container } = render(
      <MarketingShell
        header={
          <MarketingHeader
            logo={<MarketingHeaderLogo word="Medal" />}
            navItems={[{ id: 'pricing', label: 'Pricing', href: '/pricing' }]}
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
        <MarketingTrustBar
          stats={[
            { value: '10k+', label: 'founders' },
            { value: '4.8/5', label: 'rating' },
          ]}
        />
        <MarketingBentoGrid>
          <MarketingBentoCard colSpan={6} title="A" description="a" />
          <MarketingBentoCard colSpan={6} title="B" description="b" />
        </MarketingBentoGrid>
        <MarketingFAQ items={[{ id: 'q1', question: 'Q?', answer: 'A.' }]} />
      </MarketingShell>
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
