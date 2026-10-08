import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import {
  DEMO_NOW,
  demoDaypartsNb,
  demoFormatNb,
} from '../../../src/booking/__stories__/fixtures.js';
import { timeLabelsNb } from '../../../src/booking/__stories__/labels.time.js';
import {
  DefaultTimeChip,
  TakenToast,
  type TimeChipProps,
  TimeScreen,
  type TimeScreenParty,
  type TimeScreenProps,
  TimeScreenSkeleton,
} from '../../../src/booking/time-screen.js';
import type {
  BookingDayDto,
  BookingSlotDto,
  PartySlot,
  WizardItem,
  WizardService,
} from '../../../src/booking/types.js';

const pad = (value: number) => String(value).padStart(2, '0');
const MINUTE = 60_000;

/**
 * An Oslo wall-clock instant in September 2026 (CEST, UTC+02:00), spelled out
 * so the runner's own zone cannot move it. Thursday the 17th by default; the
 * 19th is the Saturday, the 20th the Sunday. DEMO_NOW is Monday the 14th.
 */
function osloTs(hour: number, minute = 0, day = 17): number {
  return Date.parse(`2026-09-${pad(day)}T${pad(hour)}:${pad(minute)}:00+02:00`);
}
function at(hour: number, minute = 0, day = 17): BookingSlotDto {
  return { startTs: osloTs(hour, minute, day), resourceId: 'res-ada' };
}

/** Prices are read exactly, non-breaking spaces and all. */
const exactly = (text: string) => text;

function renderTime(props: Partial<TimeScreenProps> & Pick<TimeScreenProps, 'slots'>) {
  return render(
    <TimeScreen
      labels={timeLabelsNb}
      format={demoFormatNb}
      dayparts={demoDaypartsNb}
      now={DEMO_NOW}
      onPick={vi.fn()}
      {...props}
    />
  );
}

/** A basket that pays 10 % at the weekend: 490 → 539 kr. */
const weekendNote = (dayTs: number) => ({
  pct: 10,
  priceOre: demoFormatNb.clock.isWeekend(dayTs) ? 53_900 : 49_000,
});

afterEach(() => {
  vi.useRealTimers();
});

describe('TimeScreen', () => {
  it('asks the question', () => {
    renderTime({ slots: [at(9)] });
    expect(screen.getByRole('heading', { name: timeLabelsNb['time.heading'] })).toBeInTheDocument();
  });

  it('groups slots into the dayparts', () => {
    renderTime({ slots: [at(9), at(13), at(18)] });
    expect(screen.getByText('Formiddag')).toBeTruthy();
    expect(screen.getByText('Ettermiddag')).toBeTruthy();
    expect(screen.getByText('Kveld')).toBeTruthy();
  });

  it('puts each slot under its own daypart, on the business clock', () => {
    renderTime({ slots: [at(11, 59), at(12), at(16, 59), at(17)] });
    const section = (name: string) =>
      within(screen.getByRole('heading', { name }).parentElement as HTMLElement);

    expect(section('Formiddag').getByRole('button', { name: /11:59/ })).toBeInTheDocument();
    expect(
      section('Ettermiddag')
        .getAllByRole('button')
        .map((b) => b.textContent)
    ).toEqual(['12:00', '16:59']);
    expect(section('Kveld').getByRole('button', { name: /17:00/ })).toBeInTheDocument();
  });

  it('does not head a daypart with nothing in it', () => {
    renderTime({ slots: [at(9)] });
    expect(screen.getByText('Formiddag')).toBeInTheDocument();
    expect(screen.queryByText('Ettermiddag')).toBeNull();
    expect(screen.queryByText('Kveld')).toBeNull();
  });

  it('hands back the whole slot, so «first available» keeps the stylist it resolved to', () => {
    const onPick = vi.fn();
    renderTime({ slots: [at(9)], onPick });
    fireEvent.click(screen.getByRole('button', { name: /09:00/ }));
    expect(onPick).toHaveBeenCalledWith(at(9));
  });

  it('offers one chip per instant when several stylists are free for it', () => {
    renderTime({
      slots: [
        { ...at(11), resourceId: 'res-ada' },
        { ...at(11), resourceId: 'res-bo' },
        { ...at(11, 15), resourceId: 'res-ada' },
        { ...at(11, 15), resourceId: 'res-bo' },
      ],
    });
    expect(
      screen.getAllByRole('button', { name: /^\d\d:\d\d$/ }).map((b) => b.textContent)
    ).toEqual(['11:00', '11:15']);
  });

  it('submits the stylist the surviving chip resolved to, not a null one', () => {
    const onPick = vi.fn();
    renderTime({
      slots: [
        { ...at(11), resourceId: 'res-ada' },
        { ...at(11), resourceId: 'res-bo' },
      ],
      onPick,
    });
    fireEvent.click(screen.getByRole('button', { name: '11:00' }));
    expect(onPick).toHaveBeenCalledWith({ ...at(11), resourceId: 'res-ada' });
  });

  it('offers the nearest alternatives when the chosen slot was taken', () => {
    renderTime({ slots: [at(14, 45), at(15, 15)], takenSlotTs: osloTs(15) });
    expect(
      screen.getAllByRole('button', { name: new RegExp(timeLabelsNb['time.nearest']) })
    ).toHaveLength(2);
  });

  it('points at the two closest, not at the whole day', () => {
    renderTime({ slots: [at(9), at(14, 45), at(15, 15)], takenSlotTs: osloTs(15) });
    const nearest = new RegExp(timeLabelsNb['time.nearest']);
    expect(screen.getByRole('button', { name: /14:45/ })).toHaveAccessibleName(nearest);
    expect(screen.getByRole('button', { name: /15:15/ })).toHaveAccessibleName(nearest);
    expect(screen.getByRole('button', { name: /09:00/ })).not.toHaveAccessibleName(nearest);
  });

  it('keeps the weekend-surcharge row on a weekday, empty, so a day tap cannot move the grid', () => {
    const saturday = at(11, 0, 19);
    const thursday = at(11);
    const { container } = renderTime({
      slots: [thursday, saturday],
      days: [thursday.startTs, saturday.startTs],
      weekendNote,
    });
    const row = container.querySelector('[data-testid="surcharge-row"]');
    expect(row).toHaveClass('min-h-5');
    expect(row).toBeEmptyDOMElement();
    fireEvent.click(screen.getByRole('button', { name: 'lør. 19.' }));
    expect(container.querySelector('[data-testid="surcharge-row"]')).toHaveTextContent(
      /helgetillegg/
    );
  });

  it('reserves no surcharge row for a basket that never pays one', () => {
    const { container } = renderTime({ slots: [at(11)], weekendNote: () => null });
    expect(container.querySelector('[data-testid="surcharge-row"]')).toBeNull();
  });

  it('warns about the weekend surcharge only on the weekend, with the real price', () => {
    const saturday = at(11, 0, 19);
    const thursday = at(11);
    renderTime({
      slots: [thursday, saturday],
      days: [thursday.startTs, saturday.startTs],
      weekendNote,
    });
    expect(screen.queryByText(/helgetillegg/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'lør. 19.' }));
    expect(
      screen.getByText('Helg: +10\u00a0% helgetillegg (539\u00a0kr)', { normalizer: exactly })
    ).toBeInTheDocument();
  });

  it('lands the visitor back on the day the slot was stolen from', () => {
    renderTime({ slots: [at(9), at(9, 0, 18)], takenSlotTs: osloTs(10, 0, 18) });
    expect(screen.getByRole('button', { name: 'fre. 18.' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: /09:00/ })).toHaveAccessibleName(
      new RegExp(timeLabelsNb['time.nearest'])
    );
  });

  it('says nothing about a stolen slot when none was', () => {
    renderTime({ slots: [at(14, 45)] });
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('never leaves a fully-booked day as a dead end', () => {
    renderTime({ slots: [], phone: '22334455' });
    expect(screen.getByText(/Ingen ledige tider/)).toBeTruthy();
    expect(screen.getByRole('link', { name: /Ring oss/ })).toHaveAttribute(
      'href',
      expect.stringContaining('tel:')
    );
  });

  it('still says it, unlinked, when there is no number yet', () => {
    renderTime({ slots: [], phone: null });
    expect(screen.getByText(/Ingen ledige tider/)).toBeTruthy();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('jumps to the next day that has anything, from a day that has nothing', () => {
    const friday = at(9, 0, 18);
    renderTime({ slots: [friday], days: [osloTs(9), friday.startTs] });
    expect(screen.getByText(/Ingen ledige tider/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: timeLabelsNb['time.nextFree'] }));
    expect(screen.getByRole('button', { name: /09:00/ })).toBeInTheDocument();
    expect(screen.queryByText(/Ingen ledige tider/)).toBeNull();
  });

  it('routes today’s short notice to the phone rather than pretending it is bookable', () => {
    renderTime({ slots: [at(15)], phone: '22 33 44 55', now: osloTs(7) });
    expect(screen.getByRole('link', { name: timeLabelsNb['time.shortNotice'] })).toHaveAttribute(
      'href',
      'tel:22334455'
    );
  });

  it('keeps the short-notice line off a day that is not today', () => {
    renderTime({ slots: [at(15)], phone: '22 33 44 55', now: osloTs(7, 0, 16) });
    expect(screen.queryByText(timeLabelsNb['time.shortNotice'])).toBeNull();
  });

  it('has no axe violations', async () => {
    const { container } = renderTime({
      slots: [at(9), at(13), at(9, 0, 18)],
      days: [osloTs(9), osloTs(9, 0, 18)],
      monthView: true,
      weekendNote,
      phone: '22 33 44 55',
    });
    fireEvent.click(screen.getByRole('button', { name: timeLabelsNb['time.month.show'] }));
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    ).toHaveNoViolations();
  });
});

describe('TimeScreen — keyboard', () => {
  /**
   * The day strip and the time grid are native `aria-pressed` / plain buttons
   * in a fieldset — no roving tabindex — so every chip is its own Tab stop in
   * reading order and Enter / Space activate it natively.
   */
  it('puts every day chip in the tab order, in date order, as a native toggle button', () => {
    renderTime({
      slots: [at(9), at(9, 0, 18), at(9, 0, 19)],
      days: [osloTs(9), osloTs(9, 0, 18), osloTs(9, 0, 19)],
    });
    const group = screen.getByRole('group', { name: timeLabelsNb['time.dayStrip.legend'] });
    const chips = within(group).getAllByRole('button');
    expect(chips.map((chip) => chip.textContent)).toEqual(['tor. 17.', 'fre. 18.', 'lør. 19.']);
    for (const chip of chips) {
      expect(chip.tagName).toBe('BUTTON');
      expect(chip).toHaveAttribute('type', 'button');
      expect(chip).not.toHaveAttribute('tabindex');
      expect(chip).not.toBeDisabled();
      expect(chip).toHaveAttribute('aria-pressed');
    }
    expect(chips.filter((chip) => chip.getAttribute('aria-pressed') === 'true')).toHaveLength(1);
  });

  it('keeps focus on a day chip when it is chosen, and moves the grid under it', () => {
    renderTime({ slots: [at(9), at(13, 0, 18)], days: [osloTs(9), osloTs(9, 0, 18)] });
    const friday = screen.getByRole('button', { name: 'fre. 18.' });
    friday.focus();
    expect(friday).toHaveFocus();
    fireEvent.click(friday);
    // The same element, still focused: a keyboard user is not thrown back to
    // the top of the page by choosing a day.
    expect(screen.getByRole('button', { name: 'fre. 18.' })).toBe(friday);
    expect(friday).toHaveFocus();
    expect(friday).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'tor. 17.' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    expect(screen.getByRole('button', { name: '13:00' })).toBeInTheDocument();
  });

  it('makes every time chip a Tab stop in time order, and skips the current hour', () => {
    const onPick = vi.fn();
    renderTime({ slots: [at(9), at(12), at(17, 30)], currentSlotTs: osloTs(10), onPick });
    const buttons = screen
      .getAllByRole('button')
      .filter((button) => /\d\d:\d\d/.test(button.textContent ?? ''));
    expect(buttons.map((button) => button.textContent)).toEqual([
      '09:00',
      '10:00 · Din time nå',
      '12:00',
      '17:30',
    ]);
    const current = buttons[1] as HTMLButtonElement;
    // Disabled, so a Tab never lands on it and Enter can never move the
    // appointment onto itself.
    expect(current).toBeDisabled();
    expect(current).toHaveAttribute('aria-current', 'true');
    for (const chip of [buttons[0], buttons[2], buttons[3]] as HTMLButtonElement[]) {
      expect(chip).toHaveAttribute('type', 'button');
      expect(chip).not.toHaveAttribute('tabindex');
      expect(chip).not.toBeDisabled();
    }
    fireEvent.click(current);
    expect(onPick).not.toHaveBeenCalled();
  });

  it('draws the month grid with only the offered dates focusable', () => {
    renderTime({
      slots: [at(11), at(13, 0, 18)],
      days: [osloTs(9), osloTs(9, 0, 18)],
      monthView: true,
      now: osloTs(9),
    });
    fireEvent.click(screen.getByRole('button', { name: timeLabelsNb['time.month.show'] }));
    // Inert cells are spans — not buttons with tabindex=-1 — so Tab goes from
    // one offered date straight to the next.
    const cell = screen.getByText('24');
    expect(cell.tagName).toBe('SPAN');
    const tomorrow = screen.getByRole('button', { name: 'i morgen' });
    expect(tomorrow).toHaveAttribute('type', 'button');
    expect(tomorrow).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows a week of chips and keeps the rest of the window in the month', () => {
    const days = Array.from({ length: 12 }, (_, index) => 17 + index);
    renderTime({
      slots: [...days.slice(0, 11).map((day) => at(9, 0, day)), at(15, 0, 28)],
      days: days.map((day) => osloTs(9, 0, day)),
      monthView: true,
      now: osloTs(9),
    });
    const group = screen.getByRole('group', { name: timeLabelsNb['time.dayStrip.legend'] });
    expect(within(group).getAllByRole('button')).toHaveLength(7);
    expect(screen.queryByRole('button', { name: '15:00' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: timeLabelsNb['time.month.show'] }));
    const later = screen.getByText('28');
    expect(later.tagName).toBe('BUTTON');
    fireEvent.click(later);
    expect(screen.getByRole('button', { name: '15:00' })).toBeInTheDocument();
    // The week on screen follows the day that was picked, so a chip shows it.
    expect(within(group).getByRole('button', { name: 'man. 28.' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });
});

describe('TimeScreen — open, shut, or done for the day', () => {
  const A_THURSDAY_MORNING = osloTs(11);
  const A_THURSDAY_EVENING = osloTs(18, 45);
  const A_SUNDAY_MIDDAY = osloTs(12, 0, 20);

  /** One open date; the last start defaults to 16:30 against a 17:00 close. */
  function openDay(
    day: number,
    {
      opens = 10,
      closes = 17,
      lastStart = [16, 30],
    }: { opens?: number; closes?: number; lastStart?: [number, number] | null } = {}
  ): BookingDayDto {
    return {
      dayKey: `2026-09-${pad(day)}`,
      opensTs: osloTs(opens, 0, day),
      closesTs: osloTs(closes, 0, day),
      lastStartTs: lastStart === null ? null : osloTs(lastStart[0], lastStart[1], day),
    };
  }

  it('says the business is shut on a day it keeps no hours on', () => {
    renderTime({
      slots: [],
      days: [osloTs(12, 0, 20)],
      openDays: [],
      phone: '22334455',
      now: A_SUNDAY_MIDDAY,
    });
    expect(screen.getByText(/Stengt i dag/)).toBeTruthy();
    expect(screen.queryByText(/Fullbooket/)).toBeNull();
  });

  it('offers no telephone on a day it is shut, because nobody is there', () => {
    renderTime({
      slots: [],
      days: [osloTs(12, 0, 20)],
      openDays: [],
      phone: '22334455',
      now: A_SUNDAY_MIDDAY,
    });
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('says the day is over, not that it is full, once the last start has passed', () => {
    renderTime({
      slots: [],
      days: [osloTs(12)],
      openDays: [openDay(17)],
      phone: '22334455',
      now: A_THURSDAY_EVENING,
    });
    expect(screen.getByText(/Ikke flere tider i dag/)).toBeTruthy();
    expect(screen.queryByText(/Fullbooket/)).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('still says full, with the telephone, when the day is open and taken', () => {
    renderTime({
      slots: [],
      days: [osloTs(12)],
      openDays: [openDay(17)],
      phone: '22334455',
      now: A_THURSDAY_MORNING,
    });
    expect(screen.getByText(/Fullbooket i dag/)).toBeTruthy();
    expect(screen.getByRole('link', { name: /Ring oss/ })).toHaveAttribute(
      'href',
      expect.stringContaining('tel:')
    );
  });

  it('says shut, not full, on a holiday with posted hours', () => {
    renderTime({
      slots: [],
      days: [osloTs(12)],
      openDays: [openDay(17, { lastStart: null })],
      phone: '22334455',
      now: A_THURSDAY_MORNING,
    });
    expect(screen.getByText(/Stengt i dag/)).toBeTruthy();
    expect(screen.queryByText(/Fullbooket i dag –/)).toBeNull();
  });

  it('will not claim a day is full when the visitor asked for one stylist', () => {
    renderTime({
      slots: [],
      days: [osloTs(12)],
      openDays: [openDay(17)],
      stylistName: 'Bo',
      phone: '22334455',
      now: A_THURSDAY_MORNING,
    });
    expect(screen.getByText(/Bo er fullbooket i dag/)).toBeTruthy();
    expect(screen.queryByText(/^Fullbooket/)).toBeNull();
    expect(screen.getByRole('link', { name: /Ring oss/ })).toBeTruthy();
  });

  it('falls back to the copy that is true whatever the hours are, when they failed to load', () => {
    renderTime({
      slots: [],
      days: [osloTs(12)],
      openDays: null,
      phone: '22334455',
      now: A_THURSDAY_EVENING,
    });
    expect(screen.getByText(/Ingen ledige tider i dag/)).toBeTruthy();
    expect(screen.queryByText(/Stengt/)).toBeNull();
    expect(screen.queryByText(/Fullbooket/)).toBeNull();
  });

  it('never hides a day that has something bookable on it', () => {
    renderTime({
      slots: [at(19)],
      days: [osloTs(12), osloTs(12, 0, 18)],
      openDays: [openDay(17), openDay(18)],
      now: A_THURSDAY_EVENING,
    });
    expect(screen.getByRole('button', { name: 'I dag' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /19:00/ })).toBeInTheDocument();
  });

  it('keeps a shut day out of the date strip entirely', () => {
    renderTime({
      slots: [at(12, 0, 18)],
      days: [osloTs(12), osloTs(12, 0, 18), osloTs(12, 0, 20)],
      openDays: [openDay(17), openDay(18)],
      now: A_THURSDAY_MORNING,
    });
    expect(screen.getByRole('button', { name: 'I dag' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'I morgen' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /søn/ })).toBeNull();
  });

  it('drops today from the strip once the day is done', () => {
    renderTime({
      slots: [at(12, 0, 18)],
      days: [osloTs(12), osloTs(12, 0, 18)],
      openDays: [openDay(17), openDay(18)],
      now: A_THURSDAY_EVENING,
    });
    expect(screen.queryByRole('button', { name: 'I dag' })).toBeNull();
    expect(screen.getByRole('button', { name: /12:00/ })).toBeInTheDocument();
  });

  it('keeps the day a slot was stolen from, even after that day is over', () => {
    renderTime({
      slots: [at(12, 0, 18)],
      days: [osloTs(12), osloTs(12, 0, 18)],
      openDays: [openDay(17), openDay(18)],
      takenSlotTs: osloTs(16),
      now: A_THURSDAY_EVENING,
    });
    expect(screen.getByRole('button', { name: 'I dag' })).toBeInTheDocument();
  });
});

describe('TimeScreen — a family', () => {
  const KIDS: WizardService = {
    id: 'svc-kids',
    name: 'Barneklipp',
    category: 'kids',
    durationMinutes: 30,
    bufferBeforeMinutes: 0,
    bufferAfterMinutes: 0,
    priceOre: 49_000,
    maxPerBooking: 3,
    weekendSurchargePct: 10,
  };
  const CUT: WizardService = { ...KIDS, id: 'svc-cut', name: 'Klipp' };
  const ITEMS: WizardItem[] = [{ service: KIDS }, { service: CUT }];
  const stylistName = (resourceId: string) =>
    ({ 'res-ada': 'Ada', 'res-bo': 'Bo' })[resourceId] ?? null;

  function sequentialAt(hour: number, day = 17): PartySlot {
    const startTs = osloTs(hour, 0, day);
    return {
      startTs,
      mode: 'sequential',
      seats: [
        { startTs, resourceId: 'res-ada' },
        { startTs: startTs + 30 * MINUTE, resourceId: 'res-ada' },
      ],
    };
  }
  function parallelAt(hour: number): PartySlot {
    const startTs = osloTs(hour);
    return {
      startTs,
      mode: 'parallel',
      seats: [
        { startTs, resourceId: 'res-ada' },
        { startTs, resourceId: 'res-bo' },
      ],
    };
  }
  function party(overrides: Partial<TimeScreenParty>): TimeScreenParty {
    return {
      items: ITEMS,
      mode: 'sequential',
      slots: [],
      chipEndTs: (slot) => slot.startTs + 60 * MINUTE,
      resolveStylistName: stylistName,
      onPick: vi.fn(),
      ...overrides,
    };
  }

  it('shows a back-to-back visit as one chip that says when it ends', () => {
    const onPick = vi.fn();
    const slot = sequentialAt(15);
    renderTime({ slots: [], days: [slot.startTs], party: party({ slots: [slot], onPick }) });
    fireEvent.click(screen.getByRole('button', { name: '15:00 → 16:00' }));
    expect(onPick).toHaveBeenCalledWith(slot);
  });

  it('names both stylists on a simultaneous chip', () => {
    const slot = parallelAt(15);
    renderTime({
      slots: [],
      days: [slot.startTs],
      party: party({ mode: 'parallel', slots: [slot] }),
    });
    expect(
      screen.getByRole('button', { name: '15:00 (Barneklipp hos Ada · Klipp hos Bo)' })
    ).toBeInTheDocument();
  });

  it('uses the people’s names once they have been given', () => {
    const slot = parallelAt(15);
    renderTime({
      slots: [],
      days: [slot.startTs],
      party: party({
        mode: 'parallel',
        slots: [slot],
        items: [
          { service: KIDS, bookedForName: 'Mia' },
          { service: CUT, bookedForName: 'Leo' },
        ],
      }),
    });
    expect(
      screen.getByRole('button', { name: '15:00 (Mia hos Ada · Leo hos Bo)' })
    ).toBeInTheDocument();
  });

  it('names a multi-service visit by all its services, joined', () => {
    const slot = parallelAt(15);
    renderTime({
      slots: [],
      days: [slot.startTs],
      party: party({
        mode: 'parallel',
        slots: [slot],
        items: [{ service: KIDS, extraServices: [CUT] }, { service: CUT }],
      }),
    });
    expect(
      screen.getByRole('button', { name: '15:00 (Barneklipp + Klipp hos Ada · Klipp hos Bo)' })
    ).toBeInTheDocument();
  });

  it('leaves a seat the basket does not cover unnamed rather than «undefined»', () => {
    const slot = parallelAt(15);
    renderTime({
      slots: [],
      days: [slot.startTs],
      party: party({ mode: 'parallel', slots: [slot], items: [{ service: KIDS }] }),
    });
    const chip = screen.getByRole('button', { name: /^15:00 \(Barneklipp hos Ada/ });
    expect(chip.textContent).not.toMatch(/undefined/);
    expect(chip).toHaveAccessibleName(/hos Bo\)$/);
  });

  it('offers the simultaneous alternative rather than an empty day', () => {
    const onPick = vi.fn();
    const alternative = parallelAt(15);
    const alternativeFor = vi.fn(() => alternative);
    renderTime({
      slots: [],
      days: [alternative.startTs],
      phone: '22334455',
      party: party({ alternativeFor, onPick }),
    });
    expect(
      screen.getByText(
        'Ingen tider etter hverandre torsdag – men dere kan komme samtidig kl. 15:00.'
      )
    ).toBeInTheDocument();
    // Asked about the day actually on screen.
    expect(alternativeFor).toHaveBeenCalledWith(alternative.startTs);
    expect(screen.queryByText(/Ingen ledige tider/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Velg 15:00 samtidig' }));
    expect(onPick).toHaveBeenCalledWith(alternative);
  });

  it('keeps the telephone for a day that has nothing either way', () => {
    renderTime({
      slots: [],
      days: [osloTs(15)],
      phone: '22334455',
      party: party({ alternativeFor: () => null }),
    });
    expect(screen.getByText(/Ingen ledige tider/)).toBeInTheDocument();
    expect(screen.queryByText(/kan komme samtidig/)).toBeNull();
  });

  it('says nothing about simultaneity on a day that has back-to-back times', () => {
    renderTime({
      slots: [],
      days: [osloTs(15)],
      party: party({ slots: [sequentialAt(17)], alternativeFor: () => parallelAt(15) }),
    });
    expect(screen.getByRole('button', { name: '17:00 → 18:00' })).toBeInTheDocument();
    expect(screen.queryByText(/kan komme samtidig/)).toBeNull();
  });

  it('asks for no alternative in parallel mode', () => {
    const alternativeFor = vi.fn(() => parallelAt(15));
    renderTime({
      slots: [],
      days: [osloTs(15)],
      party: party({ mode: 'parallel', alternativeFor }),
    });
    expect(alternativeFor).not.toHaveBeenCalled();
  });

  it('quotes the weekend surcharge for the whole family', () => {
    const saturday = osloTs(11, 0, 19);
    renderTime({
      slots: [],
      days: [saturday],
      weekendNote: () => ({ pct: 10, priceOre: 107_800 }),
      party: party({ slots: [sequentialAt(11, 19)] }),
    });
    expect(
      screen.getByText('Helg: +10\u00a0% helgetillegg (1\u00a0078\u00a0kr)', {
        normalizer: exactly,
      })
    ).toBeInTheDocument();
  });

  it('names no percentage when the basket carries more than one rate', () => {
    renderTime({
      slots: [],
      days: [osloTs(11, 0, 19)],
      weekendNote: () => ({ pct: null, priceOre: 110_250 }),
      party: party({}),
    });
    expect(
      screen.getByText('Helg: inkludert helgetillegg (1\u00a0103\u00a0kr)', { normalizer: exactly })
    ).toBeInTheDocument();
  });

  describe('the month view', () => {
    const A_THURSDAY = osloTs(9);

    function renderMonth() {
      return renderTime({
        monthView: true,
        slots: [at(11), at(13, 0, 18)],
        days: [A_THURSDAY, osloTs(9, 0, 18)],
        now: A_THURSDAY,
      });
    }

    it('is collapsed until it is asked for', () => {
      renderMonth();
      expect(screen.getByRole('button', { name: /Se hele måneden/ })).toHaveAttribute(
        'aria-expanded',
        'false'
      );
      expect(screen.queryByText('September 2026')).toBeNull();
    });

    it('opens on the month the chosen day is in, and closes again', () => {
      renderMonth();
      fireEvent.click(screen.getByRole('button', { name: /Se hele måneden/ }));
      expect(screen.getByText('September 2026')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /Skjul måneden/ }));
      expect(screen.queryByText('September 2026')).toBeNull();
    });

    it('steps a month at a time in both directions', () => {
      renderMonth();
      fireEvent.click(screen.getByRole('button', { name: /Se hele måneden/ }));
      fireEvent.click(screen.getByRole('button', { name: 'Neste måned' }));
      expect(screen.getByText('Oktober 2026')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Forrige måned' }));
      expect(screen.getByText('September 2026')).toBeInTheDocument();
      for (const month of ['August 2026', 'Juli 2026']) {
        fireEvent.click(screen.getByRole('button', { name: 'Forrige måned' }));
        expect(screen.getByText(month)).toBeInTheDocument();
      }
    });

    it('offers only the days availability was asked about', () => {
      renderMonth();
      fireEvent.click(screen.getByRole('button', { name: /Se hele måneden/ }));
      const grid = screen.getByText('September 2026').closest('div') as HTMLElement;
      const dates = within(grid.parentElement as HTMLElement)
        .getAllByRole('button')
        .map((button) => button.textContent)
        .filter((text) => /^\d+$/.test(text ?? ''));
      expect(dates).toEqual(['17', '18']);
      expect(screen.getByText('24')).not.toHaveAttribute('type');
    });

    it('puts the first of the month under its weekday', () => {
      renderMonth();
      fireEvent.click(screen.getByRole('button', { name: /Se hele måneden/ }));
      // 1 September 2026 is a Tuesday: one blank cell before it.
      const first = screen.getByText('1');
      const cells = Array.from(first.parentElement?.children ?? []);
      expect(cells.indexOf(first)).toBe(1);
      expect(cells).toHaveLength(1 + 30);
    });

    it('changes the day the times are listed for', () => {
      renderMonth();
      expect(screen.getByRole('button', { name: '11:00' })).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /Se hele måneden/ }));
      fireEvent.click(screen.getByRole('button', { name: 'i morgen' }));
      expect(screen.getByRole('button', { name: '13:00' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '11:00' })).toBeNull();
    });

    it('says nothing about a month unless the caller asks for one', () => {
      renderTime({ slots: [at(11)], now: A_THURSDAY });
      expect(screen.queryByRole('button', { name: /hele måneden/ })).toBeNull();
    });
  });
});

describe('TimeScreen — override ladder', () => {
  it('shows a labels override', () => {
    render(
      <TimeScreen
        labels={{ ...timeLabelsNb, 'time.heading': 'Velg et tidspunkt' }}
        format={demoFormatNb}
        dayparts={demoDaypartsNb}
        now={DEMO_NOW}
        slots={[at(9)]}
        onPick={vi.fn()}
      />
    );
    expect(screen.getByRole('heading', { name: 'Velg et tidspunkt' })).toBeInTheDocument();
  });

  it('lands classNames on their slots', () => {
    renderTime({
      slots: [at(9), at(9, 0, 18)],
      days: [osloTs(9), osloTs(9, 0, 18)],
      classNames: { root: 'root-x', chip: 'chip-x', dayChipSelected: 'day-x' },
    });
    expect(
      screen.getByRole('heading', { name: timeLabelsNb['time.heading'] }).parentElement
    ).toHaveClass('root-x');
    expect(screen.getByRole('button', { name: '09:00' })).toHaveClass('chip-x');
    expect(screen.getByRole('button', { name: 'tor. 17.' })).toHaveClass('day-x');
    expect(screen.getByRole('button', { name: 'fre. 18.' })).not.toHaveClass('day-x');
  });

  it('replaces the time chip and the day chip with components overrides', () => {
    const onPick = vi.fn();
    function Wrapped(props: TimeChipProps) {
      return (
        <span data-testid="wrapped-chip">
          <DefaultTimeChip {...props} label={`«${props.label}»`} />
        </span>
      );
    }
    renderTime({
      slots: [at(9), at(9, 0, 18)],
      days: [osloTs(9), osloTs(9, 0, 18)],
      onPick,
      components: {
        TimeChip: Wrapped,
        DayChip: ({ label, onSelect }) => (
          <button type="button" data-testid="custom-day" onClick={onSelect}>
            {label}
          </button>
        ),
      },
    });
    expect(screen.getAllByTestId('custom-day')).toHaveLength(2);
    expect(screen.getByTestId('wrapped-chip')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '«09:00»' }));
    expect(onPick).toHaveBeenCalledWith(at(9));
  });
});

describe('TimeScreenSkeleton', () => {
  it('holds the step’s shape — heading, a day strip and a grid of chips — while loading', async () => {
    const { container } = render(<TimeScreenSkeleton labels={timeLabelsNb} days={7} />);
    expect(screen.getByRole('heading', { name: timeLabelsNb['time.heading'] })).toBeInTheDocument();
    await act(async () => {});
    expect(screen.getByRole('status')).toHaveTextContent(timeLabelsNb['time.loading']);
    const chips = container.querySelectorAll('[data-testid="day-chip-skeleton"]');
    expect(chips).toHaveLength(7);
    const { container: wide } = render(
      <TimeScreenSkeleton labels={timeLabelsNb} days={62} monthView />
    );
    expect(wide.querySelectorAll('[data-testid="day-chip-skeleton"]')).toHaveLength(7);
    for (const chip of chips) expect(chip).toHaveClass('h-8');
    const slots = container.querySelectorAll('[data-testid="slot-skeleton"]');
    expect(slots.length).toBeGreaterThan(0);
    for (const slot of slots) expect(slot).toHaveClass('py-[15px]', 'min-w-20');
  });

  it('reserves the weekend-surcharge row only when told the basket pays one', () => {
    const { container, rerender } = render(
      <TimeScreenSkeleton labels={timeLabelsNb} surchargeRow />
    );
    expect(container.querySelector('[data-testid="surcharge-row-skeleton"]')).toHaveClass(
      'min-h-5'
    );
    rerender(<TimeScreenSkeleton labels={timeLabelsNb} />);
    expect(container.querySelector('[data-testid="surcharge-row-skeleton"]')).toBeNull();
  });
});

describe('TakenToast', () => {
  it('is an empty live region until a slot is lost, then a fixed toast', () => {
    const { rerender } = render(<TakenToast labels={timeLabelsNb} takenSlotTs={null} />);
    const region = screen.getByRole('status');
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toBeEmptyDOMElement();

    rerender(<TakenToast labels={timeLabelsNb} takenSlotTs={osloTs(15)} />);
    expect(screen.getByRole('status')).toBe(region);
    expect(region).toHaveTextContent(timeLabelsNb['time.taken.message']);
    expect(region).toHaveClass('fixed');
  });

  it('closes on the close button, and on its own after a while', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const { rerender } = render(<TakenToast labels={timeLabelsNb} takenSlotTs={osloTs(15)} />);
    fireEvent.click(screen.getByRole('button', { name: timeLabelsNb['time.taken.close'] }));
    expect(screen.getByRole('status')).toBeEmptyDOMElement();

    rerender(<TakenToast labels={timeLabelsNb} takenSlotTs={osloTs(16)} />);
    expect(screen.getByRole('status')).toHaveTextContent(timeLabelsNb['time.taken.message']);
    act(() => {
      vi.advanceTimersByTime(8000);
    });
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });
});

describe('TimeScreen — finding a time fast', () => {
  const stylists: Record<string, { name: string; photoUrl?: string | null }> = {
    'res-ada': { name: 'Ada Demo', photoUrl: '/avatar/ada' },
    'res-bo': { name: 'Bo Eksempel' },
  };
  const resolveStylist = (id: string) => stylists[id] ?? null;
  const slot = (resourceId: string, hour: number, minute = 0, day = 17): BookingSlotDto => ({
    startTs: osloTs(hour, minute, day),
    resourceId,
  });

  it('puts the three earliest starts across the window first, with who each is with', () => {
    renderTime({
      slots: [
        slot('res-bo', 14, 0, 18),
        slot('res-ada', 10),
        slot('res-bo', 9, 30),
        slot('res-ada', 11, 0, 21),
      ],
      soonest: { resolveStylist },
    });

    const row = screen.getByRole('region', { name: 'Ledig snart' });
    const cards = within(row).getAllByRole('button');
    expect(cards).toHaveLength(3);
    expect(cards[0]).toHaveAccessibleName(
      `${demoFormatNb.clock.dayChip(osloTs(9, 30), DEMO_NOW)} kl. 09:30 hos Bo Eksempel`
    );
    expect(cards[1]).toHaveTextContent('10:00');
    expect(cards[1]).toHaveTextContent('Ada Demo');
    expect(cards[2]).toHaveTextContent('14:00');
  });

  it('books exactly the slot the card shows', () => {
    const onPick = vi.fn();
    const first = slot('res-bo', 9, 30);
    renderTime({ slots: [first, slot('res-ada', 10)], soonest: { resolveStylist }, onPick });

    fireEvent.click(
      within(screen.getByRole('region', { name: 'Ledig snart' })).getAllByRole(
        'button'
      )[0] as HTMLElement
    );
    expect(onPick).toHaveBeenCalledWith(first);
  });

  it('draws no soonest row without the prop, for a move, or with nothing free', () => {
    const { unmount } = renderTime({ slots: [slot('res-ada', 10)] });
    expect(screen.queryByRole('region', { name: 'Ledig snart' })).toBeNull();
    unmount();

    const moved = renderTime({
      slots: [slot('res-ada', 10)],
      soonest: {},
      currentSlotTs: osloTs(15),
    });
    expect(screen.queryByRole('region', { name: 'Ledig snart' })).toBeNull();
    moved.unmount();

    renderTime({ slots: [], soonest: {} });
    expect(screen.queryByRole('region', { name: 'Ledig snart' })).toBeNull();
  });

  it('marks how much room each day has, and says «fullt» on a day with none', () => {
    const many = Array.from({ length: 8 }, (_, index) => slot('res-ada', 9, index * 5, 17));
    renderTime({
      slots: [...many, slot('res-ada', 10, 0, 18)],
      days: [osloTs(12, 0, 17), osloTs(12, 0, 18), osloTs(12, 0, 16)],
      openDays: null,
      dayFullness: true,
    });

    const strip = screen.getByRole('group', {
      name: timeLabelsNb['time.dayStrip.legend'] as string,
    });
    const chips = within(strip).getAllByRole('button');
    const byText = (text: string) => chips.find((chip) => chip.textContent?.includes(text));

    expect(byText('8 ledige')?.querySelectorAll('[data-filled]')).toHaveLength(3);
    expect(byText('1 ledige')?.querySelectorAll('[data-filled]')).toHaveLength(1);
    expect(byText('fullt')).toBeDefined();
    for (const chip of chips) expect(chip.className).toContain('min-h-11');
  });

  it('keeps the plain chip without dayFullness', () => {
    renderTime({ slots: [slot('res-ada', 10)], days: [osloTs(12, 0, 17), osloTs(12, 0, 18)] });
    expect(screen.queryByTestId('day-free-marks')).toBeNull();
  });

  it('has no axe violations with both on', async () => {
    const { container } = renderTime({
      slots: [slot('res-bo', 9, 30), slot('res-ada', 10), slot('res-ada', 10, 0, 18)],
      days: [osloTs(12, 0, 17), osloTs(12, 0, 18)],
      soonest: { resolveStylist },
      dayFullness: true,
    });
    expect(await axe(container)).toHaveNoViolations();
  });
});
