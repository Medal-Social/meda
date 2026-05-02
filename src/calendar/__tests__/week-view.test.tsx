import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { CalendarEvent } from '../types.js';
import { WeekView } from '../week-view.js';

const REF = new Date(2026, 4, 12); // Tuesday

const events: CalendarEvent[] = [
  { id: 'a', title: 'Sprint planning', start: new Date(2026, 4, 12, 10) },
];

describe('<WeekView>', () => {
  it('renders without crashing', () => {
    const { container } = render(<WeekView date={REF} events={events} />);
    expect(container.querySelector('[data-slot="calendar-week-view"]')).toBeTruthy();
  });

  it('renders the event title', () => {
    const { container } = render(<WeekView date={REF} events={events} />);
    expect(container.textContent).toContain('Sprint planning');
  });

  it('calls onEventClick when an event is clicked', () => {
    const onEventClick = vi.fn();
    const { getByText } = render(
      <WeekView date={REF} events={events} onEventClick={onEventClick} />
    );
    fireEvent.click(getByText('Sprint planning'));
    expect(onEventClick).toHaveBeenCalledWith(events[0]);
  });

  it('calls onSlotClick when an empty time slot is clicked', () => {
    const onSlotClick = vi.fn();
    const { container } = render(<WeekView date={REF} events={[]} onSlotClick={onSlotClick} />);
    const slot = container.querySelector('[data-slot="calendar-time-slot"]') as HTMLElement;
    fireEvent.click(slot);
    expect(onSlotClick).toHaveBeenCalledTimes(1);
    const arg = onSlotClick.mock.calls[0][0] as { start: Date; end: Date };
    expect(arg.start).toBeInstanceOf(Date);
    expect(arg.end.getTime() - arg.start.getTime()).toBe(60 * 60 * 1000);
  });

  it('respects weekStartsOn=1', () => {
    const { container } = render(<WeekView date={REF} events={events} weekStartsOn={1} />);
    // Header row contains 7 day buttons after the time-gutter spacer.
    const headerCells = container.querySelectorAll('[data-slot="calendar-week-view"] > div')[0]
      ?.children;
    expect(headerCells?.length).toBe(8);
  });
});
