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

  it('seeks proportionally on track click', () => {
    const onSeek = vi.fn();
    render(<ScrubBar durationMs={100_000} positionMs={0} marks={[]} onSeek={onSeek} />);
    const slider = screen.getByRole('slider', { name: /conversation position/i });
    // jsdom returns zero-sized rects; stub a 200px-wide track and click at 50px.
    vi.spyOn(slider, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 200,
      bottom: 8,
      width: 200,
      height: 8,
      toJSON: () => ({}),
    });
    fireEvent.click(slider, { clientX: 50 });
    expect(onSeek).toHaveBeenCalledWith(25_000);
  });

  it('clamps click outside the track to [0, durationMs]', () => {
    const onSeek = vi.fn();
    render(<ScrubBar durationMs={100_000} positionMs={0} marks={[]} onSeek={onSeek} />);
    const slider = screen.getByRole('slider', { name: /conversation position/i });
    vi.spyOn(slider, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 100,
      bottom: 8,
      width: 100,
      height: 8,
      toJSON: () => ({}),
    });
    fireEvent.click(slider, { clientX: -50 });
    expect(onSeek).toHaveBeenLastCalledWith(0);
    fireEvent.click(slider, { clientX: 999 });
    expect(onSeek).toHaveBeenLastCalledWith(100_000);
  });

  it('ignores click when track has zero width', () => {
    const onSeek = vi.fn();
    render(<ScrubBar durationMs={100_000} positionMs={0} marks={[]} onSeek={onSeek} />);
    // Default jsdom rect is zero-width, so onSeek must not fire.
    fireEvent.click(screen.getByRole('slider', { name: /conversation position/i }), {
      clientX: 10,
    });
    expect(onSeek).not.toHaveBeenCalled();
  });

  it('moves position with arrow-left and arrow-right', () => {
    const onSeek = vi.fn();
    render(<ScrubBar durationMs={100_000} positionMs={50_000} marks={[]} onSeek={onSeek} />);
    const slider = screen.getByRole('slider', { name: /conversation position/i });
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(onSeek).toHaveBeenLastCalledWith(51_000);
    fireEvent.keyDown(slider, { key: 'ArrowLeft' });
    expect(onSeek).toHaveBeenLastCalledWith(49_000);
  });

  it('clamps arrow stepping at boundaries', () => {
    const onSeek = vi.fn();
    const { rerender } = render(
      <ScrubBar durationMs={100_000} positionMs={0} marks={[]} onSeek={onSeek} />
    );
    const slider = screen.getByRole('slider', { name: /conversation position/i });
    fireEvent.keyDown(slider, { key: 'ArrowLeft' });
    expect(onSeek).toHaveBeenLastCalledWith(0);
    rerender(<ScrubBar durationMs={100_000} positionMs={100_000} marks={[]} onSeek={onSeek} />);
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(onSeek).toHaveBeenLastCalledWith(100_000);
  });

  it('ignores non-arrow key events', () => {
    const onSeek = vi.fn();
    render(<ScrubBar durationMs={100_000} positionMs={0} marks={[]} onSeek={onSeek} />);
    fireEvent.keyDown(screen.getByRole('slider', { name: /conversation position/i }), {
      key: 'Enter',
    });
    expect(onSeek).not.toHaveBeenCalled();
  });

  it('renders skip-back / skip-forward only when callbacks supplied', () => {
    const onSkipBack = vi.fn();
    const onSkipForward = vi.fn();
    render(
      <ScrubBar
        durationMs={1000}
        positionMs={0}
        marks={[]}
        onSeek={() => {}}
        onSkipBack={onSkipBack}
        onSkipForward={onSkipForward}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /skip back/i }));
    fireEvent.click(screen.getByRole('button', { name: /skip forward/i }));
    expect(onSkipBack).toHaveBeenCalledTimes(1);
    expect(onSkipForward).toHaveBeenCalledTimes(1);
  });

  it('renders zero-fill when durationMs is 0', () => {
    const { container } = render(
      <ScrubBar durationMs={0} positionMs={0} marks={[]} onSeek={() => {}} />
    );
    const fill = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(fill.style.width).toBe('0%');
  });
});
