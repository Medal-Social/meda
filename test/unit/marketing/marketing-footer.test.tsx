import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MarketingFooter } from '../../../src/marketing/marketing-footer.js';

describe('MarketingFooter', () => {
  it('renders all column headings and their links', () => {
    render(
      <MarketingFooter
        brand="Medal"
        columns={[
          {
            title: 'Product',
            links: [
              { label: 'Pricing', href: '/pricing' },
              { label: 'Changelog', href: '/changelog' },
            ],
          },
          { title: 'Company', links: [{ label: 'About', href: '/about' }] },
        ]}
      />
    );
    expect(screen.getByRole('heading', { name: 'Product' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Company' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Pricing' })).toHaveAttribute('href', '/pricing');
    expect(screen.getByRole('link', { name: 'Changelog' })).toHaveAttribute('href', '/changelog');
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about');
  });

  it('renders bottomSlot when provided', () => {
    render(<MarketingFooter columns={[]} bottomSlot={<span data-testid="bottom">© 2026</span>} />);
    expect(screen.getByTestId('bottom')).toHaveTextContent('© 2026');
  });
});
