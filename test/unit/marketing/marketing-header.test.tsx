import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MarketingHeader } from '../../../src/marketing/marketing-header.js';

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
});
