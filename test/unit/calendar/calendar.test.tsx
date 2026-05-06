import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Calendar } from '../../../src/calendar/calendar.js';
import type { CalendarEvent } from '../../../src/calendar/types.js';

const REF = new Date(2026, 4, 12); // May 2026
const events: CalendarEvent[] = [
  { id: 'a', title: 'Sprint planning', start: new Date(2026, 4, 12, 10) },
];

describe('<Calendar>', () => {
  it('renders without crashing with valid props', () => {
    const { container } = render(<Calendar date={REF} events={events} />);
    expect(container.querySelector('[data-slot="calendar"]')).toBeTruthy();
    expect(container.querySelector('[data-slot="calendar-toolbar"]')).toBeTruthy();
  });

  it('renders the toolbar period label for the focused month', () => {
    const { container } = render(<Calendar date={REF} events={events} />);
    expect(container.textContent).toMatch(/May 2026/);
  });

  it('emits onDateChange when previous/next pressed (month view)', () => {
    const onDateChange = vi.fn();
    const { getByLabelText } = render(
      <Calendar date={REF} events={events} onDateChange={onDateChange} />
    );
    fireEvent.click(getByLabelText('Previous'));
    fireEvent.click(getByLabelText('Next'));
    expect(onDateChange).toHaveBeenCalledTimes(2);
    const [prevDate] = onDateChange.mock.calls[0];
    expect((prevDate as Date).getMonth()).toBe(3); // April
  });

  it('switches view via the toolbar', () => {
    const onViewChange = vi.fn();
    const { getByText } = render(
      <Calendar date={REF} events={events} view="month" onViewChange={onViewChange} />
    );
    fireEvent.click(getByText('Week'));
    expect(onViewChange).toHaveBeenCalledWith('week');
  });

  it('respects custom labels override', () => {
    const { container } = render(<Calendar date={REF} events={events} labels={{ today: 'Hoy' }} />);
    expect(container.textContent).toContain('Hoy');
  });
});
