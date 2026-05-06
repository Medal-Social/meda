import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { Calendar } from '../../../src/calendar/calendar.js';
import { CalendarToolbar } from '../../../src/calendar/calendar-toolbar.js';
import { DayView } from '../../../src/calendar/day-view.js';
import { MonthView } from '../../../src/calendar/month-view.js';
import type { CalendarEvent } from '../../../src/calendar/types.js';
import { WeekView } from '../../../src/calendar/week-view.js';

const REF = new Date(2026, 4, 12);
const events: CalendarEvent[] = [
  { id: 'a', title: 'Sprint planning', start: new Date(2026, 4, 12, 10) },
];

describe('calendar a11y', () => {
  it('Calendar has no axe violations', async () => {
    const { container } = render(<Calendar date={REF} events={events} />);
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    ).toHaveNoViolations();
  });

  it('CalendarToolbar has no axe violations', async () => {
    const { container } = render(
      <CalendarToolbar
        date={REF}
        view="month"
        onPrev={() => {}}
        onNext={() => {}}
        onToday={() => {}}
        onViewChange={() => {}}
      />
    );
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    ).toHaveNoViolations();
  });

  it('MonthView has no axe violations', async () => {
    const { container } = render(<MonthView date={REF} events={events} />);
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    ).toHaveNoViolations();
  });

  it('WeekView has no axe violations', async () => {
    const { container } = render(<WeekView date={REF} events={events} />);
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    ).toHaveNoViolations();
  });

  it('DayView has no axe violations', async () => {
    const { container } = render(<DayView date={REF} events={events} />);
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    ).toHaveNoViolations();
  });
});
