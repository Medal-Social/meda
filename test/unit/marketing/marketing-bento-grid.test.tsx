import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MarketingBentoCard } from '../../../src/marketing/marketing-bento-card.js';
import { MarketingBentoGrid } from '../../../src/marketing/marketing-bento-grid.js';

describe('MarketingBentoGrid', () => {
  it('renders children inside a grid container', () => {
    render(
      <MarketingBentoGrid cols={12}>
        <MarketingBentoCard colSpan={6} title="A" />
        <MarketingBentoCard colSpan={3} title="B" />
        <MarketingBentoCard colSpan={3} title="C" />
      </MarketingBentoGrid>
    );
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
  });
});

describe('MarketingBentoCard', () => {
  it('applies col-span-* class for the colSpan prop', () => {
    render(<MarketingBentoCard colSpan={6} title="Wide" />);
    const card = screen.getByText('Wide').closest('[data-bento-card]');
    expect(card?.className).toMatch(/col-span-6/);
  });

  it('renders as anchor when href is provided', () => {
    render(<MarketingBentoCard href="/x" title="L" />);
    expect(screen.getByRole('link', { name: /L/ })).toHaveAttribute('href', '/x');
  });
});
