import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DateSwitcher } from './date-switcher.js';

const TODAY = new Date('2026-04-26T10:00:00Z');

afterEach(() => {
  cleanup();
});

describe('DateSwitcher', () => {
  it('renders the date label', () => {
    render(<DateSwitcher value={TODAY} now={TODAY} onChange={() => {}} />);
    expect(screen.getByText(/Apr 26, 2026/)).toBeInTheDocument();
  });

  it('shows the "today" badge when value matches now', () => {
    render(<DateSwitcher value={TODAY} now={TODAY} onChange={() => {}} />);
    expect(screen.getByText(/today/i)).toBeInTheDocument();
  });

  it('does not show "today" badge for past dates', () => {
    const yesterday = new Date('2026-04-25T10:00:00Z');
    render(<DateSwitcher value={yesterday} now={TODAY} onChange={() => {}} />);
    expect(screen.queryByText(/today/i)).not.toBeInTheDocument();
  });

  it('calls onChange with previous day when prev button clicked', () => {
    const onChange = vi.fn();
    render(<DateSwitcher value={TODAY} now={TODAY} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /previous day/i }));
    expect(onChange).toHaveBeenCalledTimes(1);
    const arg = onChange.mock.calls[0]?.[0] as Date;
    expect(arg.toISOString()).toBe('2026-04-25T10:00:00.000Z');
  });

  it('disables next button when value is today', () => {
    render(<DateSwitcher value={TODAY} now={TODAY} onChange={() => {}} />);
    const next = screen.getByRole('button', { name: /next day/i });
    expect(next).toBeDisabled();
  });

  it('enables next button for past dates and advances on click', () => {
    const yesterday = new Date('2026-04-25T10:00:00Z');
    const onChange = vi.fn();
    render(<DateSwitcher value={yesterday} now={TODAY} onChange={onChange} />);
    const next = screen.getByRole('button', { name: /next day/i });
    expect(next).not.toBeDisabled();
    fireEvent.click(next);
    const arg = onChange.mock.calls[0]?.[0] as Date;
    expect(arg.toISOString()).toBe('2026-04-26T10:00:00.000Z');
  });

  it('advances by one calendar day in the target tz across DST', () => {
    // 2026-03-08 02:00 UTC = 2026-03-07 21:00 in America/New_York (EST, UTC-5).
    // Advancing one day in NY tz should land on 2026-03-08 21:00 NY = 2026-03-09 01:00 UTC
    // (EDT begins 2026-03-08 02:00 NY → next day is in UTC-4, so 21:00 NY = 01:00 UTC).
    const value = new Date('2026-03-08T02:00:00Z');
    const onChange = vi.fn();
    render(
      <DateSwitcher
        value={value}
        now={new Date('2026-04-01T00:00:00Z')}
        tz="America/New_York"
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /next day/i }));
    const arg = onChange.mock.calls[0]?.[0] as Date;
    // Same wall-clock hour 21:00 in NY, but UTC differs by 1h vs naive +24h.
    expect(arg.toISOString()).toBe('2026-03-09T01:00:00.000Z');
  });

  it('uses the tz prop for the "today" badge comparison', () => {
    // 2026-04-26 23:00 UTC is still 2026-04-26 in UTC, but 2026-04-27 09:00 in
    // Asia/Tokyo. With tz="Asia/Tokyo", the "today" reference being 2026-04-27
    // 00:30 Tokyo means the value should be flagged "today".
    const value = new Date('2026-04-26T23:00:00Z'); // 2026-04-27 08:00 in Tokyo
    const now = new Date('2026-04-26T15:30:00Z'); // 2026-04-27 00:30 in Tokyo
    render(<DateSwitcher value={value} now={now} tz="Asia/Tokyo" onChange={() => {}} />);
    expect(screen.getByText(/today/i)).toBeInTheDocument();
  });
});
