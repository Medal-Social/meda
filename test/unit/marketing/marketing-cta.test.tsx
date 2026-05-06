import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MarketingCTA } from '../../../src/marketing/marketing-cta.js';

describe('MarketingCTA', () => {
  it('renders title as h2 and CTA slot', () => {
    render(
      <MarketingCTA
        title="Ready to let marketing run itself?"
        subtitle="Start free."
        ctas={<button type="button">Start free</button>}
      />
    );
    expect(screen.getByRole('heading', { level: 2, name: /Ready to let/ })).toBeInTheDocument();
    expect(screen.getByText('Start free.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start free' })).toBeInTheDocument();
  });
});
