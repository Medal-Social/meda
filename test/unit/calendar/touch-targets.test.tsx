import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CalendarToolbar } from '../../../src/calendar/calendar-toolbar.js';

const REF = new Date(2026, 4, 12);

/**
 * WCAG 2.5.5 / 2.5.8 — touch targets must be ≥44×44 px (or 24×24 with
 * sufficient spacing). All toolbar interactive controls use min-h-[44px] and
 * min-w-[44px] to clear the bar.
 */
describe('Calendar touch targets', () => {
  it('toolbar controls declare min-h-[44px] and min-w-[44px]', () => {
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
    const buttons = Array.from(container.querySelectorAll('button')) as HTMLButtonElement[];
    expect(buttons.length).toBeGreaterThan(0);
    for (const btn of buttons) {
      expect(btn.className).toContain('min-h-[44px]');
      expect(btn.className).toContain('min-w-[44px]');
    }
  });
});
