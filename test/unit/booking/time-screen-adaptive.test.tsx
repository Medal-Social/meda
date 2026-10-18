import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import {
  DEMO_NOW,
  demoDaypartsNb,
  demoFormatNb,
} from '../../../src/booking/__stories__/fixtures.js';
import { timeLabelsNb } from '../../../src/booking/__stories__/labels.time.js';
import {
  TimeScreen,
  type TimeScreenParty,
  type TimeScreenProps,
} from '../../../src/booking/time-screen.js';
import type { BookingSlotDto, PartySlot, WizardService } from '../../../src/booking/types.js';

/**
 * `layout="adaptive"`: the phone's stack with the days kept together, the days
 * beside the times from `md`, and from `lg` the week as a grid of times. The
 * two wide arrangements are both in the document and switched by CSS, so the
 * tests read each by its test id.
 */

const pad = (value: number) => String(value).padStart(2, '0');
const MINUTE = 60_000;
/** An Oslo wall-clock instant in September 2026. DEMO_NOW is Monday the 14th; the 19th is Saturday. */
const osloTs = (hour: number, minute = 0, day = 17) =>
  Date.parse(`2026-09-${pad(day)}T${pad(hour)}:${pad(minute)}:00+02:00`);
const at = (hour: number, minute = 0, day = 17): BookingSlotDto => ({
  startTs: osloTs(hour, minute, day),
  resourceId: 'res-ada',
});
/** Monday 14 – Sunday 20: a week of days. */
const WEEK = [14, 15, 16, 17, 18, 19, 20].map((day) => osloTs(12, 0, day));

function renderTime(props: Partial<TimeScreenProps> & Pick<TimeScreenProps, 'slots'>) {
  return render(
    <TimeScreen
      labels={timeLabelsNb}
      format={demoFormatNb}
      dayparts={demoDaypartsNb}
      now={DEMO_NOW}
      onPick={vi.fn()}
      layout="adaptive"
      days={WEEK}
      {...props}
    />
  );
}

const week = () => screen.getByTestId('time-week');
/** The week grid's columns of times, in day order. */
const columns = () =>
  within(week())
    .getAllByRole('listitem')
    .filter((item) => item.querySelector('p'));

describe('TimeScreen — layout="adaptive"', () => {
  it('leaves the default layout exactly as it was', () => {
    render(
      <TimeScreen
        labels={timeLabelsNb}
        format={demoFormatNb}
        dayparts={demoDaypartsNb}
        now={DEMO_NOW}
        onPick={vi.fn()}
        days={WEEK}
        slots={[at(9)]}
      />
    );
    expect(screen.queryByTestId('time-columns')).toBeNull();
    expect(screen.queryByTestId('time-week')).toBeNull();
  });

  it('draws the week as seven columns, each day with its own times', () => {
    const onPick = vi.fn();
    const slot = at(10, 30);
    renderTime({ slots: [at(9), slot, at(11, 0, 18)], onPick });
    expect(columns()).toHaveLength(7);
    const thursday = columns()[3] as HTMLElement;
    const times = within(thursday).getAllByRole('button');
    expect(times.map((button) => button.textContent)).toEqual(['09:00', '10:30']);
    fireEvent.click(within(thursday).getByRole('button', { name: '10:30' }));
    expect(onPick).toHaveBeenCalledWith(slot);
    // The column's list is named by its day.
    expect(within(thursday).getByRole('list')).toHaveAccessibleName(/17/);
  });

  it('says a day with nothing free says so', () => {
    renderTime({ slots: [at(9)] });
    expect(within(columns()[0] as HTMLElement).getByText('Ingen ledige')).toBeInTheDocument();
  });

  it('folds a long day after eight times, and unfolds it on a tap', () => {
    const slots = Array.from(
      { length: 11 },
      (_, index) => at(9, 0).startTs + index * 30 * MINUTE
    ).map((startTs) => ({ startTs, resourceId: 'res-ada' }));
    renderTime({ slots });
    const thursday = () => columns()[3] as HTMLElement;
    expect(within(within(thursday()).getByRole('list')).getAllByRole('button')).toHaveLength(8);
    fireEvent.click(within(thursday()).getByRole('button', { name: '3 til' }));
    expect(within(within(thursday()).getByRole('list')).getAllByRole('button')).toHaveLength(11);
    expect(within(thursday()).queryByRole('button', { name: '3 til' })).toBeNull();
  });

  it('heads each day with how full it is, with dayFullness', () => {
    renderTime({ slots: [at(9), at(10)], dayFullness: true, openDays: null });
    expect(within(columns()[3] as HTMLElement).getByText('2 ledige')).toBeInTheDocument();
  });

  it('says each weekend day’s own surcharge in its column', () => {
    renderTime({
      slots: [at(10, 0, 19), at(10, 0, 20)],
      // Saturday and Sunday priced differently.
      weekendNote: (dayTs) => {
        if (!demoFormatNb.clock.isWeekend(dayTs)) return null;
        const sunday =
          demoFormatNb.clock.dayKey(dayTs) === demoFormatNb.clock.dayKey(osloTs(12, 0, 20));
        return { pct: sunday ? 20 : 10, priceOre: sunday ? 58_800 : 53_900 };
      },
    });
    const [saturday, sunday] = [columns()[5] as HTMLElement, columns()[6] as HTMLElement];
    expect(within(saturday).getByTestId('week-surcharge')).toHaveTextContent(/\+10/);
    expect(within(sunday).getByTestId('week-surcharge')).toHaveTextContent(/\+20/);
    expect(within(columns()[3] as HTMLElement).queryByTestId('week-surcharge')).toBeNull();
  });

  it('says why and what to do when no day of the week has a time', () => {
    renderTime({ slots: [], phone: '22334455', openDays: null });
    expect(within(week()).getByRole('link', { name: /22 33 44 55|22334455/ })).toBeInTheDocument();
  });

  it('points past the week to the first opening, when it is after it', () => {
    const later = osloTs(10, 0, 23);
    const days = [...WEEK, ...[21, 22, 23].map((day) => osloTs(12, 0, day))];
    renderTime({ slots: [{ startTs: later, resourceId: 'res-ada' }], days, monthView: true });
    const link = within(week()).getByRole('button', { name: 'Første ledige time' });
    fireEvent.click(link);
    // The week turns to the one with the opening.
    expect(within(week()).getByRole('button', { name: '10:00' })).toBeInTheDocument();
  });

  it('keeps no «next free» link when the opening is in the week on screen', () => {
    renderTime({ slots: [at(9, 0, 18)] });
    expect(within(week()).queryByRole('button', { name: 'Første ledige time' })).toBeNull();
  });

  it('moves focus to the first revealed time when a day unfolds', () => {
    const slots = Array.from({ length: 10 }, (_, index) => ({
      startTs: at(9).startTs + index * 30 * MINUTE,
      resourceId: 'res-ada',
    }));
    renderTime({ slots });
    const thursday = columns()[3] as HTMLElement;
    fireEvent.click(within(thursday).getByRole('button', { name: '2 til' }));
    expect(document.activeElement).toHaveTextContent('13:00');
  });

  it('keeps the short-notice line for today when today has times', () => {
    renderTime({ slots: [{ startTs: DEMO_NOW + 2 * 60 * MINUTE, resourceId: 'res-ada' }] });
    expect(
      within(week()).getByText(timeLabelsNb['time.shortNotice'] as string)
    ).toBeInTheDocument();
  });

  it('draws the held hour in the grid, marked and not tappable', () => {
    const current = at(9);
    renderTime({ slots: [at(10)], currentSlotTs: current.startTs });
    const held = within(columns()[3] as HTMLElement).getByRole('button', { name: /09:00/ });
    expect(held).toBeDisabled();
  });

  it('offers a family the simultaneous time on a day with no back-to-back one', () => {
    const KIDS: WizardService = {
      id: 'svc-kids',
      name: 'Barneklipp',
      category: 'kids',
      durationMinutes: 30,
      bufferBeforeMinutes: 0,
      bufferAfterMinutes: 0,
      priceOre: 49_000,
      maxPerBooking: 3,
      weekendSurchargePct: 0,
    };
    const startTs = osloTs(15);
    const alternative: PartySlot = {
      startTs,
      mode: 'parallel',
      seats: [
        { startTs, resourceId: 'res-ada' },
        { startTs, resourceId: 'res-bo' },
      ],
    };
    const onPick = vi.fn();
    const party: TimeScreenParty = {
      items: [{ service: KIDS }, { service: KIDS }],
      mode: 'sequential',
      slots: [],
      chipEndTs: (slot) => slot.startTs + 60 * MINUTE,
      alternativeFor: (dayTs) =>
        demoFormatNb.clock.dayKey(dayTs) === demoFormatNb.clock.dayKey(startTs)
          ? alternative
          : null,
      resolveStylistName: () => null,
      onPick,
    };
    renderTime({ slots: [], party });
    fireEvent.click(
      within(columns()[3] as HTMLElement).getByRole('button', { name: 'Velg 15:00 samtidig' })
    );
    expect(onPick).toHaveBeenCalledWith(alternative);
    expect(within(columns()[2] as HTMLElement).getByText('Ingen ledige')).toBeInTheDocument();
  });

  it('keeps the columns but draws no grid without the week words', () => {
    const { 'time.week.none': _none, 'time.week.more': _more, ...labels } = timeLabelsNb;
    renderTime({ slots: [at(9)], labels });
    expect(screen.getByTestId('time-columns')).toBeInTheDocument();
    expect(screen.queryByTestId('time-week')).toBeNull();
  });

  it('draws no grid for a strip longer than a week', () => {
    const fortnight = Array.from({ length: 10 }, (_, index) => osloTs(12, 0, 14 + index));
    renderTime({ slots: [at(9)], days: fortnight });
    expect(screen.queryByTestId('time-week')).toBeNull();
    expect(screen.getByTestId('time-columns')).not.toHaveClass('lg:hidden');
  });

  it('hides the columns from lg when the grid takes over', () => {
    renderTime({ slots: [at(9)] });
    expect(screen.getByTestId('time-columns')).toHaveClass('lg:hidden');
    expect(week()).toHaveClass('hidden', 'lg:block');
  });

  it('keeps a simultaneous time to its hour in the narrow week column', () => {
    const KIDS: WizardService = {
      id: 'svc-kids',
      name: 'Barneklipp',
      category: 'kids',
      durationMinutes: 30,
      bufferBeforeMinutes: 0,
      bufferAfterMinutes: 0,
      priceOre: 49_000,
      maxPerBooking: 3,
      weekendSurchargePct: 0,
    };
    const startTs = osloTs(15);
    const slot: PartySlot = {
      startTs,
      mode: 'parallel',
      seats: [
        { startTs, resourceId: 'res-ada' },
        { startTs, resourceId: 'res-bo' },
      ],
    };
    const party: TimeScreenParty = {
      items: [{ service: KIDS }, { service: KIDS }],
      mode: 'parallel',
      slots: [slot],
      chipEndTs: (party) => party.startTs + 30 * MINUTE,
      resolveStylistName: (id) => (id === 'res-ada' ? 'Ada' : 'Bo'),
      onPick: vi.fn(),
    };
    renderTime({ slots: [], party });
    const name = '15:00 (Barneklipp hos Ada · Barneklipp hos Bo)';
    const chip = within(week()).getByRole('button', { name });
    expect(chip.textContent).toBe('15:00');
    expect(chip).toHaveAttribute('title', name);
  });

  it('has no axe violations', async () => {
    const { container } = renderTime({ slots: [at(9), at(10, 0, 18)], dayFullness: true });
    expect(await axe(container)).toHaveNoViolations();
  });
});
