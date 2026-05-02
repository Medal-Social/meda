import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MonthView } from '../month-view.js';
import type { CalendarEvent } from '../types.js';

const REF = new Date(2026, 4, 12); // May 2026

const events: CalendarEvent[] = [
  { id: 'a', title: 'Sprint planning', start: new Date(2026, 4, 12, 10) },
  { id: 'b', title: 'Design review', start: new Date(2026, 4, 14, 15) },
];

describe('<MonthView>', () => {
  it('renders without crashing with valid props', () => {
    const { container } = render(<MonthView date={REF} events={events} />);
    expect(container.querySelector('[data-slot="calendar-month-view"]')).toBeTruthy();
  });

  it('renders provided event titles', () => {
    const { container } = render(<MonthView date={REF} events={events} />);
    expect(container.textContent).toContain('Sprint planning');
    expect(container.textContent).toContain('Design review');
  });

  it('calls onEventClick when an event is clicked', () => {
    const onEventClick = vi.fn();
    const { getByText } = render(
      <MonthView date={REF} events={events} onEventClick={onEventClick} />
    );
    fireEvent.click(getByText('Sprint planning'));
    expect(onEventClick).toHaveBeenCalledWith(events[0]);
  });

  it('respects weekStartsOn=1 (Monday first column)', () => {
    const { container } = render(<MonthView date={REF} events={events} weekStartsOn={1} />);
    const headers = container.querySelectorAll(
      '[data-slot="calendar-month-view"] > div:first-child > div'
    );
    // First weekday header should be a Monday short name in en-US.
    expect(headers[0]?.textContent?.toLowerCase()).toMatch(/^mon/);
  });

  it('emits onDateClick when clicking an empty cell', () => {
    const onDateClick = vi.fn();
    const { container } = render(
      <MonthView date={REF} events={events} onDateClick={onDateClick} />
    );
    const cells = container.querySelectorAll('[data-slot="calendar-day-cell"]');
    fireEvent.click(cells[0] as Element);
    expect(onDateClick).toHaveBeenCalled();
  });
});
