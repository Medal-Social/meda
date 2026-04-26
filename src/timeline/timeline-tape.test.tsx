import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TimelineTape } from './timeline-tape.js';
import type { TimelineEvent } from './types.js';

const NOW = new Date('2026-04-26T15:24:09Z');

const live: TimelineEvent = {
  id: 'live',
  startedAt: new Date('2026-04-26T15:22:14Z').getTime(),
  isLive: true,
  kind: 'session',
  primary: 'Morpheus',
};

const past: TimelineEvent = {
  id: 'p1',
  startedAt: new Date('2026-04-26T10:42:00Z').getTime(),
  endedAt: new Date('2026-04-26T10:50:00Z').getTime(),
  kind: 'session',
  primary: 'Morpheus',
};

describe('TimelineTape', () => {
  it('renders one card per session event', () => {
    render(<TimelineTape now={NOW} events={[live, past]} pxPerSec={1.2} futurePadSec={300} />);
    const cards = screen.getAllByRole('button');
    expect(cards.length).toBeGreaterThanOrEqual(2);
  });

  it('places the live event card after NOW (closer to top)', () => {
    const { container } = render(
      <TimelineTape now={NOW} events={[live, past]} pxPerSec={1.2} futurePadSec={300} />
    );
    const liveCard = container.querySelector('[data-event-id="live"]') as HTMLElement | null;
    const pastCard = container.querySelector('[data-event-id="p1"]') as HTMLElement | null;
    expect(liveCard).not.toBeNull();
    expect(pastCard).not.toBeNull();
    const liveTop = parseFloat(liveCard?.style.top ?? '0');
    const pastTop = parseFloat(pastCard?.style.top ?? '0');
    expect(liveTop).toBeLessThan(pastTop);
  });

  it('renders tape segment for live event with isLive treatment', () => {
    const { container } = render(
      <TimelineTape now={NOW} events={[live]} pxPerSec={1.2} futurePadSec={300} />
    );
    expect(container.querySelector('[data-tape-segment-live="true"]')).not.toBeNull();
  });
});
