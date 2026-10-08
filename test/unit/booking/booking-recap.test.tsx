import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { demoFormatNb } from '../../../src/booking/__stories__/fixtures.js';
import { bookingRecapLabelsNb as L } from '../../../src/booking/__stories__/labels.details.js';
import {
  BOOKING_RECAP_LABEL_KEYS,
  BookingRecap,
  type BookingRecapProps,
} from '../../../src/booking/booking-recap.js';
import { BOOKING_LABEL_KEYS } from '../../../src/booking/label-keys.js';

/** Thursday 17 September 2026, 15:00 Oslo. */
const START = Date.UTC(2026, 8, 17, 13);
const HALF_HOUR = 30 * 60_000;

function setup(props: Partial<BookingRecapProps> = {}) {
  const onEdit = vi.fn();
  const onSwap = vi.fn();
  const utils = render(
    <BookingRecap
      lines={[
        {
          startTs: START,
          endTs: START + HALF_HOUR,
          services: ['Barneklipp'],
          stylist: { name: 'Ada Demo' },
        },
      ]}
      totalOre={39_000}
      format={demoFormatNb}
      labels={L}
      onEdit={onEdit}
      {...props}
    />
  );
  return {
    ...utils,
    onEdit,
    onSwap,
    card: screen.getByRole('region', { name: L['recap.label'] as string }),
  };
}

describe('BookingRecap', () => {
  it('registers its label keys with the full pack', () => {
    for (const key of BOOKING_RECAP_LABEL_KEYS) expect(BOOKING_LABEL_KEYS).toContain(key);
  });

  it('names the day, the hours, the service with its stylist and the total', () => {
    const { card } = setup();

    // The leaf: weekday, date and month, on the business clock.
    expect(card).toHaveTextContent(demoFormatNb.clock.weekday(START));
    expect(card).toHaveTextContent('17');
    expect(card).toHaveTextContent(demoFormatNb.clock.monthName(9));
    expect(card).toHaveTextContent('Kl. 15:00–15:30');
    expect(card).toHaveTextContent('Barneklipp hos Ada Demo');
    expect(card).toHaveTextContent(
      `${demoFormatNb.price(39_000).replace(/ /g, ' ')} · betales i salongen`
    );
  });

  it('reads the day out to a screen reader, not only the leaf', () => {
    const { card } = setup();
    expect(
      within(card).getByText(demoFormatNb.clock.dayLabel(START), { exact: false })
    ).toHaveClass('sr-only');
  });

  it('says «first free stylist» until a slot names somebody', () => {
    const { card } = setup({
      lines: [
        { startTs: START, endTs: START + HALF_HOUR, services: ['Barneklipp'], stylist: null },
      ],
    });
    expect(card).toHaveTextContent('Barneklipp hos første ledige frisør');
  });

  it('lists a family line by line, with whose it is, and spans the whole visit', () => {
    const { card } = setup({
      lines: [
        {
          startTs: START,
          endTs: START + HALF_HOUR,
          services: ['Barneklipp'],
          stylist: { name: 'Ada Demo' },
          who: 'Mia',
        },
        {
          startTs: START,
          endTs: START + 2 * HALF_HOUR,
          services: ['Klipp', 'Skjegg'],
          stylist: { name: 'Bo Eksempel' },
          who: 'Deg',
        },
      ],
      totalOre: 99_000,
    });

    expect(card).toHaveTextContent('Kl. 15:00–16:00');
    const items = within(card).getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('Mia: Barneklipp hos Ada Demo');
    expect(items[1]).toHaveTextContent('Deg: Klipp + Skjegg hos Bo Eksempel');
  });

  it('goes back to change the time', () => {
    const { onEdit } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Endre dag og tid' }));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('draws no edit button without a handler', () => {
    setup({ onEdit: undefined });
    expect(screen.queryByRole('button', { name: 'Endre dag og tid' })).toBeNull();
  });

  it('offers the stylists free at the same minute, and swaps on a tap', () => {
    const onSwap = vi.fn();
    const { card } = setup({
      alternatives: [
        { resourceId: 'res-bo', name: 'Bo Eksempel' },
        { resourceId: 'res-cleo', name: 'Cleo Prøve' },
      ],
      onSwap,
    });

    expect(card).toHaveTextContent('Også ledig kl. 15:00:');
    fireEvent.click(screen.getByRole('button', { name: 'Bestill hos Cleo Prøve i stedet' }));
    expect(onSwap).toHaveBeenCalledWith('res-cleo');
  });

  it('shows at most three alternatives, and none without a swap handler', () => {
    const alternatives = ['a', 'b', 'c', 'd'].map((id) => ({
      resourceId: id,
      name: `Frisør ${id}`,
    }));
    const { unmount } = setup({ alternatives, onSwap: vi.fn() });
    expect(screen.getAllByRole('button', { name: /i stedet$/ })).toHaveLength(3);
    unmount();

    setup({ alternatives });
    expect(screen.queryByText(/Også ledig/)).toBeNull();
  });

  it('has no axe violations', async () => {
    const { container } = setup({
      alternatives: [{ resourceId: 'res-bo', name: 'Bo Eksempel' }],
      onSwap: vi.fn(),
    });
    expect(await axe(container)).toHaveNoViolations();
  });
});
