import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EventCard } from './event-card.js';
import type { TimelineEvent } from './types.js';

const baseEvent: TimelineEvent = {
  id: 'c1',
  startedAt: new Date('2026-04-26T10:42:00Z').getTime(),
  endedAt: new Date('2026-04-26T10:50:00Z').getTime(),
  kind: 'session',
  primary: 'Morpheus',
  secondary: '14 turns · $0.31',
};

describe('EventCard', () => {
  it('renders primary and secondary content', () => {
    const { container } = render(<EventCard event={baseEvent} />);
    expect(container.textContent).toContain('Morpheus');
    expect(container.textContent).toContain('14 turns · $0.31');
  });

  it('applies live styling when event.isLive is true', () => {
    const live: TimelineEvent = { ...baseEvent, isLive: true, endedAt: undefined };
    const { container } = render(<EventCard event={live} />);
    const card = container.querySelector('button');
    expect(card?.dataset.live).toBe('true');
  });

  it('applies selected styling when event.selected is true', () => {
    const selected: TimelineEvent = { ...baseEvent, selected: true };
    const { container } = render(<EventCard event={selected} />);
    expect(container.querySelector('button')?.dataset.selected).toBe('true');
  });

  it('emits onSelect with event when clicked', () => {
    const onSelect = vi.fn();
    const { container } = render(<EventCard event={baseEvent} onSelect={onSelect} />);
    const button = container.querySelector('button');
    if (button) fireEvent.click(button);
    expect(onSelect).toHaveBeenCalledWith(baseEvent);
  });

  it('renders tiny variant without secondary', () => {
    const { container } = render(
      <EventCard event={{ ...baseEvent, variant: 'tool-call' }} size="tiny" />
    );
    expect(container.textContent).not.toContain('14 turns · $0.31');
    expect(container.textContent).toContain('Morpheus');
  });
});
