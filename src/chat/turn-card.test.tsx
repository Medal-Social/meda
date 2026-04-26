import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TurnCard } from './turn-card.js';
import type { Turn } from './types.js';

const userTurn: Turn = {
  id: 't1',
  speaker: 'user',
  text: "Hey Morpheus, pull up yesterday's calendar.",
  startedAt: new Date('2026-04-26T15:22:14Z').getTime(),
  spokenSeconds: 4.1,
};

const assistantTurn: Turn = {
  id: 't2',
  speaker: 'assistant',
  speakerLabel: 'Morpheus',
  modelLabel: 'claude-opus-4-7',
  text: 'Yesterday you had three meetings.',
  startedAt: new Date('2026-04-26T15:22:18Z').getTime(),
  latency: { sttMs: 240, claudeMs: 1400, ttsMs: 380 },
  toolCalls: [
    {
      id: 'c1',
      name: 'calendar.list',
      args: { range: '2026-04-25..2026-04-26' },
      latencyMs: 142,
      resultSummary: '3 events',
    },
  ],
};

describe('TurnCard', () => {
  it('renders user turn with "You" label by default', () => {
    const { container } = render(
      <TurnCard turn={userTurn} startedAtRef={userTurn.startedAt} tz="UTC" />
    );
    expect(container.textContent).toContain('You');
    expect(container.textContent).toContain("yesterday's calendar");
  });

  it('uses speakerLabel when provided', () => {
    const { container } = render(
      <TurnCard turn={assistantTurn} startedAtRef={assistantTurn.startedAt} tz="UTC" />
    );
    expect(container.textContent).toContain('Morpheus');
  });

  it('renders model pill for assistant turns with modelLabel', () => {
    const { container } = render(
      <TurnCard turn={assistantTurn} startedAtRef={assistantTurn.startedAt} tz="UTC" />
    );
    expect(container.textContent).toContain('claude-opus-4-7');
  });

  it('renders a tool block per tool call', () => {
    const { container } = render(
      <TurnCard turn={assistantTurn} startedAtRef={assistantTurn.startedAt} tz="UTC" />
    );
    expect(container.textContent).toContain('calendar.list');
  });

  it('renders all three latency badges when latency is provided', () => {
    const { container } = render(
      <TurnCard turn={assistantTurn} startedAtRef={assistantTurn.startedAt} tz="UTC" />
    );
    expect(container.textContent).toContain('STT');
    expect(container.textContent).toContain('Claude');
    expect(container.textContent).toContain('TTS');
  });

  it('emits onPlay with turn id when play button clicked', () => {
    const onPlay = vi.fn();
    const { container } = render(
      <TurnCard
        turn={{ ...userTurn, audioUrl: 'blob:abc' }}
        startedAtRef={userTurn.startedAt}
        tz="UTC"
        onPlay={onPlay}
      />
    );
    const button = container.querySelector('button');
    if (button) fireEvent.click(button);
    expect(onPlay).toHaveBeenCalledWith('t1');
  });

  it('shows streaming cursor when streaming=true', () => {
    const streaming: Turn = { ...assistantTurn, streaming: true };
    const { container } = render(
      <TurnCard turn={streaming} startedAtRef={streaming.startedAt} tz="UTC" />
    );
    expect(container.querySelector('[data-streaming="true"]')).not.toBeNull();
  });
});
