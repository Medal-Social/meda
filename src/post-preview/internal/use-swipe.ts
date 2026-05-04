import type { TouchEvent } from 'react';
import { useCallback, useRef } from 'react';

const SWIPE_THRESHOLD = 50;

export interface UseSwipeOptions {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

/**
 * Touch swipe detection for carousel navigation. Tracks touchstart/touchend
 * and fires onSwipeLeft / onSwipeRight when the horizontal delta exceeds
 * SWIPE_THRESHOLD (50px). Returns event handlers to spread onto the
 * swipeable container.
 *
 * Ported from `apps/web/src/components/composer/editors/use-swipe.ts`.
 */
export function useSwipe({ onSwipeLeft, onSwipeRight }: UseSwipeOptions) {
  const touchStartX = useRef<number | null>(null);

  const onTouchStart = useCallback((e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const onTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (touchStartX.current === null) return;
      const deltaX = e.changedTouches[0].clientX - touchStartX.current;
      touchStartX.current = null;
      if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
      if (deltaX < 0) onSwipeLeft();
      else onSwipeRight();
    },
    [onSwipeLeft, onSwipeRight]
  );

  return { onTouchStart, onTouchEnd };
}
