'use client';

/**
 * Swipe-to-close for the right panel (opt-in, `swipeToClose`).
 *
 * A finger drags the panel toward its own edge 1:1: the transform is written
 * straight to the element, so React never renders during a drag. Pulled the
 * other way it rubber-bands. On release it closes past 40% of its width or a
 * 500 px/s flick toward the edge, and otherwise springs home; a finger that
 * lands while it is still moving catches it where it is.
 *
 * The element also gets `--meda-panel-swipe-progress` (0 open … 1 gone), so a
 * consumer can fade the panel's shadow with the drag.
 *
 * Mouse and pen keep their old behaviour (resize handle, buttons); only
 * `pointerType === 'touch'` swipes.
 */

import { type RefObject, useEffect, useRef } from 'react';
import { motion } from '../motion.js';

/** Release closes past this share of the panel's width… */
export const PANEL_SWIPE_CLOSE_RATIO = 0.4;
/** …or above this speed toward the edge (px/s). */
export const PANEL_SWIPE_CLOSE_VELOCITY = 500;
/** Movement before the gesture picks an axis (px). */
export const PANEL_SWIPE_SLOP = 8;
/** Velocity is measured over this window (ms). */
const VELOCITY_WINDOW_MS = 100;

/** Elements a swipe never starts on. */
const IGNORE_SELECTOR =
  'input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="slider"], [role="separator"], [data-meda-swipe-ignore]';

/**
 * Rubber band past a limit (iOS's curve): the further the overshoot, the less
 * each pixel of finger travel moves the panel, approaching `dimension * 0.55`.
 */
export function rubberband(overshoot: number, dimension: number, constant = 0.55): number {
  if (overshoot <= 0 || dimension <= 0) return 0;
  return (1 - 1 / ((overshoot * constant) / dimension + 1)) * dimension;
}

/**
 * Where a drag puts the panel: `travel` is finger travel toward the edge (a
 * negative value pulls it inward). Returns the visual offset toward the edge.
 */
export function panelSwipeOffset(travel: number, width: number): number {
  if (travel >= 0) return Math.min(travel, width);
  return -rubberband(-travel, width);
}

/** The release decision. `velocity` is px/s toward the edge. */
export function shouldClosePanel(offset: number, width: number, velocity: number): boolean {
  if (velocity >= PANEL_SWIPE_CLOSE_VELOCITY) return true;
  if (velocity <= -PANEL_SWIPE_CLOSE_VELOCITY) return false;
  return width > 0 && offset >= width * PANEL_SWIPE_CLOSE_RATIO;
}

/**
 * Release speed (px/s, along x) from the samples of the last
 * `VELOCITY_WINDOW_MS` before `now`, the lift included. A finger that rested
 * before lifting has fewer than two recent samples and so no speed, whatever
 * its last move was.
 */
export function releaseVelocity(
  samples: ReadonlyArray<{ t: number; x: number }>,
  now: number
): number {
  const recent = samples.filter((sample) => now - sample.t <= VELOCITY_WINDOW_MS);
  const first = recent[0];
  const last = recent[recent.length - 1];
  if (!first || !last || recent.length < 2) return 0;
  const dt = (last.t - first.t) / 1000;
  return dt > 0 ? (last.x - first.x) / dt : 0;
}

/**
 * A critically-damped-ish spring from `from` to `to` with an initial velocity
 * (px/s), stepped on rAF. Returns a cancel function.
 */
function springTo(
  from: number,
  to: number,
  velocity: number,
  onFrame: (value: number) => void,
  onDone: () => void
): () => void {
  const { stiffness, damping } = motion.spring;
  let x = from;
  let v = velocity;
  let last = performance.now();
  let raf = 0;
  const step = (now: number) => {
    // Clamp the step so a backgrounded tab does not explode the integration.
    const dt = Math.min(0.032, (now - last) / 1000);
    last = now;
    const force = -stiffness * (x - to) - damping * v;
    v += force * dt;
    x += v * dt;
    if (Math.abs(x - to) < 0.5 && Math.abs(v) < 20) {
      onFrame(to);
      onDone();
      return;
    }
    onFrame(x);
    raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** A horizontally scrollable ancestor between `target` and `root` keeps the drag. */
function inHorizontalScroller(target: Element, root: Element): boolean {
  let el: Element | null = target;
  while (el && el !== root) {
    if (el instanceof HTMLElement && el.scrollWidth > el.clientWidth) {
      const overflowX = getComputedStyle(el).overflowX;
      if (overflowX === 'auto' || overflowX === 'scroll') return true;
    }
    el = el.parentElement;
  }
  return false;
}

interface Drag {
  pointerId: number;
  startX: number;
  startY: number;
  /** Offset the panel already had when the finger landed (a caught spring). */
  baseOffset: number;
  /** +1 when the panel's edge is to the right (LTR), -1 in RTL. */
  sign: number;
  axis: 'pending' | 'x' | 'y';
  samples: Array<{ t: number; x: number }>;
  offset: number;
}

export function usePanelSwipe(
  ref: RefObject<HTMLElement | null>,
  {
    enabled,
    onClose,
    resetKey,
  }: {
    enabled: boolean;
    onClose: () => void;
    /**
     * A change (the panel's mode) cancels any drag or spring in flight, so an
     * old closing spring cannot undo a newer choice.
     */
    resetKey?: unknown;
  }
): void {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `resetKey` is a trigger only; its change tears the gesture down
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;

    let drag: Drag | null = null;
    let offset = 0;
    let cancelSpring: (() => void) | null = null;

    const paint = (value: number, sign: number) => {
      offset = value;
      const width = el.offsetWidth || 1;
      el.style.transform = value === 0 ? '' : `translateX(${sign * value}px)`;
      el.style.setProperty(
        '--meda-panel-swipe-progress',
        String(Math.max(0, Math.min(1, value / width)))
      );
    };

    const reset = () => {
      el.style.transform = '';
      el.style.removeProperty('--meda-panel-swipe-progress');
      el.removeAttribute('data-meda-panel-swiping');
      offset = 0;
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'touch' || drag) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(IGNORE_SELECTOR) || inHorizontalScroller(target, el)) return;
      // Catch a panel that is still springing: carry on from where it is.
      cancelSpring?.();
      cancelSpring = null;
      drag = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        baseOffset: offset,
        sign: getComputedStyle(el).direction === 'rtl' ? -1 : 1,
        axis: offset !== 0 ? 'x' : 'pending',
        samples: [{ t: event.timeStamp, x: event.clientX }],
        offset,
      };
      if (drag.axis === 'x') el.setAttribute('data-meda-panel-swiping', '');
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      if (drag.axis === 'pending') {
        if (Math.hypot(dx, dy) < PANEL_SWIPE_SLOP) return;
        drag.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        if (drag.axis === 'y') {
          drag = null;
          return;
        }
        try {
          el.setPointerCapture(event.pointerId);
        } catch {
          // The drag still works without capture while the finger stays on it.
        }
        el.setAttribute('data-meda-panel-swiping', '');
      }
      const now = event.timeStamp;
      drag.samples.push({ t: now, x: event.clientX });
      // Keep one sample older than the window so a steady drag always has a span.
      while (drag.samples.length > 2 && now - (drag.samples[1]?.t ?? now) > VELOCITY_WINDOW_MS) {
        drag.samples.shift();
      }
      const travel = drag.baseOffset + drag.sign * dx;
      drag.offset = panelSwipeOffset(travel, el.offsetWidth);
      paint(drag.offset, drag.sign);
    };

    const finish = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      const current = drag;
      drag = null;
      if (current.axis !== 'x') return;
      el.removeAttribute('data-meda-panel-swiping');
      const cancelled = event.type === 'pointercancel';
      if (!cancelled) {
        // The lift is a sample too: where the finger let go, and when.
        current.samples.push({ t: event.timeStamp, x: event.clientX });
        const travel = current.baseOffset + current.sign * (event.clientX - current.startX);
        current.offset = panelSwipeOffset(travel, el.offsetWidth);
        paint(current.offset, current.sign);
      }
      const velocity = cancelled
        ? 0
        : current.sign * releaseVelocity(current.samples, event.timeStamp);
      const width = el.offsetWidth;
      const close = !cancelled && shouldClosePanel(current.offset, width, velocity);
      const target = close ? width : 0;
      const done = () => {
        cancelSpring = null;
        if (close) {
          // Stay off-screen until the closed mode commits: its change of
          // `enabled`/`resetKey` runs this effect's cleanup, which resets.
          // Resetting here would paint the panel back for a frame first.
          onCloseRef.current();
        } else {
          reset();
        }
      };
      if (prefersReducedMotion()) {
        paint(target, current.sign);
        done();
        return;
      }
      cancelSpring = springTo(
        current.offset,
        target,
        velocity,
        // A closing spring may not overshoot past the edge and show a gap.
        (value) => paint(close ? Math.min(value, width) : value, current.sign),
        done
      );
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', finish);
    el.addEventListener('pointercancel', finish);
    return () => {
      cancelSpring?.();
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', finish);
      el.removeEventListener('pointercancel', finish);
      reset();
    };
  }, [enabled, ref, resetKey]);
}
