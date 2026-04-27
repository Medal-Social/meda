import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ShellStorageAdapter } from './layout-state';
import { createLocalStorageAdapter, useShellLayoutState } from './layout-state';

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

// ---------------------------------------------------------------------------
// useShellLayoutState
// ---------------------------------------------------------------------------

const DEFAULTS = {
  contextRail: { width: 300, collapsed: false },
  rightPanel: { mode: 'closed', activeView: null, width: 340 },
};

function makeStubStorage(loadReturn: unknown = null): ShellStorageAdapter {
  return {
    load: vi.fn(() => loadReturn),
    save: vi.fn(),
  };
}

describe('useShellLayoutState', () => {
  it('hydrates from storage in useEffect (initial render uses defaults)', async () => {
    const stored = {
      contextRail: { width: 260, collapsed: true },
      rightPanel: { mode: 'panel', activeView: 'chat', width: 380 },
    };
    const storage = makeStubStorage(stored);

    const { result } = renderHook(() =>
      useShellLayoutState({ workspaceId: 'w1', appId: 'a1', storage })
    );

    // storage.load must have been called (inside useEffect, after mount)
    expect(storage.load).toHaveBeenCalledTimes(1);

    // After effects settle, state should equal the stored value
    expect(result.current[0]).toEqual(stored);
  });

  it('writes through to adapter on update', () => {
    const storage = makeStubStorage(null);

    const { result } = renderHook(() =>
      useShellLayoutState({ workspaceId: 'w1', appId: 'a1', storage })
    );

    // null storage falls through to defaults
    expect(result.current[0]).toEqual(DEFAULTS);

    const next = {
      contextRail: { width: 250, collapsed: false },
      rightPanel: { mode: 'closed' as const, activeView: null, width: 340 },
    };

    act(() => {
      result.current[1](next);
    });

    expect(storage.save).toHaveBeenCalledTimes(1);
    expect(storage.save).toHaveBeenCalledWith('meda:shell:w1:a1', next);
    expect(result.current[0]).toEqual(next);
  });

  it('keys by (workspaceId, appId)', () => {
    const storage = makeStubStorage(null);

    // First hook instance: app a1
    const { result: r1 } = renderHook(() =>
      useShellLayoutState({ workspaceId: 'w1', appId: 'a1', storage })
    );

    const stateA1 = {
      contextRail: { width: 280, collapsed: false },
      rightPanel: { mode: 'closed' as const, activeView: null, width: 340 },
    };

    act(() => {
      r1.current[1](stateA1);
    });

    expect(storage.save).toHaveBeenLastCalledWith('meda:shell:w1:a1', stateA1);

    // Second hook instance: same workspace, different app a2
    const { result: r2 } = renderHook(() =>
      useShellLayoutState({ workspaceId: 'w1', appId: 'a2', storage })
    );

    const stateA2 = {
      contextRail: { width: 300, collapsed: false },
      rightPanel: { mode: 'panel' as const, activeView: 'notes', width: 360 },
    };

    act(() => {
      r2.current[1](stateA2);
    });

    expect(storage.save).toHaveBeenLastCalledWith('meda:shell:w1:a2', stateA2);
  });

  it('useShellLayoutState — ignores malformed stored value (falls through to defaults)', () => {
    const storage = makeStubStorage({ contextRail: 'wat' } as unknown);
    const { result } = renderHook(() =>
      useShellLayoutState({ workspaceId: 'w1', appId: 'a1', storage })
    );
    expect(result.current[0]).toEqual(DEFAULTS);
  });
});
