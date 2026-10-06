import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { loginPanelLabelsNb as labels } from '../../../src/booking/__stories__/labels.portal.js';
import { fillLabel } from '../../../src/booking/labels.js';
import {
  LoginPanel,
  type LoginPanelProps,
  type LoginStartResult,
  type LoginVerifyResult,
} from '../../../src/booking/login-panel.js';
import type { BookingGuardian } from '../../../src/booking/types.js';
import type { VippsStartAction } from '../../../src/booking/vipps-button.js';

const EMAIL = 'demo@example.com';
const GUARDIAN: BookingGuardian = {
  firstName: 'Demo',
  lastName: 'Forelder',
  email: EMAIL,
  phone: '40000000',
  family: [{ name: 'Mia', birthYear: 2018 }],
};

const onStartLogin = vi.fn<(email: string) => Promise<LoginStartResult>>();
const onVerify =
  vi.fn<
    (
      code: string,
      context: { mode: 'email' | 'vipps'; email: string }
    ) => Promise<LoginVerifyResult>
  >();
const onSignedIn = vi.fn();
const onVipps = vi.fn<VippsStartAction>(async () => null);

const REFUSED = (
  reason: 'invalid' | 'throttled' | 'conflict' | 'unreachable'
): LoginVerifyResult => ({
  ok: false,
  reason,
});

function renderPanel(props: Partial<LoginPanelProps> = {}) {
  return render(
    <LoginPanel
      labels={labels}
      onStartLogin={onStartLogin}
      onVerify={onVerify}
      onSignedIn={onSignedIn}
      onVipps={onVipps}
      {...props}
    />
  );
}

function codeInput() {
  return screen.getByLabelText(labels['otp.label']) as HTMLInputElement;
}

async function requestCode(typed = `  ${EMAIL}  `) {
  fireEvent.change(screen.getByLabelText(labels['login.emailLabel']), { target: { value: typed } });
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
  onVerify.mockResolvedValue(REFUSED('invalid'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('LoginPanel, emailCollapsed', () => {
  it('shows Vipps first, then an e-mail button that opens and focuses the form', () => {
    renderPanel({ emailCollapsed: true });
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveAccessibleName(labels['vipps.button']);
    expect(screen.queryByLabelText(labels['login.emailLabel'])).toBeNull();
    expect(screen.queryByText(labels['login.or'])).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: labels['login.continueEmail'] }));
    const input = screen.getByLabelText(labels['login.emailLabel']);
    expect(input).toHaveFocus();
    expect(screen.queryByRole('button', { name: labels['login.continueEmail'] })).toBeNull();
    expect(screen.queryByText(labels['login.or'])).toBeNull();
  });

  it('draws the form directly without Vipps', () => {
    renderPanel({ emailCollapsed: true, onVipps: undefined });
    expect(screen.getByLabelText(labels['login.emailLabel'])).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: labels['login.continueEmail'] })).toBeNull();
  });

  it('keeps the form open through memory', () => {
    renderPanel({
      emailCollapsed: true,
      memory: { mode: 'start', email: '', sentTo: '', resendAt: 0, emailOpen: true },
      onMemoryChange: vi.fn(),
    });
    const input = screen.getByLabelText(labels['login.emailLabel']);
    expect(input).toBeInTheDocument();
    // Restored from memory, not tapped: focus is not stolen.
    expect(input).not.toHaveFocus();
  });

  it('a closed memory shows the e-mail button again', () => {
    renderPanel({
      emailCollapsed: true,
      memory: { mode: 'start', email: '', sentTo: '', resendAt: 0, emailOpen: false },
      onMemoryChange: vi.fn(),
    });
    expect(screen.getByRole('button', { name: labels['login.continueEmail'] })).toBeInTheDocument();
    expect(screen.queryByLabelText(labels['login.emailLabel'])).toBeNull();
  });

  it('still draws the «or» divider when not collapsed', () => {
    renderPanel();
    expect(screen.getByText(labels['login.or'])).toBeInTheDocument();
  });
});

describe('LoginPanel, first screen', () => {
  it('puts Vipps above the e-mail form, with an «or» between', () => {
    const { container } = renderPanel();

    const html = container.innerHTML;
    expect(screen.getByRole('button', { name: labels['vipps.button'] })).toBeInTheDocument();
    expect(html.indexOf(labels['vipps.button'])).toBeLessThan(
      html.indexOf(`>${labels['login.or']}<`)
    );
    expect(html.indexOf(`>${labels['login.or']}<`)).toBeLessThan(
      html.indexOf(labels['login.emailIntro'])
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('hands `vippsNext` to Vipps and uses `vippsLabel`', () => {
    const { container } = renderPanel({ vippsNext: '/somewhere?resume=1', vippsLabel: 'Go Vipps' });
    expect(container.querySelector('input[name="next"]')).toHaveValue('/somewhere?resume=1');
    expect(screen.getByRole('button', { name: 'Go Vipps' })).toBeInTheDocument();
  });

  it('draws no Vipps button and no rule without `onVipps`', () => {
    renderPanel({ onVipps: undefined });
    expect(screen.queryByRole('button', { name: labels['vipps.button'] })).toBeNull();
    expect(screen.queryByText(labels['login.or'])).toBeNull();
  });

  it('opens on the e-mail field', () => {
    renderPanel();
    const input = screen.getByLabelText(labels['login.emailLabel']);
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('autocomplete', 'email');
    expect(input).toBeRequired();
    expect(screen.queryByLabelText(labels['otp.label'])).toBeNull();
  });

  it('draws no heading by default, and the caller’s when given one', () => {
    const { rerender } = renderPanel();
    expect(screen.queryByRole('heading')).toBeNull();
    rerender(
      <LoginPanel
        labels={labels}
        onStartLogin={onStartLogin}
        onVerify={onVerify}
        onSignedIn={onSignedIn}
        heading={(text) => <h1>{text}</h1>}
      />
    );
    expect(screen.getByRole('heading', { name: labels['login.heading'] })).toBeInTheDocument();
  });
});

describe('LoginPanel, asking for a code', () => {
  it('trims the address, asks once, and moves to the code screen', async () => {
    renderPanel({ heading: (text) => <h2>{text}</h2> });
    await requestCode();
    expect(onStartLogin).toHaveBeenCalledWith(EMAIL);
    expect(screen.getByRole('heading', { name: labels['login.codeHeading'] })).toBeInTheDocument();
    expect(
      screen.getByText(fillLabel(labels['login.codeHelp'], { email: EMAIL }))
    ).toBeInTheDocument();
  });

  it('stays on the e-mail step with a plain notice when asking failed', async () => {
    onStartLogin.mockResolvedValue({ ok: false, reason: 'unreachable' });
    renderPanel();
    fireEvent.change(screen.getByLabelText(labels['login.emailLabel']), {
      target: { value: EMAIL },
    });
    fireEvent.click(screen.getByRole('button', { name: labels['login.sendCode'] }));

    expect(await screen.findByText(labels['login.notice.unreachable'])).toBeInTheDocument();
    // It must not pretend a code was sent.
    expect(screen.getByLabelText(labels['login.emailLabel'])).toBeInTheDocument();
    expect(screen.queryByLabelText(labels['otp.label'])).toBeNull();
  });

  it('treats a thrown start as unreachable', async () => {
    onStartLogin.mockRejectedValue(new Error('network'));
    renderPanel();
    fireEvent.change(screen.getByLabelText(labels['login.emailLabel']), {
      target: { value: EMAIL },
    });
    fireEvent.click(screen.getByRole('button', { name: labels['login.sendCode'] }));
    expect(await screen.findByText(labels['login.notice.unreachable'])).toBeInTheDocument();
  });

  it('asks again for a valid address when the one typed was refused', async () => {
    onStartLogin.mockResolvedValue({ ok: false, reason: 'invalidEmail' });
    renderPanel();
    fireEvent.change(screen.getByLabelText(labels['login.emailLabel']), {
      target: { value: 'demo@localhost' },
    });
    fireEvent.click(screen.getByRole('button', { name: labels['login.sendCode'] }));

    const error = await screen.findByText(labels['login.notice.badEmail']);
    const input = screen.getByLabelText(labels['login.emailLabel']);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.getAttribute('aria-describedby')).toBe(error.id);
  });

  it('goes back to the e-mail step from «use a different address»', async () => {
    renderPanel();
    await requestCode();

    const other = screen.getByRole('button', { name: labels['login.switchEmail'] });
    await waitFor(() => expect(other).toBeEnabled());
    fireEvent.click(other);

    expect(screen.getByLabelText(labels['login.emailLabel'])).toHaveValue(EMAIL);
    expect(screen.queryByLabelText(labels['otp.label'])).toBeNull();
  });

  it('collapsed: «use e-mail instead» from a Vipps confirm opens the form, not the two buttons', async () => {
    renderPanel({ emailCollapsed: true, vippsConfirm: { to: 'd•••@e•••.com' } });
    fireEvent.click(await screen.findByRole('button', { name: labels['login.useEmailInstead'] }));

    expect(screen.getByLabelText(labels['login.emailLabel'])).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: labels['login.continueEmail'] })).toBeNull();
  });
});

describe('LoginPanel, the live regions', () => {
  it('are mounted before the code is sent and keep their place on the code screen', async () => {
    renderPanel();
    const regions = [...document.querySelectorAll('[aria-live="polite"]')];
    expect(regions.length).toBeGreaterThanOrEqual(2);

    await requestCode();
    const sent = await screen.findByText(labels['login.notice.sent']);
    const countdown = screen.getByText(fillLabel(labels['login.cooldownWait'], { seconds: 30 }));

    expect(regions.some((region) => region.contains(sent))).toBe(true);
    expect(regions).toContain(countdown);
  });
});

describe('LoginPanel, the code field', () => {
  it('is a numeric one-time-code field the phone can fill', async () => {
    renderPanel();
    const code = await requestCode();

    expect(code).toHaveAttribute('inputmode', 'numeric');
    expect(code).toHaveAttribute('autocomplete', 'one-time-code');
    expect(code).toHaveAttribute('pattern', '\\d*');
    expect(code).toHaveAttribute('maxlength', '6');
    expect(document.querySelectorAll('[data-slot=otp-slot]')).toHaveLength(6);
    expect(screen.getByText(labels['login.notice.sent'])).toBeInTheDocument();
  });

  it('takes the caret on arrival', async () => {
    renderPanel();
    const code = await requestCode();
    await waitFor(() => expect(code).toHaveFocus());
  });

  it('fills every box from one paste and sends the code by itself', async () => {
    renderPanel();
    const code = await requestCode();

    paste(code, '492 155');

    const slots = [...document.querySelectorAll('[data-slot=otp-slot]')].map(
      (slot) => slot.textContent
    );
    expect(slots).toEqual(['4', '9', '2', '1', '5', '5']);
    await waitFor(() =>
      expect(onVerify).toHaveBeenCalledWith('492155', { mode: 'email', email: EMAIL })
    );
    expect(onVerify).toHaveBeenCalledTimes(1);
  });

  it('sends the code when the sixth digit is typed', async () => {
    renderPanel();
    const code = await requestCode();

    fireEvent.change(code, { target: { value: '49215' } });
    expect(onVerify).not.toHaveBeenCalled();
    fireEvent.change(code, { target: { value: '492155' } });

    await waitFor(() =>
      expect(onVerify).toHaveBeenCalledWith('492155', { mode: 'email', email: EMAIL })
    );
  });

  it('hands the guardian back on a good code', async () => {
    onVerify.mockResolvedValue({ ok: true, guardian: GUARDIAN });
    renderPanel();
    paste(await requestCode(), '654321');
    await waitFor(() => expect(onSignedIn).toHaveBeenCalledWith(GUARDIAN));
    expect(onSignedIn).toHaveBeenCalledTimes(1);
  });

  it('empties itself on a wrong code, says why, and takes the caret back', async () => {
    renderPanel();
    const code = await requestCode();

    paste(code, '000000');

    const error = await screen.findByText(labels['login.notice.invalid']);
    await waitFor(() => expect(code).toHaveValue(''));
    await waitFor(() => expect(code).toHaveFocus());
    expect(code).toHaveAttribute('aria-invalid', 'true');
    expect(code.getAttribute('aria-describedby')).toContain(error.id);
    expect(onSignedIn).not.toHaveBeenCalled();
  });

  it('says so when verify is rate-limited', async () => {
    onVerify.mockResolvedValue(REFUSED('throttled'));
    renderPanel();
    paste(await requestCode(), '123456');
    expect(await screen.findByText(labels['login.notice.throttled'])).toBeInTheDocument();
  });

  it('says it could not reach the booking system when verify fails outright', async () => {
    onVerify.mockRejectedValue(new Error('network'));
    renderPanel();
    paste(await requestCode(), '654321');
    expect(await screen.findByText(labels['login.notice.unreachable'])).toBeInTheDocument();
    expect(onSignedIn).not.toHaveBeenCalled();
  });

  it('can still be sent with the button', async () => {
    renderPanel();
    const code = await requestCode();

    fireEvent.change(code, { target: { value: '12345' } });
    fireEvent.submit(code.closest('form') as HTMLFormElement);

    await waitFor(() =>
      expect(onVerify).toHaveBeenCalledWith('12345', { mode: 'email', email: EMAIL })
    );
  });
});

describe('LoginPanel, «send a new code»', () => {
  it('waits thirty seconds, counting down, then resends to the same address', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderPanel();
    await requestCode();

    const resend = await screen.findByRole('button', {
      name: fillLabel(labels['login.resendIn'], { time: '0:30' }),
    });
    expect(resend).toBeDisabled();
    expect(
      screen.getByText(fillLabel(labels['login.cooldownWait'], { seconds: 30 }))
    ).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(
      screen.getByRole('button', { name: fillLabel(labels['login.resendIn'], { time: '0:20' }) })
    ).toBeDisabled();

    act(() => {
      vi.advanceTimersByTime(20_000);
    });
    const ready = await screen.findByRole('button', { name: labels['login.resend'] });
    expect(ready).toBeEnabled();
    expect(screen.getByText(labels['login.cooldownReady'])).toBeInTheDocument();

    onStartLogin.mockClear();
    fireEvent.click(ready);

    await waitFor(() => expect(onStartLogin).toHaveBeenCalledWith(EMAIL));
    expect(await screen.findByText(labels['login.notice.resent'])).toBeInTheDocument();
    expect(
      await screen.findByRole('button', {
        name: fillLabel(labels['login.resendIn'], { time: '0:30' }),
      })
    ).toBeDisabled();
  });

  it('honours `resendCooldownMs`', async () => {
    renderPanel({ resendCooldownMs: 5000 });
    await requestCode();
    expect(
      await screen.findByRole('button', {
        name: fillLabel(labels['login.resendIn'], { time: '0:05' }),
      })
    ).toBeDisabled();
  });
});

describe('LoginPanel confirming a Vipps login with a code', () => {
  it('opens on the code, says where it went, and verifies with the code alone', async () => {
    onVerify.mockResolvedValueOnce({ ok: true, guardian: GUARDIAN });
    renderPanel({ vippsConfirm: { to: 'd•••@e•••.com' }, heading: (text) => <h2>{text}</h2> });

    expect(screen.getByRole('heading', { name: labels['login.codeHeading'] })).toBeInTheDocument();
    expect(
      screen.getByText(fillLabel(labels['login.vippsSentTo'], { to: 'd•••@e•••.com' }))
    ).toBeInTheDocument();
    expect(screen.getByText(labels['login.codeHelpVipps'])).toBeInTheDocument();
    // Nothing to resend: the code went where the provider chose.
    expect(screen.queryByRole('button', { name: labels['login.resend'] })).toBeNull();

    paste(codeInput(), '492155');

    await waitFor(() => expect(onSignedIn).toHaveBeenCalledWith(GUARDIAN));
    expect(onVerify).toHaveBeenCalledWith('492155', { mode: 'vipps', email: 'd•••@e•••.com' });
  });

  it('says the generic sentence when no address was named', () => {
    renderPanel({ vippsConfirm: { to: null } });
    expect(screen.getByText(labels['login.vippsSentToUnknown'])).toBeInTheDocument();
  });

  it('says a wrong code is wrong, and a taken Vipps account is taken', async () => {
    renderPanel({ vippsConfirm: { to: null } });

    paste(codeInput(), '000000');
    expect(await screen.findByText(labels['login.notice.vippsInvalid'])).toBeInTheDocument();

    onVerify.mockResolvedValueOnce(REFUSED('conflict'));
    paste(codeInput(), '492155');
    expect(await screen.findByText(labels['login.notice.vippsConflict'])).toBeInTheDocument();
  });

  it('goes to the ordinary e-mail login on «use e-mail instead»', async () => {
    renderPanel({ vippsConfirm: { to: 'd•••@e•••.com' } });
    fireEvent.click(await screen.findByRole('button', { name: labels['login.useEmailInstead'] }));
    expect(await screen.findByLabelText(labels['login.emailLabel'])).toHaveValue('');
    expect(screen.getByRole('button', { name: labels['login.sendCode'] })).toBeInTheDocument();
  });
});

describe('LoginPanel overrides', () => {
  it('shows a labels override', () => {
    renderPanel({ labels: { ...labels, 'login.sendCode': 'Mail me' } });
    expect(screen.getByRole('button', { name: 'Mail me' })).toBeInTheDocument();
  });

  it('lands classNames on their slots', async () => {
    const { container } = renderPanel({
      classNames: { root: 'x-root', submit: 'x-submit', divider: 'x-divider', input: 'x-input' },
      vippsClassNames: { button: 'x-vipps' },
    });
    expect(container.firstElementChild).toHaveClass('x-root');
    expect(screen.getByRole('button', { name: labels['login.sendCode'] })).toHaveClass('x-submit');
    expect(screen.getByLabelText(labels['login.emailLabel'])).toHaveClass('x-input');
    expect(screen.getByRole('button', { name: labels['vipps.button'] })).toHaveClass('x-vipps');
    expect(container.querySelector('.x-divider')).not.toBeNull();
  });

  it('keeps its memory with the caller when controlled', async () => {
    const onMemoryChange = vi.fn();
    renderPanel({
      memory: { mode: 'code', email: EMAIL, sentTo: EMAIL, resendAt: 0 },
      onMemoryChange,
    });
    expect(codeInput()).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: labels['login.switchEmail'] }));
    expect(onMemoryChange).toHaveBeenCalled();
  });
});

describe('LoginPanel a11y', () => {
  it('has no axe violations on either screen', async () => {
    const { container } = renderPanel();
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    ).toHaveNoViolations();
    await requestCode();
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    ).toHaveNoViolations();
  });
});

describe('LoginPanel — label forms', () => {
  const nodes = (element: Element) =>
    Array.from(element.childNodes)
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent);

  it('hands the heading over in the form the pack wrote it', () => {
    renderPanel({
      labels: { ...labels, 'login.heading': ['Logg ', 'inn'] },
      heading: (text) => <h1>{text}</h1>,
    });
    expect(nodes(screen.getByRole('heading', { name: 'Logg inn' }))).toEqual(['Logg ', 'inn']);
  });

  it('describes no input by a notice the pack left blank', async () => {
    onStartLogin.mockResolvedValue({ ok: false, reason: 'invalidEmail' });
    renderPanel({ labels: { ...labels, 'login.notice.badEmail': [] } });
    fireEvent.change(screen.getByLabelText(labels['login.emailLabel']), {
      target: { value: 'demo@localhost' },
    });
    fireEvent.click(screen.getByRole('button', { name: labels['login.sendCode'] }));
    const input = screen.getByLabelText(labels['login.emailLabel']);
    await waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'));
    expect(input).not.toHaveAttribute('aria-describedby');
  });
});
