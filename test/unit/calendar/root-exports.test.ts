import { describe, expect, it } from 'vitest';
import * as Public from '../../../src/calendar/public.js';

describe('@medalsocial/meda calendar root re-export', () => {
  it('exposes the public surface', () => {
    expect(typeof Public.Calendar).toBe('function');
    expect(typeof Public.CalendarToolbar).toBe('function');
    expect(typeof Public.MonthView).toBe('function');
    expect(typeof Public.WeekView).toBe('function');
    expect(typeof Public.DayView).toBe('function');
    expect(Public.DEFAULT_CALENDAR_LABELS).toBeDefined();
  });
});
