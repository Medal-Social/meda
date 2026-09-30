import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { loginSheetLabelsNb as labels } from '../../../src/booking/__stories__/labels.portal.js';
import { fillLabel } from '../../../src/booking/labels.js';
import type { LoginStartResult, LoginVerifyResult } from '../../../src/booking/login-panel.js';
import { LoginSheet, type LoginSheetProps } from '../../../src/booking/login-sheet.js';
import type { BookingGuardian } from '../../../src/booking/types.js';
import type { VippsStartAction } from '../../../src/booking/vipps-button.js';

const EMAIL = 'demo@example.com';
const GUARDIAN: BookingGuardian = {
  firstName: 'Demo',
  lastName: 'Forelder',
  email: EMAIL,
  phone: '40000000',
  family: [],
};

const onStartLogin = vi.fn<(email: string) => Promise<LoginStartResult>>();
const onVerify = vi.fn<(code: string) => Promise<LoginVerifyResult>>();
const onVipps = vi.fn<VippsStartAction>(async () => null);

function renderSheet(props: Partial<LoginSheetProps> = {}) {
  const onSignedIn = vi.fn();
  render(
    <div>
      <button type="button">Before</button>
      <LoginSheet
        labels={labels}
        resumePath="/book?resume=1"
        onStartLogin={onStartLogin}
        onVerify={onVerify}
        onVipps={onVipps}
        onSignedIn={onSignedIn}
        {...props}
      />
    </div>
  );
  return { onSignedIn };
}

function trigger() {
  return screen.getByRole('button', { name: labels['loginSheet.trigger'] });
}

async function openSheet() {
  fireEvent.click(trigger());
  const dialog = await screen.findByRole('dialog', { name: labels['login.heading'] });
  await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement));
  return dialog;
}

async function requestCode() {
  fireEvent.change(screen.getByLabelText(labels['login.emailLabel']), { target: { value: EMAIL } });
  fireEvent.click(screen.getByRole('button', { name: labels['login.sendCode'] }));
  await waitFor(() => expect(onStartLogin).toHaveBeenCalled());
  return screen.findByLabelText(labels['otp.label']);
}

function paste(input: HTMLElement, text: string) {
  fireEvent.paste(input, { clipboardData: { getData: () => text } });
}

beforeEach(() => {
  vi.clearAllMocks();
  onStartLogin.mockResolvedValue({ ok: true });
  onVerify.mockResolvedValue({ ok: false, reason: 'invalid' });
});

afterEach(() => {
  vi.useRealTimers();
  document.documentElement.style.overflow = '';
});

describe('LoginSheet', () => {
  it('is a row that says what it offers, and nothing else until it is opened', () => {
    renderSheet();
    const row = trigger().closest('p');
    expect(row).toHaveTextContent(
      fillLabel(labels['loginSheet.prompt'], { trigger: labels['loginSheet.trigger'] })
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('opens as a modal dialog labelled by its heading, with the intro as description', async () => {
    renderSheet();
    const dialog = await openSheet();

    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(
      within(dialog).getByRole('heading', { name: labels['login.heading'] })
    ).toBeInTheDocument();
    expect(dialog).toHaveAccessibleDescription(labels['loginSheet.intro']);
  });

  it('closes on Escape and gives focus back to the row that opened it', async () => {
    renderSheet();
    const opener = trigger();
    const dialog = await openSheet();

    fireEvent.keyDown(dialog, { key: 'Escape' });

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(opener).toHaveFocus());
  });

  it('closes from its own close button', async () => {
    renderSheet();
    await openSheet();
    fireEvent.click(screen.getByRole('button', { name: labels['loginSheet.close'] }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('locks the page behind it from scrolling', async () => {
    renderSheet();
    await openSheet();
    expect(document.documentElement.style.overflow).toBe('hidden');
  });

  it('offers Vipps with the sheet’s own label, and tells it to come back to the resume path', async () => {
    renderSheet();
    const dialog = await openSheet();
    expect(
      within(dialog).getByRole('button', { name: labels['loginSheet.vipps'] })
    ).toBeInTheDocument();
    expect(dialog.querySelector('input[name="next"]')).toHaveValue('/book?resume=1');
  });

  it('hands the guardian back and closes', async () => {
    onVerify.mockResolvedValue({ ok: true, guardian: GUARDIAN });
    const { onSignedIn } = renderSheet();
    await openSheet();

    const code = await requestCode();
    expect(onStartLogin).toHaveBeenCalledWith(EMAIL);
    expect(screen.getByRole('heading', { name: labels['login.codeHeading'] })).toBeInTheDocument();
    paste(code, '492155');

    await waitFor(() => expect(onSignedIn).toHaveBeenCalledWith(GUARDIAN));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('does not hand focus back to the trigger after a sign-in', async () => {
    onVerify.mockResolvedValue({ ok: true, guardian: GUARDIAN });
    renderSheet();
    const opener = trigger();
    await openSheet();

    paste(await requestCode(), '492155');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(opener).not.toHaveFocus();
  });

  it('resumes on the code screen with the same address and the wait still running', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderSheet();
    const dialog = await openSheet();
    await requestCode();
    await screen.findByRole('button', {
      name: fillLabel(labels['login.resendIn'], { time: '0:30' }),
    });

    fireEvent.keyDown(dialog, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    fireEvent.click(trigger());
    const reopened = await screen.findByRole('dialog', { name: labels['login.codeHeading'] });
    expect(within(reopened).getByLabelText(labels['otp.label'])).toBeInTheDocument();
    expect(
      within(reopened).getByText(fillLabel(labels['login.codeHelp'], { email: EMAIL }))
    ).toBeInTheDocument();
    const resend = within(reopened).getByRole('button', {
      name: new RegExp(`^${fillLabel(labels['login.resendIn'], { time: '0:(19|20)' })}$`),
    });
    expect(resend).toBeDisabled();
    expect(onStartLogin).toHaveBeenCalledTimes(1);
  });

  it('opens by itself on the code for a Vipps confirm, with no row of its own', async () => {
    const { onSignedIn } = renderSheet({ trigger: false, vippsConfirm: { to: 'd•••@e•••.com' } });
    onVerify.mockResolvedValueOnce({ ok: true, guardian: GUARDIAN });

    const dialog = await screen.findByRole('dialog', { name: labels['login.codeHeading'] });
    expect(document.querySelector('[data-slot=sheet-trigger]')).toBeNull();
    expect(
      within(dialog).getByText(fillLabel(labels['login.vippsSentTo'], { to: 'd•••@e•••.com' }))
    ).toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: labels['login.resend'] })).toBeNull();

    paste(within(dialog).getByLabelText(labels['otp.label']), '492155');
    await waitFor(() => expect(onSignedIn).toHaveBeenCalledWith(GUARDIAN));
  });

  it('takes a labels override and classNames on its slots', async () => {
    renderSheet({
      labels: { ...labels, 'loginSheet.trigger': 'Sign in' },
      classNames: { prompt: 'x-prompt', trigger: 'x-trigger', title: 'x-title', close: 'x-close' },
    });
    const opener = screen.getByRole('button', { name: 'Sign in' });
    expect(opener).toHaveClass('x-trigger');
    expect(opener.closest('p')).toHaveClass('x-prompt');
    fireEvent.click(opener);
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('heading')).toHaveClass('x-title');
    expect(within(dialog).getByRole('button', { name: labels['loginSheet.close'] })).toHaveClass(
      'x-close'
    );
  });

  it('has no axe violations, closed and open', async () => {
    renderSheet();
    const opts = { rules: { 'color-contrast': { enabled: false } } };
    expect(await axe(trigger().closest('p') as HTMLElement, opts)).toHaveNoViolations();
    const dialog = await openSheet();
    expect(await axe(dialog, opts)).toHaveNoViolations();
  });
});
