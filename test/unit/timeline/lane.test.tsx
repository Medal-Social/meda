import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LaneRow } from '../../../src/timeline/lane.js';
import type { Lane } from '../../../src/timeline/lane-timeline-types.js';

describe('LaneRow placeBar boundary', () => {
  const ws = new Date('2026-04-28T10:00:00Z');
  const we = new Date('2026-04-28T16:00:00Z');

  it('excludes bars that end exactly at windowStart', () => {
    const lane: Lane = {
      id: 'l',
      label: 'L',
      bars: [
        {
          id: 'edge-start',
          label: 'edge-start',
          start: new Date('2026-04-28T09:00:00Z'),
          end: ws,
          fillClass: 'bg-primary',
        },
      ],
    };
    const { container } = render(
      <LaneRow lane={lane} windowStart={ws} windowEnd={we} labelGutterPx={140} />
    );
    expect(container.querySelector('[aria-label*="edge-start"]')).toBeNull();
  });

  it('excludes bars that start exactly at windowEnd', () => {
    const lane: Lane = {
      id: 'l',
      label: 'L',
      bars: [
        {
          id: 'edge-end',
          label: 'edge-end',
          start: we,
          end: new Date('2026-04-28T17:00:00Z'),
          fillClass: 'bg-primary',
        },
      ],
    };
    const { container } = render(
      <LaneRow lane={lane} windowStart={ws} windowEnd={we} labelGutterPx={140} />
    );
    expect(container.querySelector('[aria-label*="edge-end"]')).toBeNull();
  });

  it('includes bars that overlap the window by at least one millisecond', () => {
    const lane: Lane = {
      id: 'l',
      label: 'L',
      bars: [
        {
          id: 'overlap',
          label: 'overlap',
          start: new Date('2026-04-28T09:59:59.999Z'),
          end: new Date('2026-04-28T10:00:00.001Z'),
          fillClass: 'bg-primary',
        },
      ],
    };
    const { container } = render(
      <LaneRow lane={lane} windowStart={ws} windowEnd={we} labelGutterPx={140} />
    );
    expect(container.querySelector('[aria-label*="overlap"]')).not.toBeNull();
  });
});
