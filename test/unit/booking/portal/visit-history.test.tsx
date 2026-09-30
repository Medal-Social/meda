import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { demoFormatNb as format } from '../../../../src/booking/__stories__/fixtures.js';
import { demoPortalBooking } from '../../../../src/booking/__stories__/fixtures.portal.js';
import { visitHistoryLabelsNb as labels } from '../../../../src/booking/__stories__/labels.portal.js';
import { fillLabel } from '../../../../src/booking/labels.js';
import {
  DefaultVisitRow,
  VisitHistory,
  type VisitHistoryProps,
  type VisitRowProps,
  visitHistoryYears,
} from '../../../../src/booking/portal/visit-history.js';
import type { PortalBookingDto } from '../../../../src/booking/types.js';

const NBSP = ' ';
const exactly = (text: string) => text;

const JUNE_2026 = Date.parse('2026-06-03T10:00:00+02:00');
const MAY_2026 = Date.parse('2026-05-20T10:00:00+02:00');
const NOVEMBER_2025 = Date.parse('2025-11-12T10:00:00+01:00');

function visit(overrides: Partial<PortalBookingDto> = {}): PortalBookingDto {
  return demoPortalBooking({
    bookingId: 'bk-1',
    status: 'completed',
    startTs: JUNE_2026,
    endTs: JUNE_2026 + 1_800_000,
    serviceName: 'Barneklipp',
    bookedForName: 'Mia',
    resourceName: 'Ada',
    amountOre: 49_000,
    managePath: null,
    ...overrides,
  });
}

function count(n: number, year: number) {
  return fillLabel(labels[n === 1 ? 'history.count.one' : 'history.count.other'], {
    count: n,
    year,
  });
}

function renderHistory(props: Partial<VisitHistoryProps> = {}) {
  return render(<VisitHistory past={[visit()]} labels={labels} format={format} {...props} />);
}

describe('VisitHistory', () => {
  it('lists a year’s visits with what each one cost, and what the year cost', () => {
    renderHistory({
      past: [
        visit(),
        visit({ bookingId: 'bk-2', startTs: MAY_2026, bookedForName: 'Leo', amountOre: 39_000 }),
      ],
    });

    expect(screen.getByRole('heading', { name: labels['history.heading'] })).toBeInTheDocument();
    expect(screen.getAllByText('Barneklipp')).toHaveLength(2);
    expect(screen.getByText(`490${NBSP}kr`, { normalizer: exactly })).toBeInTheDocument();
    expect(screen.getByText(/3\. juni · Mia · Ada/)).toBeInTheDocument();
    expect(screen.getByText(count(2, 2026))).toBeInTheDocument();
    expect(screen.getByText(`880${NBSP}kr`, { normalizer: exactly })).toBeInTheDocument();
  });

  it('offers a pill per year and opens on the newest', () => {
    renderHistory({ past: [visit(), visit({ bookingId: 'bk-3', startTs: NOVEMBER_2025 })] });

    expect(screen.getByRole('button', { name: '2026' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(count(1, 2026))).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '2025' }));

    expect(screen.getByRole('button', { name: '2025' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(count(1, 2025))).toBeInTheDocument();
    expect(screen.queryByText(count(1, 2026))).toBeNull();
  });

  it('draws no pills for a single year', () => {
    renderHistory();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('says so when there is nothing behind the user yet', () => {
    renderHistory({ past: [] });
    expect(screen.getByText(labels['history.empty'])).toBeInTheDocument();
  });

  it('shows a dash rather than a price that was not given', () => {
    renderHistory({ past: [visit({ amountOre: null })] });
    expect(screen.getAllByText(labels['history.unknownAmount'])).toHaveLength(2);
  });

  it('names a nameless service with the fallback', () => {
    renderHistory({ past: [visit({ serviceName: null })] });
    expect(screen.getByText(labels['history.serviceFallback'])).toBeInTheDocument();
  });

  it('takes precomputed `years`', () => {
    renderHistory({ past: [], years: [{ year: 2024, visits: [visit()], totalOre: 1000 }] });
    expect(screen.getByText(count(1, 2024))).toBeInTheDocument();
  });

  describe('overrides', () => {
    it('shows a labels override', () => {
      renderHistory({ labels: { ...labels, 'history.heading': 'Before' } });
      expect(screen.getByRole('heading', { name: 'Before' })).toBeInTheDocument();
    });

    it('lands classNames on their slots', () => {
      renderHistory({
        past: [visit(), visit({ bookingId: 'bk-3', startTs: NOVEMBER_2025 })],
        classNames: {
          root: 'x-root',
          yearChip: 'x-chip',
          yearChipSelected: 'x-chip-on',
          row: 'x-row',
          total: 'x-total',
        },
      });
      expect(screen.getByRole('button', { name: '2026' })).toHaveClass('x-chip', 'x-chip-on');
      expect(screen.getByRole('button', { name: '2025' })).not.toHaveClass('x-chip-on');
      expect(screen.getByRole('listitem')).toHaveClass('x-row');
      expect(screen.getByText(count(1, 2026)).closest('p')).toHaveClass('x-total');
    });

    it('replaces the row with `components.VisitRow`, which can wrap the default', () => {
      function Row(props: VisitRowProps) {
        return props.visit.bookingId === 'bk-2' ? (
          <li>Custom row</li>
        ) : (
          <DefaultVisitRow {...props} />
        );
      }
      renderHistory({
        past: [visit(), visit({ bookingId: 'bk-2', startTs: MAY_2026 })],
        components: { VisitRow: Row },
      });
      expect(screen.getByText('Custom row')).toBeInTheDocument();
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });
  });

  it('has no axe violations', async () => {
    const { container } = renderHistory({
      past: [visit(), visit({ bookingId: 'bk-3', startTs: NOVEMBER_2025 })],
    });
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    ).toHaveNoViolations();
  });
});

describe('visitHistoryYears', () => {
  it('counts only the visits that happened', () => {
    const years = visitHistoryYears(
      [visit(), visit({ bookingId: 'bk-x', status: 'cancelled', amountOre: 99_900 })],
      format.clock
    );
    expect(years).toHaveLength(1);
    expect(years[0].visits).toHaveLength(1);
    expect(years[0].totalOre).toBe(49_000);
  });

  it('groups by year, newest first, and sorts within a year', () => {
    const years = visitHistoryYears(
      [
        visit({ bookingId: 'old', startTs: NOVEMBER_2025 }),
        visit({ bookingId: 'mid', startTs: MAY_2026 }),
        visit({ bookingId: 'new', startTs: JUNE_2026 }),
      ],
      format.clock
    );
    expect(years.map((entry) => entry.year)).toEqual([2026, 2025]);
    expect(years[0].visits.map((entry) => entry.bookingId)).toEqual(['new', 'mid']);
  });

  it('reads the year off the business calendar, not UTC', () => {
    // 00:30 on 1 January in Oslo is still 31 December in UTC.
    const years = visitHistoryYears(
      [visit({ startTs: Date.parse('2026-01-01T00:30:00+01:00') })],
      format.clock
    );
    expect(years[0].year).toBe(2026);
  });

  it('leaves the total unknown when no row carried a price', () => {
    expect(visitHistoryYears([visit({ amountOre: null })], format.clock)[0].totalOre).toBeNull();
  });

  it('leaves the total unknown when only SOME of the year is priced', () => {
    const years = visitHistoryYears(
      [visit(), visit({ bookingId: 'free', startTs: MAY_2026, amountOre: null })],
      format.clock
    );
    expect(years[0].visits).toHaveLength(2);
    expect(years[0].totalOre).toBeNull();
  });
});
