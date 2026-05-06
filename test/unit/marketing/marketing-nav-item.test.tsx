import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MarketingNavItem } from '../../../src/marketing/marketing-nav-item.js';

describe('MarketingNavItem', () => {
  it('renders an anchor when href is provided and no menu', () => {
    render(<MarketingNavItem id="pricing" label="Pricing" href="/pricing" />);
    const link = screen.getByRole('link', { name: 'Pricing' });
    expect(link).toHaveAttribute('href', '/pricing');
  });

  it('renders a button with chevron when hasMenu', () => {
    render(<MarketingNavItem id="products" label="Products" hasMenu />);
    const btn = screen.getByRole('button', { name: /products/i });
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    expect(btn.querySelector('[data-chevron]')).toBeInTheDocument();
  });
});
