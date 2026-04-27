import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createLocalStorageAdapter } from './layout-state';

function createStorageMock() {
  const store = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    }),
  };
}

describe('storage adapter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('localStorage', createStorageMock());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('default reads/writes localStorage with debounced 200ms writes', () => {
    const adapter = createLocalStorageAdapter();

    adapter.save('meda:test', { x: 1 });

    // Still pending — no write yet
    expect(localStorage.getItem('meda:test')).toBeNull();

    vi.advanceTimersByTime(200);

    // Now flushed
    expect(localStorage.getItem('meda:test')).toBe(JSON.stringify({ x: 1 }));

    // load round-trips the value
    expect(adapter.load('meda:test')).toEqual({ x: 1 });
  });

  it('rapid successive saves within the 200ms window coalesce into one write', () => {
    const adapter = createLocalStorageAdapter();

    adapter.save('meda:test', { x: 1 });
    adapter.save('meda:test', { x: 2 });
    adapter.save('meda:test', { x: 3 });

    expect(localStorage.getItem('meda:test')).toBeNull();

    vi.advanceTimersByTime(200);

    // Only the last value survives
    expect(localStorage.getItem('meda:test')).toBe(JSON.stringify({ x: 3 }));

    // setItem called exactly once for this key (debounce coalesced the calls)
    const callsForKey = (localStorage.setItem as ReturnType<typeof vi.fn>).mock.calls.filter(
      ([k]: [string, string]) => k === 'meda:test'
    );
    expect(callsForKey).toHaveLength(1);
  });

  it('restore returns null when no stored value', () => {
    const adapter = createLocalStorageAdapter();
    expect(adapter.load('meda:nonexistent')).toBeNull();
  });

  it('SSR-safe: no window access at module load; load/save no-op when window is undefined', () => {
    vi.stubGlobal('window', undefined);

    try {
      const adapter = createLocalStorageAdapter();

      // load must return null, not throw
      expect(adapter.load('meda:test')).toBeNull();

      // save must not throw
      expect(() => adapter.save('meda:test', { x: 1 })).not.toThrow();

      // Advance timers — the deferred flush must not throw either
      vi.advanceTimersByTime(200);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
