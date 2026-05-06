import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Calendar } from '../../../src/calendar/calendar.js';

const REF = new Date(2026, 4, 12);

describe('Calendar responsive', () => {
  it('marks the outer wrapper with @container/calendar', () => {
    const { container } = render(<Calendar date={REF} events={[]} />);
    const root = container.querySelector('[data-slot="calendar"]') as HTMLElement;
    expect(root).toBeTruthy();
    expect(root.className).toContain('@container/calendar');
  });

  it('day cells use container-query responsive sizing', () => {
    const { container } = render(<Calendar date={REF} events={[]} view="month" />);
    const cell = container.querySelector('[data-slot="calendar-day-cell"]') as HTMLElement;
    expect(cell.className).toContain('@md/calendar:min-h-[6.75rem]');
  });
});
