import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { demoDaypartsNb, demoFormatNb } from '../../../src/booking/__stories__/fixtures.js';
import { manageLabelsNb } from '../../../src/booking/__stories__/labels.time.js';
import {
  type ManagePricing,
  type ManageResult,
  ManageScreen,
  type ManageScreenProps,
} from '../../../src/booking/manage-screen.js';
import { DefaultTimeChip } from '../../../src/booking/time-screen.js';
import type { BookingManageDto, BookingSlotDto } from '../../../src/booking/types.js';

const exactly = (text: string) => text;
const NBSP = '\u00A0';
const HOUR = 3_600_000;
const WINDOW_HOURS = 24;

const pad = (value: number) => String(value).padStart(2, '0');
/** An Oslo wall-clock instant in September 2026 (CEST). */
const oslo = (day: number, hour: number, minute = 0) =>
  Date.parse(`2026-09-${pad(day)}T${pad(hour)}:${pad(minute)}:00+02:00`);

/** Monday 14 September 2026, 15:00 in Oslo. */
const NOW = oslo(14, 15);

/**
 * A booking that starts `inMs` from NOW, with `canCancel` / `canReschedule`
 * computed the way the engine does — confirmed, and at least the window before
 * start — because the screen relays them rather than owning a policy clock.
 */
function bookingStartingIn(
  inMs: number,
  overrides: Partial<BookingManageDto> = {}
): BookingManageDto {
  const startTs = NOW + inMs;
  const status = overrides.status ?? 'confirmed';
  const open = status === 'confirmed' && NOW <= startTs - WINDOW_HOURS * HOUR;
  return {
    bookingId: 'bk_1',
    status,
    rescheduledFromId: null,
    startTs,
    endTs: startTs + 30 * 60_000,
    serviceId: 'svc-kids',
    serviceName: 'Barneklipp',
    resourceId: 'res-ada',
    resourceName: 'Ada',
    bookedForName: 'Jonas',
    partySequenceId: null,
    amountOre: 49_000,
    cancelWindowHours: WINDOW_HOURS,
    rescheduleWindowHours: WINDOW_HOURS,
    canCancel: open,
    canReschedule: open,
    ...overrides,
  };
}

/** Two Thursday openings and two Saturday ones; never the booking's own 15:00. */
const AVAILABILITY: BookingSlotDto[] = [
  { startTs: oslo(17, 12), resourceId: 'res-ada' },
  { startTs: oslo(17, 16, 30), resourceId: 'res-ada' },
  { startTs: oslo(19, 12), resourceId: 'res-ada' },
  { startTs: oslo(19, 14), resourceId: 'res-ada' },
];

/** 490 kr, 539 kr at the weekend. */
const PRICING: ManagePricing = {
  priceAt: (ts) => (demoFormatNb.clock.isWeekend(ts) ? 53_900 : 49_000),
  weekendSurchargePct: 10,
};

const ok = async (): Promise<ManageResult> => ({ ok: true, manageHref: '/manage/new-link' });

function setup(overrides: Partial<ManageScreenProps> = {}) {
  const onCancel = vi.fn<ManageScreenProps['onCancel']>(ok);
  const onReschedule = vi.fn<ManageScreenProps['onReschedule']>(ok);
  const onRequestSlots = vi.fn();
  const props: ManageScreenProps = {
    labels: manageLabelsNb,
    format: demoFormatNb,
    dayparts: demoDaypartsNb,
    booking: bookingStartingIn(72 * HOUR),
    bookingHref: '/book',
    portalHref: '/account',
    reschedule: { slots: AVAILABILITY },
    onRequestSlots,
    onCancel,
    onReschedule,
    now: NOW,
    ...overrides,
  };
  const utils = render(<ManageScreen {...props} />);
  return {
    ...utils,
    props,
    onCancel: (overrides.onCancel as typeof onCancel | undefined) ?? onCancel,
    onReschedule: (overrides.onReschedule as typeof onReschedule | undefined) ?? onReschedule,
    onRequestSlots:
      (overrides.onRequestSlots as typeof onRequestSlots | undefined) ?? onRequestSlots,
    rerenderWith: (next: Partial<ManageScreenProps>) =>
      utils.rerender(<ManageScreen {...props} {...next} />),
  };
}

const L = manageLabelsNb;

async function pickNewSlot(name: RegExp | string) {
  fireEvent.click(screen.getByRole('button', { name: L['manage.change'] }));
  fireEvent.click(await screen.findByRole('button', { name }));
}

describe('ManageScreen', () => {
  it('names the stylist the way the stylist step did, not by an admin label', () => {
    setup({ booking: bookingStartingIn(72 * HOUR, { resourceName: 'ada (Demo)' }) });
    expect(
      screen.getByText(`tor. 17. sep. kl. 15:00 hos Ada · 490${NBSP}kr`, { normalizer: exactly })
    ).toBeInTheDocument();
  });

  it('shows the appointment: who, what, when, with whom and the price', () => {
    setup();
    expect(screen.getByText('Jonas – Barneklipp')).toBeInTheDocument();
    expect(
      screen.getByText(`tor. 17. sep. kl. 15:00 hos Ada · 490${NBSP}kr`, { normalizer: exactly })
    ).toBeInTheDocument();
  });

  it('drops a stylist the catalogue no longer knows, and the engine’s placeholder service name', () => {
    setup({
      booking: bookingStartingIn(72 * HOUR, {
        resourceName: 'Unknown resource',
        serviceName: 'Unknown service',
      }),
    });
    expect(screen.getByText('Jonas – Time')).toBeInTheDocument();
    expect(
      screen.getByText(`tor. 17. sep. kl. 15:00 · 490${NBSP}kr`, { normalizer: exactly })
    ).toBeInTheDocument();
  });

  it('says when free changes end, and how long that leaves', async () => {
    setup({ booking: bookingStartingIn(51 * HOUR) });
    expect(screen.getByText(/Gratis å endre fram til tir\. 15\. sep\. kl\. 18:00/)).toBeVisible();
    expect(await screen.findByText(/\(om 1 dag og 3 timer\)/)).toBeVisible();
  });

  it('takes the rejected slot off the screen while it re-reads', async () => {
    const onReschedule = vi.fn(
      async (): Promise<ManageResult> => ({ ok: false, code: 'slotTaken' })
    );
    const { onRequestSlots, rerenderWith } = setup({ onReschedule });

    await pickNewSlot(/16:30/);
    fireEvent.click(screen.getByRole('button', { name: L['manage.move.confirm'] }));

    // Back on the picker, the refresh asked for, and the chip that just lost
    // is not sitting there waiting to be tapped again.
    await waitFor(() => expect(onRequestSlots).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('alert')).toHaveTextContent(L['manage.error.slotTaken']);
    expect(screen.queryByRole('button', { name: /16:30/ })).toBeNull();
    expect(screen.getByText(L['manage.reschedule.loading'])).toBeInTheDocument();

    // The caller answers with a fresh array.
    rerenderWith({ reschedule: { slots: [...AVAILABILITY] } });
    expect(await screen.findByRole('button', { name: /16:30/ })).toBeInTheDocument();
  });

  it('retries the openings after a failed refresh, instead of sticking', async () => {
    const onReschedule = vi.fn(
      async (): Promise<ManageResult> => ({ ok: false, code: 'slotTaken' })
    );
    const { onRequestSlots, rerenderWith } = setup({ onReschedule });

    await pickNewSlot(/16:30/);
    fireEvent.click(screen.getByRole('button', { name: L['manage.move.confirm'] }));
    await waitFor(() => expect(onRequestSlots).toHaveBeenCalledTimes(1));

    // The refresh fails, with the stale array still held by the caller.
    rerenderWith({ reschedule: { slots: AVAILABILITY, failed: true } });
    expect(await screen.findByText(/Vi får ikke hentet ledige tider/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: L['manage.back'] }));
    fireEvent.click(screen.getByRole('button', { name: L['manage.change'] }));
    expect(onRequestSlots).toHaveBeenCalledTimes(2);

    rerenderWith({ reschedule: { slots: [...AVAILABILITY] } });
    expect(await screen.findByRole('button', { name: /16:30/ })).toBeInTheDocument();
  });

  it('asks for the openings on entering the time step only when there are none', () => {
    const { onRequestSlots, rerenderWith } = setup({ reschedule: { slots: null } });
    fireEvent.click(screen.getByRole('button', { name: L['manage.change'] }));
    expect(onRequestSlots).toHaveBeenCalledTimes(1);
    expect(screen.getByText(L['manage.reschedule.loading'])).toBeInTheDocument();

    rerenderWith({ reschedule: { slots: AVAILABILITY } });
    fireEvent.click(screen.getByRole('button', { name: L['manage.back'] }));
    fireEvent.click(screen.getByRole('button', { name: L['manage.change'] }));
    expect(onRequestSlots).toHaveBeenCalledTimes(1);
  });

  it('links the calendar entry the caller built, as a download', () => {
    setup({ icsHref: 'data:text/calendar;charset=utf-8,BEGIN', icsFileName: 'appointment.ics' });
    const link = screen.getByRole('link', { name: L['manage.calendar'] });
    expect(link).toHaveAttribute('href', 'data:text/calendar;charset=utf-8,BEGIN');
    expect(link).toHaveAttribute('download', 'appointment.ics');
  });

  it('draws no calendar link without an href', () => {
    setup();
    expect(screen.queryByRole('link', { name: L['manage.calendar'] })).toBeNull();
  });

  it('swaps both actions for a phone number inside the window', () => {
    setup({ booking: bookingStartingIn(2 * HOUR), phone: '22334455' });
    expect(screen.queryByRole('button', { name: L['manage.change'] })).toBeNull();
    expect(screen.getByRole('link', { name: /Ring for å endre/ })).toHaveAttribute(
      'href',
      expect.stringContaining('tel:')
    );
  });

  it('also loses cancel, and says what to do instead', () => {
    setup({ booking: bookingStartingIn(2 * HOUR), phone: '22 33 44 55' });
    expect(screen.queryByRole('button', { name: L['manage.cancel'] })).toBeNull();
    expect(screen.getByRole('link', { name: /Ring for å avbestille/ })).toHaveAttribute(
      'href',
      'tel:22334455'
    );
    expect(screen.getByText(/Under 24 timer igjen/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ring oss på 22 33 44 55' })).toBeInTheDocument();
  });

  it('renders the same sentences unlinked when there is no number', () => {
    setup({ booking: bookingStartingIn(2 * HOUR), phone: null });
    expect(screen.getByText(/Ring for å endre/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Ring for å endre/ })).toBeNull();
    expect(
      screen.getByText('Under 24 timer igjen – ring oss, så finner vi ut av det.')
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /ring oss/i })).toBeNull();
  });

  it('reads the engine’s verdict rather than the clock', () => {
    setup({ booking: bookingStartingIn(72 * HOUR, { canCancel: false }) });
    expect(screen.queryByRole('button', { name: L['manage.cancel'] })).toBeNull();
    expect(screen.getByRole('button', { name: L['manage.change'] })).toBeInTheDocument();
  });

  it('offers a rebook link immediately after cancelling', async () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: L['manage.cancel'] }));
    fireEvent.click(screen.getByRole('button', { name: L['manage.cancel.confirm'] }));
    expect(
      await screen.findByRole('link', { name: L['manage.cancelled.findNew'] })
    ).toHaveAttribute('href', '/book');
  });

  it('asks the cancellation question with the window in it', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: L['manage.cancel'] }));
    expect(
      screen.getByText(
        "Avbestille Jonas' time tor. 17. sep. kl. 15:00? Det er gratis fram til 24 t før."
      )
    ).toBeInTheDocument();
  });

  it('writes the possessive for a name that does not end in s', () => {
    setup({ booking: bookingStartingIn(72 * HOUR, { bookedForName: 'Mia' }) });
    fireEvent.click(screen.getByRole('button', { name: L['manage.cancel'] }));
    expect(screen.getByText(/^Avbestille Mias time/)).toBeInTheDocument();
  });

  it('sends no reason when no chip was tapped, and the chip when one was', async () => {
    const first = setup();
    fireEvent.click(screen.getByRole('button', { name: L['manage.cancel'] }));
    fireEvent.click(screen.getByRole('button', { name: L['manage.cancel.confirm'] }));
    await screen.findByRole('link', { name: L['manage.cancelled.findNew'] });
    expect(first.onCancel).toHaveBeenCalledWith(null);
    first.unmount();

    const second = setup();
    fireEvent.click(screen.getByRole('button', { name: L['manage.cancel'] }));
    const illness = screen.getByRole('button', { name: L['manage.cancel.reason.illness'] });
    fireEvent.click(illness);
    expect(illness).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: L['manage.cancel.confirm'] }));
    await screen.findByRole('link', { name: L['manage.cancelled.findNew'] });
    expect(second.onCancel).toHaveBeenCalledWith(L['manage.cancel.reason.illness']);
  });

  it('clears a reason when its chip is tapped again', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: L['manage.cancel'] }));
    const other = screen.getByRole('button', { name: L['manage.cancel.reason.other'] });
    fireEvent.click(other);
    fireEvent.click(other);
    expect(other).toHaveAttribute('aria-pressed', 'false');
  });

  it('«keep the appointment» leaves the booking alone', () => {
    const { onCancel } = setup();
    fireEvent.click(screen.getByRole('button', { name: L['manage.cancel'] }));
    fireEvent.click(screen.getByRole('button', { name: L['manage.cancel.keep'] }));
    expect(onCancel).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: L['manage.cancel'] })).toBeInTheDocument();
  });

  it('raises one cancellation for a double-tapped confirm', async () => {
    let settle: (result: ManageResult) => void = () => {};
    const onCancel = vi.fn(
      () =>
        new Promise<ManageResult>((resolve) => {
          settle = resolve;
        })
    );
    setup({ onCancel });
    fireEvent.click(screen.getByRole('button', { name: L['manage.cancel'] }));
    const confirm = screen.getByRole('button', { name: L['manage.cancel.confirm'] });
    fireEvent.click(confirm);
    expect(confirm).toBeDisabled();
    fireEvent.click(confirm);
    await act(async () => settle({ ok: true }));
    await screen.findByRole('link', { name: L['manage.cancelled.findNew'] });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('shows «something went wrong» when a callback throws', async () => {
    setup({ onCancel: vi.fn(async () => Promise.reject(new Error('offline'))), phone: '22334455' });
    fireEvent.click(screen.getByRole('button', { name: L['manage.cancel'] }));
    fireEvent.click(screen.getByRole('button', { name: L['manage.cancel.confirm'] }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Noe gikk galt. Prøv igjen, eller ring oss på 22334455.'
    );
    expect(screen.getByRole('button', { name: L['manage.cancel.confirm'] })).not.toBeDisabled();
  });

  it('marks the current hour in the time step and does not offer it as a move', async () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: L['manage.change'] }));
    const marker = await screen.findByRole('button', { name: /Din time nå/ });
    expect(marker).toBeDisabled();
    expect(marker.textContent).toContain('15:00');
  });

  it('asks one question before moving, and names both ends of it', async () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: L['manage.change'] }));
    fireEvent.click(await screen.findByRole('button', { name: 'lør. 19.' }));
    fireEvent.click(screen.getByRole('button', { name: '12:00' }));
    expect(
      screen.getByText(
        "Flytte Jonas' time fra tor. 17. sep. 15:00 til lør. 19. sep. 12:00 hos Ada?"
      )
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: L['manage.move.confirm'] })).toBeInTheDocument();
  });

  it('warns about the weekend price only when the new slot costs more', async () => {
    const first = setup({ pricing: PRICING });
    await pickNewSlot(/^16:30$/);
    expect(screen.queryByText(/helgetillegg/)).toBeNull();
    first.unmount();

    setup({ pricing: PRICING });
    fireEvent.click(screen.getByRole('button', { name: L['manage.change'] }));
    fireEvent.click(await screen.findByRole('button', { name: 'lør. 19.' }));
    fireEvent.click(screen.getByRole('button', { name: '12:00' }));
    expect(
      screen.getByText(`Merk: lørdagspris 539${NBSP}kr (+10${NBSP}% helgetillegg)`, {
        normalizer: exactly,
      })
    ).toBeInTheDocument();
  });

  it('says nothing about the surcharge when the booking was already on a Saturday', async () => {
    setup({
      booking: bookingStartingIn(oslo(19, 12) - NOW, { amountOre: 53_900 }),
      pricing: PRICING,
    });
    await pickNewSlot(/^14:00$/);
    expect(screen.getByText(/^Flytte Jonas' time fra lør\. 19\. sep\. 12:00/)).toBeInTheDocument();
    expect(screen.queryByText(/helgetillegg/)).toBeNull();
  });

  it('moves the appointment and links the new manage page', async () => {
    const { onReschedule } = setup();
    await pickNewSlot(/^12:00$/);
    fireEvent.click(screen.getByRole('button', { name: L['manage.move.confirm'] }));
    expect(await screen.findByText('Timen er flyttet til tor. 17. sep. kl. 12:00.')).toBeVisible();
    expect(onReschedule).toHaveBeenCalledWith(AVAILABILITY[0]);
    expect(screen.getByRole('link', { name: L['manage.moved.view'] })).toHaveAttribute(
      'href',
      '/manage/new-link'
    );
  });

  it('does not invent a link when the move came back without a new one', async () => {
    setup({
      onReschedule: vi.fn(async (): Promise<ManageResult> => ({ ok: true })),
      phone: '22334455',
    });
    await pickNewSlot(/^12:00$/);
    fireEvent.click(screen.getByRole('button', { name: L['manage.move.confirm'] }));
    expect(await screen.findByText(/Timen er flyttet til/)).toBeVisible();
    expect(screen.queryByRole('link', { name: L['manage.moved.view'] })).toBeNull();
    expect(screen.getByText(/Endringen er lagret/)).toBeInTheDocument();
  });

  it('sends the visitor back to the time step when the new slot went first', async () => {
    const { rerenderWith } = setup({
      onReschedule: vi.fn(async (): Promise<ManageResult> => ({ ok: false, code: 'slotTaken' })),
    });
    await pickNewSlot(/^12:00$/);
    fireEvent.click(screen.getByRole('button', { name: L['manage.move.confirm'] }));
    expect(await screen.findByRole('alert')).toHaveTextContent(L['manage.error.slotTaken']);
    rerenderWith({ reschedule: { slots: AVAILABILITY.slice(1) } });
    expect(screen.getByRole('heading', { name: L['time.heading'] })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: L['manage.move.confirm'] })).toBeNull();
  });

  it('stays on the confirm with the error when the window has closed', async () => {
    setup({
      onReschedule: vi.fn(async (): Promise<ManageResult> => ({ ok: false, code: 'windowPassed' })),
      phone: '22334455',
    });
    await pickNewSlot(/^12:00$/);
    fireEvent.click(screen.getByRole('button', { name: L['manage.move.confirm'] }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Det er for kort tid igjen til å endre selv – ring oss på 22334455.'
    );
    expect(screen.getByRole('button', { name: L['manage.move.confirm'] })).toBeInTheDocument();
  });

  it('shows a cancelled booking’s state instead of two dead buttons', () => {
    setup({ booking: bookingStartingIn(72 * HOUR, { status: 'cancelled' }) });
    expect(screen.getByText(L['manage.closed.cancelled'])).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: L['manage.change'] })).toBeNull();
    expect(screen.queryByRole('button', { name: L['manage.cancel'] })).toBeNull();
    expect(screen.getByRole('link', { name: L['manage.bookNew'] })).toBeInTheDocument();
  });

  it('hands a pending booking to the telephone', () => {
    setup({ booking: bookingStartingIn(72 * HOUR, { status: 'pending' }), phone: '22334455' });
    expect(screen.getByText(L['manage.closed.pending'])).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Ta kontakt på 22334455, så ordner vi det.' })
    ).toHaveAttribute('href', 'tel:22334455');
  });

  it('asks a family whether the whole visit is moving', async () => {
    const { onRequestSlots } = setup({
      booking: bookingStartingIn(72 * HOUR, { partySequenceId: 'party_1' }),
      reschedule: { slots: null },
    });
    fireEvent.click(screen.getByRole('button', { name: L['manage.change'] }));
    expect(
      screen.getByRole('heading', { name: 'Flytte hele besøket, eller bare Jonas?' })
    ).toBeInTheDocument();
    expect(onRequestSlots).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Bare Jonas' }));
    expect(onRequestSlots).toHaveBeenCalledTimes(1);
    expect(screen.getByText(L['manage.reschedule.loading'])).toBeInTheDocument();
  });

  it('links to the portal from the overview and after a cancellation', async () => {
    const first = setup();
    const link = screen.getByRole('link', { name: L['manage.portal'] });
    expect(link).toHaveAttribute('href', '/account');
    expect(link).not.toHaveAttribute('target');
    expect(link).not.toHaveAttribute('rel');
    first.unmount();

    setup();
    fireEvent.click(screen.getByRole('button', { name: L['manage.cancel'] }));
    fireEvent.click(screen.getByRole('button', { name: L['manage.cancel.confirm'] }));
    await screen.findByRole('link', { name: L['manage.cancelled.findNew'] });
    expect(screen.getByRole('link', { name: L['manage.portal'] })).toHaveAttribute(
      'href',
      '/account'
    );
  });

  it('draws no portal link without an href', () => {
    setup({ portalHref: null });
    expect(screen.queryByRole('link', { name: L['manage.portal'] })).toBeNull();
  });

  it('has no axe violations, on the overview and in the time step', async () => {
    const { container } = setup({ phone: '22 33 44 55', icsHref: 'data:text/calendar,x' });
    const rules = { rules: { 'color-contrast': { enabled: false } } };
    expect(await axe(container, rules)).toHaveNoViolations();
    fireEvent.click(screen.getByRole('button', { name: L['manage.change'] }));
    expect(await axe(container, rules)).toHaveNoViolations();
  });
});

describe('ManageScreen — override ladder', () => {
  it('shows a labels override', () => {
    setup({ labels: { ...manageLabelsNb, 'manage.heading': 'Bestillingen din' } });
    expect(screen.getByRole('heading', { level: 1, name: 'Bestillingen din' })).toBeInTheDocument();
  });

  it('lands classNames on their slots, and timeClassNames in the time step', () => {
    setup({ classNames: { card: 'card-x', root: 'root-x' }, timeClassNames: { chip: 'chip-x' } });
    expect(screen.getByText('Jonas – Barneklipp').parentElement).toHaveClass('card-x');
    expect(screen.getByRole('heading', { level: 1 }).parentElement).toHaveClass('root-x');
    fireEvent.click(screen.getByRole('button', { name: L['manage.change'] }));
    expect(screen.getByRole('button', { name: '12:00' })).toHaveClass('chip-x');
  });

  it('passes a TimeChip override into the time step', () => {
    setup({
      components: {
        TimeChip: (props) => (
          <span data-testid="wrapped">
            <DefaultTimeChip {...props} />
          </span>
        ),
      },
    });
    fireEvent.click(screen.getByRole('button', { name: L['manage.change'] }));
    // Two Thursday openings plus the current-hour marker.
    expect(screen.getAllByTestId('wrapped')).toHaveLength(3);
  });
});

/** The text nodes directly under `element`, in order. */
function textNodes(element: Element): string[] {
  return Array.from(element.childNodes)
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent ?? '');
}

describe('ManageScreen — text nodes', () => {
  it('renders string card lines and the reschedule lead as ONE text node each', () => {
    setup();
    expect(textNodes(screen.getByText('Jonas – Barneklipp'))).toEqual(['Jonas – Barneklipp']);
    const when = screen.getByText(/ hos Ada · /);
    expect(textNodes(when)).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: L['manage.change'] }));
    expect(textNodes(screen.getByText('Barneklipp hos Ada – velg ny tid'))).toEqual([
      'Barneklipp hos Ada – velg ny tid',
    ]);
  });

  it('renders array labels one text node per element', () => {
    setup({
      labels: {
        ...L,
        'manage.card.named': ['{name}', ' – ', '{service}'],
        'manage.card.whenWithStylist': ['{dateTime}', ' hos {stylist}', ' · {price}'],
        'manage.reschedule.leadWithStylist': ['{service}', ' hos {stylist}', ' – velg ny tid'],
      },
    });
    expect(textNodes(screen.getByText('Jonas – Barneklipp'))).toEqual([
      'Jonas',
      ' – ',
      'Barneklipp',
    ]);
    const when = screen.getByText(/ hos Ada · /);
    expect(textNodes(when).slice(1)).toEqual([' hos Ada', ` · 490${NBSP}kr`]);
    fireEvent.click(screen.getByRole('button', { name: L['manage.change'] }));
    expect(textNodes(screen.getByText('Barneklipp hos Ada – velg ny tid'))).toEqual([
      'Barneklipp',
      ' hos Ada',
      ' – velg ny tid',
    ]);
  });
});
