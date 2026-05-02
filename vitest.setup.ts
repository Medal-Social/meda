import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import * as React from 'react';
import { afterEach, expect, vi } from 'vitest';
// Value-side import lives under dist/; the package's matchers.d.ts only re-exports as types.
import { toHaveNoViolations } from 'vitest-axe/dist/matchers.js';

// vitest-axe matcher — registered globally so per-folder wcag.test.tsx files
// don't have to repeat the augmentation/extension dance.
declare module 'vitest' {
  // Match @testing-library/jest-dom/vitest's signature so TS doesn't conflict.
  // biome-ignore lint/suspicious/noExplicitAny: must align with jest-dom declaration
  interface Assertion<T = any> {
    toHaveNoViolations(): T;
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): unknown;
  }
}

expect.extend({ toHaveNoViolations });

// Tear down rendered DOM between tests so that getByText assertions don't
// match nodes left behind by previous renders (testing-library doesn't
// auto-cleanup when vitest is configured with `globals: false`).
afterEach(() => {
  cleanup();
});

// vaul (drawer primitive) wraps @radix-ui/react-focus-scope, which schedules
// a setTimeout-based focus restoration on mount. When a test unmounts the
// drawer and RTL `cleanup()` tears down the DOM, the pending timer can fire
// against a detached tree and jsdom's dispatchEvent rejects it as a non-Event.
// The error is benign — assertions already passed before teardown — but
// vitest counts it as a job-level unhandled exception (red CI even when all
// tests pass). Swallow this specific message; rethrow anything else.
process.on('uncaughtException', (err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("dispatchEvent' on 'EventTarget': parameter 1 is not of type 'Event'")) {
    return;
  }
  throw err;
});

// Mock ResizeObserver — required by @xyflow/react canvas measurement and a
// handful of Base UI primitives. jsdom does not provide one.
if (typeof globalThis.ResizeObserver === 'undefined') {
  // biome-ignore lint/suspicious/noExplicitAny: minimal polyfill stub
  (globalThis as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// jsdom does not implement DOMMatrixReadOnly used by xyflow internals.
if (typeof globalThis.DOMMatrixReadOnly === 'undefined') {
  // biome-ignore lint/suspicious/noExplicitAny: minimal polyfill stub
  (globalThis as any).DOMMatrixReadOnly = class {
    m22 = 1;
  };
}

// Mock window.localStorage — jsdom provides it, but some environments
// (e.g. happy-dom or stripped-down jsdom configs) drop it. The shell theme
// hook reads/writes 'meda:theme' on mount, which would crash mounting tests.
if (typeof window.localStorage?.getItem !== 'function') {
  const store = new Map<string, string>();
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => (store.has(key) ? (store.get(key) ?? null) : null),
      setItem: (key: string, value: string) => {
        store.set(key, String(value));
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
      clear: () => store.clear(),
      key: (index: number) => Array.from(store.keys())[index] ?? null,
      get length() {
        return store.size;
      },
    },
  });
}

// Mock window.matchMedia (not available in jsdom)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock HTMLCanvasElement.getContext for jsdom
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  fillText: vi.fn(),
  clearRect: vi.fn(),
  strokeRect: vi.fn(),
  fillStyle: '',
  font: '',
  lineWidth: 1,
  strokeStyle: '',
})) as unknown as (contextId: string, options?: unknown) => CanvasRenderingContext2D | null;

// Mock @react-three/fiber so tests run in jsdom without WebGL
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'r3f-canvas' }, children),
  useFrame: vi.fn(),
  useThree: () => ({ size: { width: 144, height: 144 }, gl: {} }),
}));

// Mock @react-three/drei (no-op any imports)
vi.mock('@react-three/drei', () => ({}));

// Mock the Scene component so R3F JSX doesn't reach jsdom
vi.mock('./src/voice/voice-orb-scene.js', () => ({
  Scene: () => null,
}));
vi.mock('./src/voice/voice-orb-scene.tsx', () => ({
  Scene: () => null,
}));

// Partially mock three — keep all real exports, stub the WebGLRenderer
vi.mock('three', async (importOriginal) => {
  const actual = (await importOriginal()) as object;
  return {
    ...actual,
    WebGLRenderer: vi.fn().mockImplementation(() => ({
      setSize: vi.fn(),
      render: vi.fn(),
      dispose: vi.fn(),
    })),
  };
});
