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
});
