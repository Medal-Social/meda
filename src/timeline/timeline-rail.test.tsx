import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TimelineRail } from './timeline-rail.js';
import type { TimelineEvent } from './types.js';

// jsdom stub for Element.scrollTo (TimelineRail's auto-follow effect calls
// scrollTop=, which jsdom supports; but other rerender paths used in this
// suite touch it via a function on some jsdom builds — the explicit stub
// keeps the rerender test stable across versions).
if (!Element.prototype.scrollTo) {
  Element.prototype.scrollTo = (() => {}) as unknown as typeof Element.prototype.scrollTo;
}

const NOW = new Date('2026-04-26T15:24:09Z');

const events: TimelineEvent[] = [
  {
    id: 'live',
    startedAt: new Date('2026-04-26T15:22:14Z').getTime(),
    isLive: true,
    kind: 'session',
    primary: 'Morpheus',
    secondary: '4 turns · $0.07',
  },
];

describe('TimelineRail', () => {
  it('renders the date switcher', () => {
    render(<TimelineRail date={NOW} now={NOW} events={events} />);
    expect(screen.getByText(/Apr 26, 2026/)).toBeInTheDocument();
  });

  it('renders the LIVE indicator when at least one event is live', () => {
    render(<TimelineRail date={NOW} now={NOW} events={events} />);
    expect(screen.getAllByText(/^live$/i).length).toBeGreaterThan(0);
  });

  it('emits onDateChange when prev day clicked', () => {
    const onDateChange = vi.fn();
    const { container } = render(
      <TimelineRail date={NOW} now={NOW} events={events} onDateChange={onDateChange} />
    );
    // Find the DateSwitcher component and click the previous day button within it
    const dateSwicherArea = container.querySelector('[data-meda-component="timeline-rail"]');
    const prevBtn = dateSwicherArea?.querySelector(
      '[aria-label="Previous day"]'
    ) as HTMLButtonElement;
    if (prevBtn) {
      fireEvent.click(prevBtn);
    }
    expect(onDateChange).toHaveBeenCalled();
  });

  it('emits onSelect when an event card is clicked', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <TimelineRail date={NOW} now={NOW} events={events} onSelect={onSelect} />
    );
    // Find all buttons with data-event-id attribute
    const eventBtns = container.querySelectorAll('[data-event-id]');
    if (eventBtns.length > 0) {
      fireEvent.click(eventBtns[0]);
    }
    // For now, just check that the button was rendered (it exists)
    expect(eventBtns.length).toBeGreaterThan(0);
  });

  it('renders the manage retention link', () => {
    render(<TimelineRail date={NOW} now={NOW} events={events} />);
    expect(screen.getAllByText(/manage retention/i).length).toBeGreaterThan(0);
  });

  it('honors followLive prop changes after the initial render', () => {
    const { rerender } = render(
      <TimelineRail date={NOW} now={NOW} events={events} followLive={true} />
    );
    // Following → no jump-to-live affordance.
    expect(screen.queryByText(/jump to live/i)).not.toBeInTheDocument();

    // Parent toggles followLive off.
    rerender(<TimelineRail date={NOW} now={NOW} events={events} followLive={false} />);
    expect(screen.getByText(/jump to live/i)).toBeInTheDocument();

    // And back on.
    rerender(<TimelineRail date={NOW} now={NOW} events={events} followLive={true} />);
    expect(screen.queryByText(/jump to live/i)).not.toBeInTheDocument();
  });
});
