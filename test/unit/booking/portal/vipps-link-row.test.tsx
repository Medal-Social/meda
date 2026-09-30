import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { vippsLinkLabelsNb as L } from '../../../../src/booking/__stories__/labels.portal-forms.js';
import {
  VippsLinkRow,
  type VippsLinkRowProps,
  type VippsLinkStartResult,
} from '../../../../src/booking/portal/vipps-link-row.js';

/**
 * The Vipps link row: linked, or a button to link. A start that navigates is
 * not seen here, so what a test sees are the reasons it did NOT: `missing`
 * (the row hides), `session`, `unavailable`, `throttled`. The return from
 * Vipps is the server-recorded `flash` the caller hands in.
 */

const onStart = vi.fn<() => Promise<VippsLinkStartResult>>();
const onSessionExpired = vi.fn();
const onFlash = vi.fn();

function renderRow(props: Partial<VippsLinkRowProps> = {}) {
  return render(
    <VippsLinkRow
      labels={L}
      linked={false}
      flash={null}
      onStart={onStart}
      onSessionExpired={onSessionExpired}
      onFlash={onFlash}
      {...props}
    />
  );
}

async function tapLink() {
  fireEvent.click(screen.getByRole('button', { name: L['vippsLink.button'] }));
  await waitFor(() => expect(onStart).toHaveBeenCalled());
}

beforeEach(() => {
  vi.clearAllMocks();
  onStart.mockResolvedValue(null);
});

describe('VippsLinkRow', () => {
  it('says «linked» and offers no button when the profile is linked', () => {
    renderRow({ linked: true });

    expect(screen.getByRole('region', { name: L['vippsLink.heading'] })).toBeInTheDocument();
    expect(screen.getByText(L['vippsLink.linked'])).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: L['vippsLink.button'] })).toBeNull();
  });

  it('offers the link button when it is not', () => {
    renderRow();

    expect(screen.getByRole('button', { name: L['vippsLink.button'] })).toBeInTheDocument();
    expect(screen.queryByText(L['vippsLink.linked'])).toBeNull();
  });

  it('hides the whole row when the backend has no link route', async () => {
    onStart.mockResolvedValue({ ok: false, reason: 'missing' });
    renderRow();

    await tapLink();

    await waitFor(() =>
      expect(screen.queryByRole('region', { name: L['vippsLink.heading'] })).toBeNull()
    );
  });

  it('reports a dead session', async () => {
    onStart.mockResolvedValue({ ok: false, reason: 'session' });
    renderRow();

    await tapLink();

    await waitFor(() => expect(onSessionExpired).toHaveBeenCalledTimes(1));
  });

  it('says why when Vipps could not be started', async () => {
    onStart.mockResolvedValue({ ok: false, reason: 'unavailable' });
    renderRow();

    await tapLink();

    const notice = await screen.findByText(L['vippsLink.unavailable']);
    expect(
      screen.getByRole('button', { name: L['vippsLink.button'] }).closest('form')
    ).toHaveAttribute('aria-describedby', notice.id);
  });

  it('says to wait when throttled', async () => {
    onStart.mockResolvedValue({ ok: false, reason: 'throttled' });
    renderRow();
    await tapLink();
    expect(await screen.findByText(L['vippsLink.throttled'])).toBeInTheDocument();
  });

  it('hands a success flash to the caller once, and says nothing inline by default', async () => {
    const { rerender } = renderRow({ linked: true, flash: 'linked' });

    await waitFor(() => expect(onFlash).toHaveBeenCalledWith('linked'));
    expect(screen.queryByText(L['vippsLink.success'])).toBeNull();
    expect(screen.getByText(L['vippsLink.linked'])).toBeInTheDocument();
    rerender(<VippsLinkRow labels={L} linked flash="linked" onStart={onStart} onFlash={onFlash} />);
    expect(onFlash).toHaveBeenCalledTimes(1);
  });

  it('can announce the success inline for callers without a toast', () => {
    renderRow({ linked: true, flash: 'linked', announceSuccess: true });
    expect(screen.getByText(L['vippsLink.success'])).toBeInTheDocument();
  });

  it('takes its linked state ONLY from the profile, never from the flash', async () => {
    renderRow({ flash: 'linked' });

    await waitFor(() => expect(onFlash).toHaveBeenCalled());
    expect(screen.getByRole('button', { name: L['vippsLink.button'] })).toBeInTheDocument();
    expect(screen.queryByText(L['vippsLink.linked'])).toBeNull();
  });

  it('calls nothing without a flash', () => {
    renderRow();
    expect(onFlash).not.toHaveBeenCalled();
  });

  it('explains a Vipps account that belongs to another profile, and hands that flash on too', async () => {
    renderRow({ flash: 'link_conflict' });

    expect(screen.getByText(L['vippsLink.conflict'])).toBeInTheDocument();
    expect(screen.getByRole('button', { name: L['vippsLink.button'] })).toBeInTheDocument();
    await waitFor(() => expect(onFlash).toHaveBeenCalledWith('link_conflict'));
  });

  it('says a failed link can be tried again', () => {
    renderRow({ flash: 'link_failed' });
    expect(screen.getByText(L['vippsLink.failed'])).toBeInTheDocument();
  });

  it('takes label and slot overrides', () => {
    renderRow({
      labels: { ...L, 'vippsLink.button': 'Connect' },
      classNames: { button: 'slot-button', card: 'slot-card', root: 'slot-root' },
    });
    const button = screen.getByRole('button', { name: 'Connect' });
    expect(button).toHaveClass('slot-button', 'rounded-full');
    expect(screen.getByRole('region')).toHaveClass('slot-root');
    expect(button.closest('.slot-card')).not.toBeNull();
  });

  it('has no axe violations', async () => {
    const { container } = renderRow({ flash: 'link_conflict' });
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    ).toHaveNoViolations();
  });
});
