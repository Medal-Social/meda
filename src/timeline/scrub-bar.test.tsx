import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ScrubBar } from './scrub-bar.js';
import type { ScrubMark } from './types.js';

const marks: ScrubMark[] = [
  { id: 'm1', positionPct: 12, kind: 'turn' },
  { id: 'm2', positionPct: 31, kind: 'tool' },
  { id: 'm3', positionPct: 58, kind: 'barge' },
];

describe('ScrubBar', () => {
  it('renders one element per mark', () => {
    const { container } = render(
      <ScrubBar durationMs={120_000} positionMs={48_000} marks={marks} onSeek={() => {}} />
    );
    expect(container.querySelectorAll('[data-mark-kind]').length).toBe(3);
  });

  it('renders transport play button when not playing', () => {
    render(
      <ScrubBar durationMs={1000} positionMs={0} marks={[]} onSeek={() => {}} isPlaying={false} />
    );
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
  });

  it('renders transport pause button when playing', () => {
    render(
      <ScrubBar durationMs={1000} positionMs={0} marks={[]} onSeek={() => {}} isPlaying={true} />
    );
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
  });

  it('emits onPlayPause when transport clicked', () => {
    const onPlayPause = vi.fn();
    const { container } = render(
      <ScrubBar
        durationMs={1000}
        positionMs={0}
        marks={[]}
        onSeek={() => {}}
        isPlaying={false}
        onPlayPause={onPlayPause}
      />
    );
    const button = container.querySelector('[aria-label="Play"]') as HTMLButtonElement;
    fireEvent.click(button);
    expect(onPlayPause).toHaveBeenCalledTimes(1);
  });

  it('shows live label when isLive is true', () => {
    render(
      <ScrubBar durationMs={120_000} positionMs={120_000} marks={[]} onSeek={() => {}} isLive />
    );
    expect(screen.getByText(/live/i)).toBeInTheDocument();
  });
});
