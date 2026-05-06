import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MarketingMegaMenu } from '../../../src/marketing/marketing-mega-menu.js';

describe('MarketingMegaMenu', () => {
  it('renders feature tiles when features prop is provided', () => {
    render(
      <MarketingMegaMenu
        triggerId="products"
        open
        onOpenChange={() => {}}
        features={[
          { id: 'a', title: 'Composer', description: 'Compose posts.', href: '/composer' },
          { id: 'b', title: 'Pipeline', description: 'Track pipeline.', href: '/pipeline' },
        ]}
      />
    );
    expect(screen.getByRole('link', { name: /Composer/ })).toHaveAttribute('href', '/composer');
    expect(screen.getByText('Track pipeline.')).toBeInTheDocument();
  });

  it('does not render when open=false', () => {
    const { container } = render(
      <MarketingMegaMenu triggerId="x" open={false} onOpenChange={() => {}} features={[]} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('children override features when both provided', () => {
    render(
      <MarketingMegaMenu triggerId="x" open onOpenChange={() => {}}>
        <div data-testid="custom">Custom</div>
      </MarketingMegaMenu>
    );
    expect(screen.getByTestId('custom')).toBeInTheDocument();
  });
});
