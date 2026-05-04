import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useSwipe } from './use-swipe.js';

function Harness({ onLeft, onRight }: { onLeft: () => void; onRight: () => void }) {
  const handlers = useSwipe({ onSwipeLeft: onLeft, onSwipeRight: onRight });
  return (
    <div data-testid="swipe" {...handlers}>
      swipe-area
    </div>
  );
}

describe('useSwipe', () => {
  it('fires onSwipeLeft when finger drags left past threshold', () => {
    const onLeft = vi.fn();
    const onRight = vi.fn();
    render(<Harness onLeft={onLeft} onRight={onRight} />);
    const el = screen.getByTestId('swipe');
    fireEvent.touchStart(el, { touches: [{ clientX: 200 }] });
    fireEvent.touchEnd(el, { changedTouches: [{ clientX: 100 }] });
    expect(onLeft).toHaveBeenCalledTimes(1);
    expect(onRight).not.toHaveBeenCalled();
  });

  it('fires onSwipeRight when finger drags right past threshold', () => {
    const onLeft = vi.fn();
    const onRight = vi.fn();
    render(<Harness onLeft={onLeft} onRight={onRight} />);
    const el = screen.getByTestId('swipe');
    fireEvent.touchStart(el, { touches: [{ clientX: 50 }] });
    fireEvent.touchEnd(el, { changedTouches: [{ clientX: 200 }] });
    expect(onRight).toHaveBeenCalledTimes(1);
    expect(onLeft).not.toHaveBeenCalled();
  });

  it('does not fire when delta is below threshold', () => {
    const onLeft = vi.fn();
    const onRight = vi.fn();
    render(<Harness onLeft={onLeft} onRight={onRight} />);
    const el = screen.getByTestId('swipe');
    fireEvent.touchStart(el, { touches: [{ clientX: 100 }] });
    fireEvent.touchEnd(el, { changedTouches: [{ clientX: 110 }] });
    expect(onLeft).not.toHaveBeenCalled();
    expect(onRight).not.toHaveBeenCalled();
  });
});
