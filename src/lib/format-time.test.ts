import { describe, expect, it } from 'vitest';
import { formatClock, formatDuration, formatRelativeOffset } from './format-time.js';

describe('formatClock', () => {
  it('formats HH:MM:SS in 24h with zero-padding', () => {
    expect(formatClock(new Date('2026-04-26T15:24:09Z'), { tz: 'UTC' })).toBe('15:24:09');
    expect(formatClock(new Date('2026-04-26T03:04:05Z'), { tz: 'UTC' })).toBe('03:04:05');
  });

  it('respects withSeconds=false', () => {
    expect(
      formatClock(new Date('2026-04-26T15:24:09Z'), {
        tz: 'UTC',
        withSeconds: false,
      })
    ).toBe('15:24');
  });
});

describe('formatDuration', () => {
  it('formats <1h as Mm Ss', () => {
    expect(formatDuration(0)).toBe('0s');
    expect(formatDuration(45_000)).toBe('45s');
    expect(formatDuration(75_000)).toBe('1m 15s');
    expect(formatDuration(8 * 60_000 + 14_000)).toBe('8m 14s');
  });

  it('formats >=1h as Hh Mm', () => {
    expect(formatDuration(60 * 60_000)).toBe('1h 0m');
    expect(formatDuration((2 * 60 + 30) * 60_000)).toBe('2h 30m');
  });
});

describe('formatRelativeOffset', () => {
  it('returns +Ns for positive seconds under 60', () => {
    expect(formatRelativeOffset(0)).toBe('+0s');
    expect(formatRelativeOffset(28_000)).toBe('+28s');
  });

  it('formats minutes and seconds for longer offsets', () => {
    expect(formatRelativeOffset(75_000)).toBe('+1m 15s');
  });
});
