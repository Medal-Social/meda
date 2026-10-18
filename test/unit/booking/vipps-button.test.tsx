import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { vippsButtonLabelsNb as labels } from '../../../src/booking/__stories__/labels.portal.js';
import {
  VippsButton,
  type VippsStartAction,
  type VippsStartState,
} from '../../../src/booking/vipps-button.js';

/**
 * On success a real start action never answers — it navigates — so the only
 * answers the button shows are the two reasons it did NOT, and `null`, which
 * is silence.
 */

const onVipps = vi.fn<VippsStartAction>();

function button(name = labels['vipps.button']) {
  return screen.getByRole('button', { name });
}

async function submit() {
  fireEvent.click(button());
  await waitFor(() => expect(onVipps).toHaveBeenCalled());
}

beforeEach(() => {
  onVipps.mockReset();
  onVipps.mockResolvedValue(null);
});

describe('VippsButton', () => {
  it('renders one submit button inside a form, and no sentence', () => {
    render(<VippsButton labels={labels} onVipps={onVipps} />);

    const submitButton = button();
    expect(submitButton).toHaveAttribute('type', 'submit');
    // Bridge colours by default; a brand colour comes in through `classNames.button`.
    expect(submitButton).toHaveClass(
      'bg-primary',
      'text-primary-foreground',
      'rounded-full',
      'w-full'
    );
    expect(submitButton.closest('form')).not.toBeNull();
    expect(screen.queryByText(labels['vipps.unavailable'])).not.toBeInTheDocument();
    expect(screen.queryByText(labels['vipps.throttled'])).not.toBeInTheDocument();
  });

  it('carries `next` as a hidden field, and none without one', () => {
    const { container, rerender } = render(
      <VippsButton labels={labels} onVipps={onVipps} next="/book?resume=1" />
    );
    expect(container.querySelector('input[name="next"]')).toHaveValue('/book?resume=1');
    rerender(<VippsButton labels={labels} onVipps={onVipps} />);
    expect(container.querySelector('input[name="next"]')).toBeNull();
  });

  it('submits the action with the form data and stays silent on null', async () => {
    render(<VippsButton labels={labels} onVipps={onVipps} next="/book" />);

    await submit();

    const [previous, formData] = onVipps.mock.calls[0];
    expect(previous).toBeNull();
    expect(formData).toBeInstanceOf(FormData);
    expect(formData.get('next')).toBe('/book');
    await waitFor(() => expect(button()).not.toBeDisabled());
    expect(screen.queryByText(labels['vipps.unavailable'])).not.toBeInTheDocument();
  });

  it('says «use e-mail instead» when Vipps is unavailable', async () => {
    onVipps.mockResolvedValue({ ok: false, reason: 'unavailable' });
    render(<VippsButton labels={labels} onVipps={onVipps} />);

    await submit();

    const notice = await screen.findByText(labels['vipps.unavailable']);
    expect(notice.closest('form')).toHaveAttribute('aria-describedby', notice.id);
    expect(button()).not.toBeDisabled();
  });

  it('says «try again in a moment» when throttled', async () => {
    onVipps.mockResolvedValue({ ok: false, reason: 'throttled' });
    render(<VippsButton labels={labels} onVipps={onVipps} />);
    await submit();
    expect(await screen.findByText(labels['vipps.throttled'])).toBeInTheDocument();
  });

  it('disables the button while the action is pending', async () => {
    let settle: (state: VippsStartState) => void = () => {};
    onVipps.mockReturnValue(
      new Promise((resolve) => {
        settle = resolve;
      })
    );
    render(<VippsButton labels={labels} onVipps={onVipps} />);

    await submit();

    await waitFor(() => expect(button()).toBeDisabled());
    expect(button()).toHaveAttribute('aria-busy', 'true');
    settle(null);
    await waitFor(() => expect(button()).not.toBeDisabled());
  });

  it('takes a label override, a labels override and a classNames.button', () => {
    render(
      <VippsButton
        labels={{ ...labels, 'vipps.button': 'Vipps, please' }}
        onVipps={onVipps}
        classNames={{ button: 'x-brand', root: 'x-root' }}
      />
    );
    expect(button('Vipps, please')).toHaveClass('x-brand');
    expect(button('Vipps, please').closest('form')).toHaveClass('x-root');

    render(<VippsButton labels={labels} label="Continue with Vipps" onVipps={onVipps} />);
    expect(button('Continue with Vipps')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = render(<VippsButton labels={labels} onVipps={onVipps} />);
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    ).toHaveNoViolations();
  });
});
