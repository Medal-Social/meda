import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { LatencyBadge } from './latency-badge.js';
import { LatencyBreakdown } from './latency-breakdown.js';
import { ToolCallBlock } from './tool-call-block.js';
import { TranscriptStream } from './transcript-stream.js';
import { TurnCard } from './turn-card.js';

const NOW = new Date('2026-04-26T15:24:09Z').getTime();

describe('chat a11y', () => {
  it('LatencyBadge has no axe violations', async () => {
    const { container } = render(<LatencyBadge kind="claude" ms={1400} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('LatencyBreakdown has no axe violations', async () => {
    const { container } = render(<LatencyBreakdown sttMs={240} claudeMs={1400} ttsMs={380} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('ToolCallBlock has no axe violations', async () => {
    const { container } = render(
      <ToolCallBlock
        call={{
          id: 'tc1',
          name: 'list_events',
          args: { date: '2026-04-26' },
          resultSummary: '3 events',
          latencyMs: 92,
        }}
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('TurnCard has no axe violations', async () => {
    const { container } = render(
      <TurnCard
        turn={{
          id: 't1',
          speaker: 'assistant',
          speakerLabel: 'Morpheus',
          text: 'Hi',
          startedAt: NOW,
          latency: { sttMs: 240, claudeMs: 1400, ttsMs: 380 },
        }}
        startedAtRef={NOW}
        tz="UTC"
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('TranscriptStream has no axe violations', async () => {
    const { container } = render(
      <TranscriptStream
        turns={[
          { id: 't1', speaker: 'user', text: 'Hello', startedAt: NOW },
          {
            id: 't2',
            speaker: 'assistant',
            speakerLabel: 'Morpheus',
            text: 'Hi',
            startedAt: NOW + 4_000,
            latency: { sttMs: 240, claudeMs: 1400, ttsMs: 380 },
          },
        ]}
        tz="UTC"
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
