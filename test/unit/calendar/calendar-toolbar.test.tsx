import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CalendarToolbar } from '../../../src/calendar/calendar-toolbar.js';

const REF = new Date(2026, 4, 12);

describe('<CalendarToolbar>', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <CalendarToolbar
        date={REF}
        view="month"
        onPrev={() => {}}
        onNext={() => {}}
        onToday={() => {}}
      />
    );
    expect(container.querySelector('[data-slot="calendar-toolbar"]')).toBeTruthy();
  });

  it('renders the period label', () => {
    const { container } = render(
      <CalendarToolbar
        date={REF}
        view="month"
        onPrev={() => {}}
        onNext={() => {}}
        onToday={() => {}}
      />
    );
    expect(container.textContent).toMatch(/May 2026/);
  });

  it('emits onPrev / onNext / onToday', () => {
    const onPrev = vi.fn();
    const onNext = vi.fn();
    const onToday = vi.fn();
    const { getByText, getByLabelText } = render(
      <CalendarToolbar date={REF} view="month" onPrev={onPrev} onNext={onNext} onToday={onToday} />
    );
    fireEvent.click(getByLabelText('Previous'));
    fireEvent.click(getByLabelText('Next'));
    fireEvent.click(getByText('Today'));
    expect(onPrev).toHaveBeenCalledOnce();
    expect(onNext).toHaveBeenCalledOnce();
    expect(onToday).toHaveBeenCalledOnce();
  });

  it('emits onViewChange when clicking a view radio', () => {
    const onViewChange = vi.fn();
    const { getByText } = render(
      <CalendarToolbar
        date={REF}
        view="month"
        onPrev={() => {}}
        onNext={() => {}}
        onToday={() => {}}
        onViewChange={onViewChange}
      />
    );
    fireEvent.click(getByText('Day'));
    expect(onViewChange).toHaveBeenCalledWith('day');
  });

  it('respects custom labels override', () => {
    const { container } = render(
      <CalendarToolbar
        date={REF}
        view="month"
        onPrev={() => {}}
        onNext={() => {}}
        onToday={() => {}}
        labels={{ today: 'Heute', monthView: 'Monat' }}
        onViewChange={() => {}}
      />
    );
    expect(container.textContent).toContain('Heute');
    expect(container.textContent).toContain('Monat');
  });
});
