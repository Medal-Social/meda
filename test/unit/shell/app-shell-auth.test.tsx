import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { AppShellAuth } from './app-shell-auth.js';

describe('AppShellAuth', () => {
  it('renders the title, description, and form children', () => {
    render(
      <AppShellAuth title="Sign in" description="Welcome back" brandName="Meda">
        <input aria-label="email" />
      </AppShellAuth>
    );
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByLabelText('email')).toBeInTheDocument();
  });

  it('renders the brand name on the marketing panel', () => {
    render(
      <AppShellAuth title="Sign in" brandName="Meda">
        <input aria-label="email" />
      </AppShellAuth>
    );
    expect(screen.getAllByText('Meda').length).toBeGreaterThan(0);
  });

  it('uses dedicated auth gradient tokens for the marketing panel background', () => {
    const { container } = render(
      <AppShellAuth title="Sign in" brandName="Meda">
        <input aria-label="email" />
      </AppShellAuth>
    );

    const marketingPanel = container.querySelector('[data-meda-auth-marketing-panel]');
    expect(marketingPanel?.className).toContain('--auth-gradient-primary');
    expect(marketingPanel?.className).toContain('--auth-gradient-secondary');
    expect(marketingPanel?.className).toContain('--auth-gradient-base');
  });

  it('renders the actions slot when actions are provided', () => {
    render(
      <AppShellAuth
        title="Sign in"
        actions={
          <button type="button" data-testid="auth-action">
            Back
          </button>
        }
      >
        <input aria-label="email" />
      </AppShellAuth>
    );
    expect(screen.getByTestId('auth-action')).toBeInTheDocument();
  });
});
