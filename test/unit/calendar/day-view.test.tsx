import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DayView } from '../../../src/calendar/day-view.js';
import type { CalendarEvent } from '../../../src/calendar/types.js';

const REF = new Date(2026, 4, 12);

const events: CalendarEvent[] = [
  { id: 'a', title: 'Sprint planning', start: new Date(2026, 4, 12, 10) },
  { id: 'b', title: 'Skipped (other day)', start: new Date(2026, 4, 13, 10) },
];

describe('<DayView>', () => {
  it('renders without crashing', () => {
    const { container } = render(<DayView date={REF} events={events} />);
    expect(container.querySelector('[data-slot="calendar-day-view"]')).toBeTruthy();
  });

  it('renders only events for the focused day', () => {
    const { container } = render(<DayView date={REF} events={events} />);
    expect(container.textContent).toContain('Sprint planning');
    expect(container.textContent).not.toContain('Skipped (other day)');
  });

  it('calls onEventClick when an event is clicked', () => {
    const onEventClick = vi.fn();
    const { getByText } = render(
      <DayView date={REF} events={events} onEventClick={onEventClick} />
    );
    fireEvent.click(getByText('Sprint planning'));
    expect(onEventClick).toHaveBeenCalledWith(events[0]);
  });

  it('respects custom labels', () => {
    const { container } = render(
      <DayView date={REF} events={events} labels={{ eventCountLabel: (n) => `${n} thing(s)` }} />
    );
    expect(container.textContent).toContain('1 thing(s)');
  });
});
