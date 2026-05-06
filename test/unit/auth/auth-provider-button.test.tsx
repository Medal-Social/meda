import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AuthError, AuthNotice, AuthOneTapSlot } from '../../../src/auth/auth-message.js';
import { AuthProviderButton } from '../../../src/auth/auth-provider-button.js';
import { AuthProviderList } from '../../../src/auth/auth-provider-list.js';

describe('auth controls', () => {
  it('renders provider buttons inside an accessible provider list', () => {
    render(
      <AuthProviderList>
        <AuthProviderButton provider="google" label="Continue with Google" />
      </AuthProviderList>
    );

    expect(screen.getByRole('list', { name: 'Authentication providers' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeInTheDocument();
  });

  it('disables clicks while loading and exposes busy state', () => {
    const onClick = vi.fn();

    render(
      <AuthProviderButton
        provider="google"
        label="Continue with Google"
        loading
        loadingLabel="Connecting..."
        onClick={onClick}
      />
    );

    const button = screen.getByRole('button', { name: 'Connecting...' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');

    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('shows the last-used affordance without replacing the accessible label', () => {
    render(<AuthProviderButton provider="google" label="Continue with Google" lastUsed />);

    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeInTheDocument();
    expect(screen.getByText('Last used')).toBeInTheDocument();
  });

  it('does not warn when provider list children are wrapped as list items', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AuthProviderList>
        <AuthProviderButton key="google" provider="google" label="Continue with Google" />
        <AuthProviderButton key="github" provider="github" label="Continue with GitHub" />
      </AuthProviderList>
    );

    expect(consoleError).not.toHaveBeenCalledWith(
      expect.stringContaining('Each child in a list should have a unique "key" prop'),
      expect.anything()
    );

    consoleError.mockRestore();
  });

  it('passes Meda button props into a custom rendered auth button', () => {
    const onClick = vi.fn();
    const customClick = vi.fn();

    render(
      <AuthProviderButton
        provider="google"
        label="Continue with Google"
        lastUsed
        onClick={onClick}
        render={<button type="button" data-testid="custom-auth" onClick={customClick} />}
      />
    );

    const button = screen.getByTestId('custom-auth');
    expect(button).toHaveAttribute('data-provider', 'google');
    expect(button).toHaveAttribute('data-last-used', 'true');
    expect(button).toHaveAccessibleName('Continue with Google');

    fireEvent.click(button);
    expect(customClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders auth messages only when content is supplied', () => {
    const { container } = render(
      <>
        <AuthError>Sign-in failed</AuthError>
        <AuthNotice>Restricted to team accounts</AuthNotice>
        <AuthError />
      </>
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Sign-in failed');
    expect(screen.getByText('Restricted to team accounts')).toBeInTheDocument();
    expect(container.querySelectorAll('[role="alert"]')).toHaveLength(1);
  });

  it('renders a stable one-tap slot container', () => {
    render(
      <AuthOneTapSlot data-testid="one-tap-slot">
        <div>mounted provider content</div>
      </AuthOneTapSlot>
    );

    expect(screen.getByTestId('one-tap-slot')).toHaveAttribute('data-meda-auth-one-tap-slot');
    expect(screen.getByText('mounted provider content')).toBeInTheDocument();
  });
});
