import type { TouchEvent } from 'react';
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
export declare function useSwipe({ onSwipeLeft, onSwipeRight }: UseSwipeOptions): {
    onTouchStart: (e: TouchEvent) => void;
    onTouchEnd: (e: TouchEvent) => void;
};
