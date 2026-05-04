import type { CalendarEvent } from '../types.js';

const REFERENCE_DATE = new Date(2026, 4, 12); // May 12, 2026 (Tuesday)

function at(year: number, month: number, day: number, hour: number, minute = 0): Date {
  return new Date(year, month, day, hour, minute, 0, 0);
}

export const REFERENCE_MONTH = REFERENCE_DATE;

export const SAMPLE_EVENTS: CalendarEvent[] = [
  {
    id: 'e1',
    title: 'Sprint planning',
    start: at(2026, 4, 11, 10),
    end: at(2026, 4, 11, 11),
    color: 'var(--color-primary)',
  },
  {
    id: 'e2',
    title: 'Lunch with Ada',
    start: at(2026, 4, 12, 12),
    end: at(2026, 4, 12, 13),
  },
  {
    id: 'e3',
    title: 'Design review',
    start: at(2026, 4, 12, 15),
    end: at(2026, 4, 12, 16, 30),
  },
  {
    id: 'e4',
    title: 'Calendar v2 demo',
    start: at(2026, 4, 13, 9),
    end: at(2026, 4, 13, 9, 45),
  },
  {
    id: 'e5',
    title: 'Town hall',
    start: at(2026, 4, 14, 16),
    end: at(2026, 4, 14, 17),
  },
  {
    id: 'e6',
    title: 'Focus block',
    start: at(2026, 4, 15, 9),
    end: at(2026, 4, 15, 11),
  },
  {
    id: 'e7',
    title: 'PR review',
    start: at(2026, 4, 12, 14),
  },
  {
    id: 'e8',
    title: 'Coffee chat',
    start: at(2026, 4, 12, 17),
  },
];
