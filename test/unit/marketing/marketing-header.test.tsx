import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MarketingHeader } from '../../../src/marketing/marketing-header.js';

afterEach(cleanup);

describe('MarketingHeader', () => {
  it('renders Sign in + Start free when no user', () => {
    render(<MarketingHeader navItems={[{ id: 'pricing', label: 'Pricing', href: '/pricing' }]} />);
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/sign-in');
    expect(screen.getByRole('link', { name: 'Start free' })).toHaveAttribute('href', '/sign-up');
  });

  it('honors custom signInHref / signUpHref', () => {
    render(<MarketingHeader signInHref="/login" signUpHref="/get-started" />);
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: 'Start free' })).toHaveAttribute(
      'href',
      '/get-started'
    );
  });

  it('renders provided navItems', () => {
    render(
      <MarketingHeader
        navItems={[
          { id: 'a', label: 'Start Here', href: '/start' },
          { id: 'b', label: 'Products', hasMenu: true },
        ]}
      />
    );
    expect(screen.getByRole('link', { name: 'Start Here' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /products/i })).toBeInTheDocument();
  });

  it('renderLoggedOut overrides default right side', () => {
    render(<MarketingHeader renderLoggedOut={() => <span data-testid="custom">Hello</span>} />);
    expect(screen.getByTestId('custom')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Sign in' })).toBeNull();
  });

  it('renders logged-in default with Open dashboard link when user is provided', () => {
    render(
      <MarketingHeader appHref="/app" user={{ name: 'Ali Tech', email: 'ali@medalsocial.com' }} />
    );
    expect(screen.getByRole('link', { name: 'Open dashboard' })).toHaveAttribute('href', '/app');
    expect(screen.queryByRole('link', { name: 'Sign in' })).toBeNull();
  });

  it('renderLoggedIn overrides logged-in default', () => {
    render(
      <MarketingHeader
        user={{ name: 'Ali Tech' }}
        renderLoggedIn={(u) => <span data-testid="custom-li">{u.name}</span>}
      />
    );
    expect(screen.getByTestId('custom-li')).toHaveTextContent('Ali Tech');
    expect(screen.queryByRole('link', { name: 'Open dashboard' })).toBeNull();
  });

  it('toggles mega menu open when nav item with panel is clicked', () => {
    render(
      <MarketingHeader
        navItems={[
          {
            id: 'products',
            label: 'Products',
            hasMenu: true,
            panel: <div data-testid="products-panel">Panel content</div>,
          },
        ]}
      />
    );
    const trigger = screen.getByRole('button', { name: /products/i });
    expect(screen.queryByTestId('products-panel')).toBeNull();
    fireEvent.click(trigger);
    expect(screen.getByTestId('products-panel')).toBeInTheDocument();
    fireEvent.click(trigger);
    expect(screen.queryByTestId('products-panel')).toBeNull();
  });
});

describe('MarketingHeader features-driven mega menu', () => {
  it('renders a MarketingMegaMenu from features when the item is opened', () => {
    render(
      <MarketingHeader
        navItems={[
          {
            id: 'products',
            label: 'Products',
            hasMenu: true,
            features: [
              {
                id: 'composer',
                title: 'AI Composer',
                description: 'Draft',
                href: '/products/composer',
              },
            ],
          },
        ]}
      />
    );
    expect(screen.queryByText('AI Composer')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Products' }));
    const link = screen.getByRole('link', { name: /AI Composer/ });
    expect(link).toHaveAttribute('href', '/products/composer');
  });

  it('prefers an explicit panel over features', () => {
    render(
      <MarketingHeader
        navItems={[
          {
            id: 'x',
            label: 'X',
            hasMenu: true,
            panel: <div data-testid="explicit-panel">explicit</div>,
            features: [{ id: 'a', title: 'A', href: '/a' }],
          },
        ]}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'X' }));
    expect(screen.getByTestId('explicit-panel')).toBeInTheDocument();
    expect(screen.queryByText('A')).not.toBeInTheDocument();
  });
});
