import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MarketingHero } from '../../../src/marketing/marketing-hero.js';

describe('MarketingHero', () => {
  it('renders headline as h1, subtitle, and slots', () => {
    render(
      <MarketingHero
        eyebrow={<span data-testid="eyebrow">eyebrow</span>}
        headline="Marketing that runs itself."
        subtitle="One platform to plan, post, nurture, convert."
        ctas={<button type="button">Start free</button>}
        meta={<span data-testid="meta">No credit card</span>}
        productMockup={<img alt="App" data-testid="mockup" />}
      />
    );
    expect(
      screen.getByRole('heading', { level: 1, name: /Marketing that runs itself/ })
    ).toBeInTheDocument();
    expect(screen.getByText('One platform to plan, post, nurture, convert.')).toBeInTheDocument();
    expect(screen.getByTestId('eyebrow')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start free' })).toBeInTheDocument();
    expect(screen.getByTestId('meta')).toBeInTheDocument();
    expect(screen.getByTestId('mockup')).toBeInTheDocument();
  });
});
