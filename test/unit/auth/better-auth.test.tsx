import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  BetterAuthOneTap,
  BetterAuthProviderButton,
  type BetterAuthProviderButtonProps,
  createBetterAuthAdapter,
  useBetterAuthLastLoginMethod,
} from '../../../src/auth/better-auth.js';

describe('better-auth adapter', () => {
  it('calls social sign-in and reports pending state', async () => {
    const social = vi.fn().mockResolvedValue({ ok: true });
    const onPendingChange = vi.fn();
    const onSuccess = vi.fn();

    render(
      <BetterAuthProviderButton
        authClient={{ signIn: { social } }}
        provider="google"
        callbackURL="/dashboard"
        errorCallbackURL="/login?error=1"
        label="Continue with Google"
        onPendingChange={onPendingChange}
        onSuccess={onSuccess}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }));

    await waitFor(() =>
      expect(social).toHaveBeenCalledWith({
        provider: 'google',
        callbackURL: '/dashboard',
        errorCallbackURL: '/login?error=1',
      })
    );
    expect(onPendingChange).toHaveBeenNthCalledWith(1, true);
    expect(onPendingChange).toHaveBeenLastCalledWith(false);
    expect(onSuccess).toHaveBeenCalledWith({ ok: true });
  });

  it('does not allow forwarded button props to replace social sign-in', async () => {
    const social = vi.fn().mockResolvedValue({ ok: true });
    const forwardedClick = vi.fn();
    const forwardedProps = {
      onClick: forwardedClick,
    } as unknown as BetterAuthProviderButtonProps;

    render(
      <BetterAuthProviderButton
        {...forwardedProps}
        authClient={{ signIn: { social } }}
        label="Continue with Google"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }));

    await waitFor(() => expect(social).toHaveBeenCalledWith({ provider: 'google' }));
    expect(forwardedClick).not.toHaveBeenCalled();
  });

  it('keeps internal pending state when external loading is false', async () => {
    let resolveSocial!: (value: unknown) => void;
    const social = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveSocial = resolve;
        })
    );

    render(
      <BetterAuthProviderButton
        authClient={{ signIn: { social } }}
        label="Continue with Google"
        loading={false}
      />
    );

    const button = screen.getByRole('button', { name: 'Continue with Google' });

    fireEvent.click(button);
    await waitFor(() => expect(button).toBeDisabled());
    fireEvent.click(button);

    expect(social).toHaveBeenCalledTimes(1);

    resolveSocial({ ok: true });
    await waitFor(() => expect(button).not.toBeDisabled());
  });

  it('reports an error when social sign-in is unavailable', async () => {
    const onError = vi.fn();

    render(
      <BetterAuthProviderButton authClient={{}} label="Continue with Google" onError={onError} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }));

    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });

  it('reads the last used login method when the plugin is available', async () => {
    function Probe() {
      const method = useBetterAuthLastLoginMethod({
        getLastUsedLoginMethod: () => Promise.resolve('google'),
      });

      return <div data-testid="method">{method ?? 'none'}</div>;
    }

    render(<Probe />);

    await waitFor(() => expect(screen.getByTestId('method')).toHaveTextContent('google'));
  });

  it('returns null when last used login method is unsupported', async () => {
    function Probe() {
      const method = useBetterAuthLastLoginMethod({});

      return <div data-testid="method">{method ?? 'none'}</div>;
    }

    render(<Probe />);

    await waitFor(() => expect(screen.getByTestId('method')).toHaveTextContent('none'));
  });

  it('mounts one tap only when enabled and supported', async () => {
    const oneTap = vi.fn().mockResolvedValue({ credential: 'ok' });
    const onSuccess = vi.fn();

    render(
      <BetterAuthOneTap
        authClient={{ oneTap }}
        enabled
        callbackURL="/dashboard"
        onSuccess={onSuccess}
      />
    );

    await waitFor(() => expect(oneTap).toHaveBeenCalledWith({ callbackURL: '/dashboard' }));
    expect(onSuccess).toHaveBeenCalledWith({ credential: 'ok' });
  });

  it('does not remount one tap when inline callbacks change', async () => {
    const oneTap = vi.fn().mockResolvedValue({ credential: 'ok' });
    const authClient = { oneTap };
    let successCount = 0;

    function OneTapProbe({ count }: { count: number }) {
      return (
        <BetterAuthOneTap
          authClient={authClient}
          callbackURL="/dashboard"
          onSuccess={() => {
            successCount += count;
          }}
        />
      );
    }

    const { rerender } = render(<OneTapProbe count={1} />);
    await waitFor(() => expect(oneTap).toHaveBeenCalledTimes(1));

    rerender(<OneTapProbe count={2} />);

    expect(oneTap).toHaveBeenCalledTimes(1);
    expect(successCount).toBe(1);
  });

  it('creates bound adapter helpers for a shared better-auth client', async () => {
    const social = vi.fn().mockResolvedValue({ ok: true });
    const adapter = createBetterAuthAdapter({ signIn: { social } });

    render(<adapter.BetterAuthProviderButton label="Continue with Google" />);

    fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }));

    await waitFor(() => expect(social).toHaveBeenCalledWith({ provider: 'google' }));
  });
});
