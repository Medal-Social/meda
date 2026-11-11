import '@testing-library/jest-dom/vitest';
import { act, fireEvent, render, renderHook } from '@testing-library/react';
import { Info } from 'lucide-react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  PANEL_SWIPE_CLOSE_RATIO,
  PANEL_SWIPE_CLOSE_VELOCITY,
  panelSwipeOffset,
  releaseVelocity,
  rubberband,
  shouldClosePanel,
  usePanelSwipe,
} from '../../../src/shell/internal/panel-swipe.js';
import { RightPanel } from '../../../src/shell/right-panel.js';
import { MedaShellProvider, useMedaShell } from '../../../src/shell/shell-provider.js';
import type { AppDefinition, PanelView, WorkspaceDefinition } from '../../../src/shell/types.js';

vi.mock('../../../src/shell/use-shell-viewport.js', () => ({
  useShellViewport: vi.fn(() => 'desktop'),
}));

const WIDTH = 340;

function stubMatchMedia(reduced: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: reduced && query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  );
}

beforeEach(() => {
  vi.stubGlobal('localStorage', {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  });
  // Reduced motion settles a release in the same tick, so no rAF in the tests.
  stubMatchMedia(true);
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    get() {
      return WIDTH;
    },
  });
});

describe('panel swipe physics', () => {
  it('rubber-bands an inward pull, ever more stiffly', () => {
    expect(rubberband(0, WIDTH)).toBe(0);
    const small = rubberband(40, WIDTH);
    const large = rubberband(400, WIDTH);
    expect(small).toBeGreaterThan(0);
    expect(small).toBeLessThan(40);
    expect(large - small).toBeLessThan(400 - 40);
    expect(rubberband(1e6, WIDTH)).toBeLessThan(WIDTH);
  });

  it('follows the finger 1:1 toward the edge, never past the width', () => {
    expect(panelSwipeOffset(120, WIDTH)).toBe(120);
    expect(panelSwipeOffset(WIDTH + 50, WIDTH)).toBe(WIDTH);
    expect(panelSwipeOffset(-60, WIDTH)).toBeLessThan(0);
    expect(panelSwipeOffset(-60, WIDTH)).toBeGreaterThan(-60);
  });

  it('closes past 40% of the width or on a 500 px/s flick, else springs home', () => {
    expect(shouldClosePanel(WIDTH * PANEL_SWIPE_CLOSE_RATIO, WIDTH, 0)).toBe(true);
    expect(shouldClosePanel(WIDTH * PANEL_SWIPE_CLOSE_RATIO - 1, WIDTH, 0)).toBe(false);
    expect(shouldClosePanel(20, WIDTH, PANEL_SWIPE_CLOSE_VELOCITY)).toBe(true);
    // A flick back inward keeps it open even from far out.
    expect(shouldClosePanel(WIDTH * 0.8, WIDTH, -PANEL_SWIPE_CLOSE_VELOCITY)).toBe(false);
  });
});

describe('release velocity', () => {
  it('reads the last 100 ms, lift included', () => {
    const samples = [
      { t: 0, x: 0 },
      { t: 950, x: 100 },
      { t: 1000, x: 140 },
    ];
    // 40 px over 50 ms = 800 px/s; the sample at 0 is outside the window.
    expect(releaseVelocity(samples, 1000)).toBeCloseTo(800);
  });

  it('is zero for a finger that rested before lifting', () => {
    // A fast move, then a 1 s pause, then the lift where the finger rested.
    const samples = [
      { t: 0, x: 0 },
      { t: 50, x: 100 },
      { t: 1050, x: 100 },
    ];
    expect(releaseVelocity(samples, 1050)).toBe(0);
    // Without the lift sample, nothing recent is left either.
    expect(releaseVelocity(samples.slice(0, 2), 1050)).toBe(0);
  });
});

const ws: WorkspaceDefinition = { id: 'ws-test', name: 'Test', icon: null };
const apps: AppDefinition[] = [{ id: 'app-a', label: 'App A', icon: Info }];
const views: PanelView[] = [
  {
    id: 'notes',
    label: 'Notes',
    icon: Info,
    render: () => (
      <div>
        <p data-testid="body">Body</p>
        <input aria-label="Field" />
      </div>
    ),
  },
];

let shell: ReturnType<typeof useMedaShell> | null = null;
function Probe() {
  shell = useMedaShell();
  return null;
}

function renderPanel(swipeToClose: boolean) {
  const storage = {
    load: vi.fn(() => ({
      contextRail: { width: 300, collapsed: false },
      rightPanel: { mode: 'panel', activeView: 'notes', width: WIDTH },
    })),
    save: vi.fn(),
  };
  render(
    <MedaShellProvider workspace={ws} apps={apps} storage={storage}>
      <Probe />
      <RightPanel panelViews={views} defaultView="notes" swipeToClose={swipeToClose} />
    </MedaShellProvider>
  );
  return document.querySelector('aside') as HTMLElement;
}

// jsdom stamps events from Date.now(), so fake timers pace the drag: one
// move every 200 ms keeps the release speed well under the flick threshold.
function drag(
  target: Element,
  from: number,
  to: number,
  opts: { type?: string; dy?: number } = {}
) {
  const pointer = { pointerId: 1, pointerType: opts.type ?? 'touch' };
  vi.useFakeTimers({ toFake: ['Date'] });
  fireEvent.pointerDown(target, { ...pointer, clientX: from, clientY: 100 });
  const steps = 6;
  for (let i = 1; i <= steps; i++) {
    vi.advanceTimersByTime(200);
    fireEvent.pointerMove(target, {
      ...pointer,
      clientX: from + ((to - from) * i) / steps,
      clientY: 100 + ((opts.dy ?? 0) * i) / steps,
    });
  }
  return () => {
    vi.advanceTimersByTime(16);
    act(() => {
      fireEvent.pointerUp(target, { ...pointer, clientX: to, clientY: 100 });
    });
    vi.useRealTimers();
  };
}

describe('RightPanel swipeToClose', () => {
  it('moves with the finger and closes on a long release', () => {
    const aside = renderPanel(true);
    expect(aside).toHaveClass('touch-pan-y');
    const release = drag(aside.querySelector('[data-testid="body"]') as Element, 500, 700);
    expect(aside.style.transform).toBe('translateX(200px)');
    expect(aside.style.getPropertyValue('--meda-panel-swipe-progress')).toBe(String(200 / WIDTH));
    release();
    expect(shell?.panel.mode).toBe('closed');
    expect(aside.style.transform).toBe('');
  });

  it('stays off-screen after a close until the closed mode commits, never painting back first', () => {
    const el = document.createElement('div');
    const child = document.createElement('p');
    el.appendChild(child);
    document.body.appendChild(el);
    const ref = { current: el };
    const onClose = vi.fn();
    const { rerender } = renderHook(
      ({ enabled }) => usePanelSwipe(ref, { enabled, onClose, resetKey: 'panel' }),
      { initialProps: { enabled: true } }
    );
    drag(child, 500, 700)();
    // onClose ran, but nothing has re-rendered the closed panel yet.
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(el.style.transform).toBe(`translateX(${WIDTH}px)`);
    // The closed mode turns the swipe off: the cleanup clears it.
    rerender({ enabled: false });
    expect(el.style.transform).toBe('');
    el.remove();
  });

  it('springs home on a short release', () => {
    const aside = renderPanel(true);
    const release = drag(aside.querySelector('[data-testid="body"]') as Element, 500, 560);
    release();
    expect(shell?.panel.mode).toBe('panel');
    expect(aside.style.transform).toBe('');
  });

  it('leaves a vertical drag to the scroller', () => {
    const aside = renderPanel(true);
    const release = drag(aside.querySelector('[data-testid="body"]') as Element, 500, 520, {
      dy: 200,
    });
    expect(aside.style.transform).toBe('');
    release();
    expect(shell?.panel.mode).toBe('panel');
  });

  it('never starts on a field, and never for a mouse', () => {
    const aside = renderPanel(true);
    drag(aside.querySelector('input') as Element, 500, 800)();
    expect(shell?.panel.mode).toBe('panel');
    drag(aside.querySelector('[data-testid="body"]') as Element, 500, 800, { type: 'mouse' })();
    expect(shell?.panel.mode).toBe('panel');
  });

  it('takes the lift position into the close decision', () => {
    const aside = renderPanel(true);
    const body = aside.querySelector('[data-testid="body"]') as Element;
    const pointer = { pointerId: 1, pointerType: 'touch' };
    vi.useFakeTimers({ toFake: ['Date'] });
    fireEvent.pointerDown(body, { ...pointer, clientX: 500, clientY: 100 });
    vi.advanceTimersByTime(200);
    fireEvent.pointerMove(body, { ...pointer, clientX: 520, clientY: 100 });
    vi.advanceTimersByTime(400);
    // The last stretch arrives only with the lift: 520 → 700 is past 40%.
    act(() => {
      fireEvent.pointerUp(body, { ...pointer, clientX: 700, clientY: 100 });
    });
    vi.useRealTimers();
    expect(shell?.panel.mode).toBe('closed');
  });

  it('drops a half-finished swipe when the mode changes', () => {
    const aside = renderPanel(true);
    drag(aside.querySelector('[data-testid="body"]') as Element, 500, 600);
    vi.useRealTimers();
    expect(aside.style.transform).toBe('translateX(100px)');
    act(() => shell?.panel.setMode('expanded'));
    expect(aside.style.transform).toBe('');
    expect(shell?.panel.mode).toBe('expanded');
  });

  it('keeps vertical scrolling and pinch-zoom on the panel and its body scroller', () => {
    const aside = renderPanel(true);
    expect(aside).toHaveClass('touch-pan-y', 'touch-pinch-zoom');
    const scroller = aside.querySelector('.overflow-y-auto') as HTMLElement;
    expect(scroller).toHaveClass('touch-pan-y', 'touch-pinch-zoom');
  });

  it('is off unless asked for', () => {
    const aside = renderPanel(false);
    expect(aside).not.toHaveClass('touch-pan-y');
    drag(aside.querySelector('[data-testid="body"]') as Element, 500, 800)();
    expect(shell?.panel.mode).toBe('panel');
    expect(aside.style.transform).toBe('');
  });
});
