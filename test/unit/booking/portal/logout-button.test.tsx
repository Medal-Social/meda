import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { logoutLabelsNb as L } from '../../../../src/booking/__stories__/labels.portal-forms.js';
import { LogoutButton } from '../../../../src/booking/portal/logout-button.js';
import type { SaveResult } from '../../../../src/booking/types.js';

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

const onLogout = vi.fn<() => Promise<SaveResult>>();

beforeEach(() => {
  vi.clearAllMocks();
  onLogout.mockResolvedValue({ ok: true });
});

describe('LogoutButton', () => {
  it('calls back once and shows nothing on success', async () => {
    render(<LogoutButton labels={L} onLogout={onLogout} />);

    fireEvent.click(screen.getByRole('button', { name: L['logout.button'] }));

    await waitFor(() => expect(onLogout).toHaveBeenCalledTimes(1));
    expect(screen.queryByText(L['logout.unreachable'])).toBeNull();
  });

  it('stays put with a message when the logout fails', async () => {
    onLogout.mockResolvedValue({ ok: false, message: '' });
    render(<LogoutButton labels={L} onLogout={onLogout} />);

    fireEvent.click(screen.getByRole('button', { name: L['logout.button'] }));

    expect(await screen.findByText(L['logout.unreachable'])).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: L['logout.button'] })).not.toBeDisabled()
    );
  });

  it('treats a throw as a failure', async () => {
    onLogout.mockRejectedValue(new Error('boom'));
    render(<LogoutButton labels={L} onLogout={onLogout} />);
    fireEvent.click(screen.getByRole('button', { name: L['logout.button'] }));
    expect(await screen.findByText(L['logout.unreachable'])).toBeInTheDocument();
  });

  it('shows the failure’s own message when given', async () => {
    onLogout.mockResolvedValue({ ok: false, message: 'Still logged in.' });
    render(<LogoutButton labels={L} onLogout={onLogout} />);
    fireEvent.click(screen.getByRole('button', { name: L['logout.button'] }));
    expect(await screen.findByText('Still logged in.')).toBeInTheDocument();
  });

  it('is disabled while the callback is in flight', async () => {
    const { promise, resolve } = deferred<SaveResult>();
    onLogout.mockReturnValue(promise);
    render(<LogoutButton labels={L} onLogout={onLogout} />);

    const button = screen.getByRole('button', { name: L['logout.button'] });
    expect(button).not.toBeDisabled();
    fireEvent.click(button);

    await waitFor(() => expect(button).toBeDisabled());
    resolve({ ok: true });
    await waitFor(() => expect(button).not.toBeDisabled());
  });

  it('takes label and slot overrides', () => {
    render(
      <LogoutButton
        labels={{ ...L, 'logout.button': 'Sign out' }}
        onLogout={onLogout}
        classNames={{ button: 'slot-button', root: 'slot-root' }}
      />
    );
    const button = screen.getByRole('button', { name: 'Sign out' });
    expect(button).toHaveClass('slot-button');
    expect(button.closest('form')).toHaveClass('slot-root');
  });

  it('has no axe violations', async () => {
    const { container } = render(<LogoutButton labels={L} onLogout={onLogout} />);
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    ).toHaveNoViolations();
  });
});
