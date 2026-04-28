import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { DateSwitcher } from './date-switcher.js';
import { EventCard } from './event-card.js';
import type { Lane } from './index.js';
import { LaneTimeline } from './index.js';
import { LiveIndicator } from './live-indicator.js';
import { ScrubBar } from './scrub-bar.js';
import { TimelineRail } from './timeline-rail.js';
import { TimelineTape } from './timeline-tape.js';

const NOW = new Date('2026-04-26T15:24:09Z');

describe('timeline a11y', () => {
  it('DateSwitcher has no axe violations', async () => {
    const { container } = render(
      <DateSwitcher value={NOW} now={NOW} tz="UTC" onChange={() => {}} />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('EventCard has no axe violations', async () => {
    const { container } = render(
      <EventCard
        event={{
          id: 'live',
          startedAt: NOW.getTime() - 134_000,
          isLive: true,
          kind: 'session',
          primary: 'Morpheus',
          secondary: '4 turns · $0.07',
        }}
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('LiveIndicator has no axe violations', async () => {
    const { container } = render(<LiveIndicator now={NOW} tz="UTC" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('ScrubBar has no axe violations', async () => {
    const { container } = render(
      <ScrubBar
        durationMs={180_000}
        positionMs={90_000}
        marks={[{ id: 'm1', positionPct: 50, kind: 'turn' }]}
        onSeek={() => {}}
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  // TimelineTape + TimelineRail render a tall (~21,600 px) canvas with hundreds
  // of tick nodes — axe scans every node and grinds for minutes on the default
  // configuration. Keep the canvas tiny by passing a short pastSpanSec /
  // futurePadSec via the props the components support.
  it('TimelineTape has no axe violations', async () => {
    const { container } = render(
      <TimelineTape
        now={NOW}
        events={[
          {
            id: 'e1',
            startedAt: NOW.getTime() - 60_000,
            endedAt: NOW.getTime() - 30_000,
            kind: 'session',
            primary: 'Morpheus',
          },
        ]}
        pastSpanSec={120}
        futurePadSec={30}
        tz="UTC"
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('TimelineRail has no axe violations', async () => {
    // TimelineRail wraps TimelineTape; we can't shrink its hardcoded
    // PAST_SPAN_SEC / FUTURE_PAD_SEC, so axe takes a couple seconds. Override
    // axe's runOnly to a smaller rule subset; the explicit timeout keeps the
    // test stable when the full suite is contending for jsdom workers.
    const { container } = render(
      <TimelineRail
        date={NOW}
        now={NOW}
        events={[
          {
            id: 'e1',
            startedAt: NOW.getTime() - 60_000,
            endedAt: NOW.getTime() - 30_000,
            kind: 'session',
            primary: 'Morpheus',
            secondary: '4 turns',
          },
        ]}
        tz="UTC"
      />
    );
    expect(
      await axe(container, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
      })
    ).toHaveNoViolations();
  }, 15_000);
});

const LANE_TIMELINE_FIXTURE: Lane[] = [
  {
    id: 'm1',
    label: 'studio.local',
    sublabel: '2 sessions',
    statusDotClass: 'bg-success-500',
    bars: [
      {
        id: 'b1',
        label: 'WS subs',
        start: new Date(Date.now() - 30 * 60_000),
        end: new Date(Date.now() - 5 * 60_000),
        fillClass: 'bg-primary/70',
      },
    ],
  },
  {
    id: 'm2',
    label: 'beast.local',
    sublabel: 'offline',
    muted: true,
    bars: [],
  },
];

describe('LaneTimeline a11y', () => {
  it('has no axe violations', async () => {
    const { container } = render(
      <LaneTimeline
        title="Timeline"
        lanes={LANE_TIMELINE_FIXTURE}
        activeCount={1}
        legend={[
          { label: 'running', swatchClass: 'bg-primary/70' },
          { label: 'idle', swatchClass: 'bg-muted' },
        ]}
      />
    );
    const results = await axe(container, {
      // Bar fill colors use Tailwind opacity tokens that do not resolve to
      // real hex values in jsdom (CSS custom properties are unset). Skip the
      // color-contrast rule here; real-browser contrast is validated manually
      // against the design tokens.
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});
