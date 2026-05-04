import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Avatar } from '../internal/avatar.js';
import { splitContent } from '../internal/format-content.js';
import { useSwipe } from '../internal/use-swipe.js';

// ---------------------------------------------------------------------------
// Avatar
// ---------------------------------------------------------------------------

describe('Avatar internal', () => {
  it('shows initials when src is provided but image errors', () => {
    const { container } = render(
      <Avatar src="https://bad-url.example/img.png" displayName="Alice" />
    );
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    // Fire the error event to trigger fallback
    fireEvent.error(img as HTMLImageElement);
    // After error, the img should be replaced by the initials span
    expect(screen.getByRole('img', { name: 'Alice' })).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('shows ? when displayName is empty string', () => {
    render(<Avatar displayName="" />);
    // initialOf returns '?' for empty string
    expect(screen.getByText('?')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// splitContent
// ---------------------------------------------------------------------------

describe('splitContent', () => {
  it('returns empty array for empty string', () => {
    expect(splitContent('')).toEqual([]);
  });

  it('returns a single text part for plain text', () => {
    const parts = splitContent('hello world');
    expect(parts).toEqual([{ type: 'text', value: 'hello world' }]);
  });

  it('identifies @mention parts', () => {
    const parts = splitContent('Hello @alice!');
    expect(parts).toContainEqual({ type: 'mention', value: '@alice' });
  });

  it('identifies #hashtag parts', () => {
    const parts = splitContent('Love #coding');
    expect(parts).toContainEqual({ type: 'hashtag', value: '#coding' });
  });

  it('identifies URL parts', () => {
    const parts = splitContent('Check https://example.com now');
    expect(parts).toContainEqual({ type: 'url', value: 'https://example.com' });
  });

  it('handles mixed content with mention, hashtag, and url', () => {
    const parts = splitContent('@alice loves #react at https://reactjs.org');
    const types = parts.map((p) => p.type);
    expect(types).toContain('mention');
    expect(types).toContain('hashtag');
    expect(types).toContain('url');
  });

  it('captures trailing text after the last token', () => {
    const parts = splitContent('@alice is great!');
    const last = parts[parts.length - 1];
    expect(last).toEqual({ type: 'text', value: ' is great!' });
  });
});

// ---------------------------------------------------------------------------
// useSwipe (via a harness component)
// ---------------------------------------------------------------------------

function SwipeHarness({
  onSwipeLeft,
  onSwipeRight,
}: {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}) {
  const handlers = useSwipe({ onSwipeLeft, onSwipeRight });
  return <div data-testid="swipeable" {...handlers} />;
}

describe('useSwipe', () => {
  it('calls onSwipeLeft when swipe delta exceeds threshold leftward', () => {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();
    render(<SwipeHarness onSwipeLeft={onSwipeLeft} onSwipeRight={onSwipeRight} />);
    const el = screen.getByTestId('swipeable');
    fireEvent.touchStart(el, { touches: [{ clientX: 300 }] });
    fireEvent.touchEnd(el, { changedTouches: [{ clientX: 200 }] }); // delta = -100 → left
    expect(onSwipeLeft).toHaveBeenCalledOnce();
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it('calls onSwipeRight when swipe delta exceeds threshold rightward', () => {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();
    render(<SwipeHarness onSwipeLeft={onSwipeLeft} onSwipeRight={onSwipeRight} />);
    const el = screen.getByTestId('swipeable');
    fireEvent.touchStart(el, { touches: [{ clientX: 100 }] });
    fireEvent.touchEnd(el, { changedTouches: [{ clientX: 200 }] }); // delta = +100 → right
    expect(onSwipeRight).toHaveBeenCalledOnce();
    expect(onSwipeLeft).not.toHaveBeenCalled();
  });

  it('does not fire when swipe delta is below threshold', () => {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();
    render(<SwipeHarness onSwipeLeft={onSwipeLeft} onSwipeRight={onSwipeRight} />);
    const el = screen.getByTestId('swipeable');
    fireEvent.touchStart(el, { touches: [{ clientX: 100 }] });
    fireEvent.touchEnd(el, { changedTouches: [{ clientX: 130 }] }); // delta = 30 < 50
    expect(onSwipeLeft).not.toHaveBeenCalled();
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it('does not fire when touchEnd fires without a preceding touchStart', () => {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();
    render(<SwipeHarness onSwipeLeft={onSwipeLeft} onSwipeRight={onSwipeRight} />);
    const el = screen.getByTestId('swipeable');
    // No touchStart — touchStartX.current is null
    fireEvent.touchEnd(el, { changedTouches: [{ clientX: 0 }] });
    expect(onSwipeLeft).not.toHaveBeenCalled();
    expect(onSwipeRight).not.toHaveBeenCalled();
  });
});
