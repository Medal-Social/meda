'use client';

import { useCallback, useEffect, useState } from 'react';
import type { PanelMode } from './types.js';

export interface ShellStorageAdapter {
  load: (key: string) => unknown;
  save: (key: string, value: unknown) => void;
}

export function createLocalStorageAdapter(): ShellStorageAdapter {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: Record<string, unknown> = {};

  // Single shared timer across keys: the debounce window resets on every
  // save() and flushes all pending keys together. Intentional — layout
  // updates tend to arrive in bursts (rail width + panel mode at once).
  return {
    load: (key) => {
      if (typeof window === 'undefined') return null;
      try {
        const raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch {
        /* swallow quota / parse errors */
        return null;
      }
    },
    save: (key, value) => {
      if (typeof window === 'undefined') return;
      pending[key] = value;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        for (const [k, v] of Object.entries(pending)) {
          try {
            window.localStorage.setItem(k, JSON.stringify(v));
          } catch {
            /* swallow quota errors */
          }
        }
        pending = {};
      }, 200);
    },
  };
}

// ---------------------------------------------------------------------------
// useShellLayoutState
// ---------------------------------------------------------------------------

export interface ShellLayoutState {
  contextRail: { width: number; collapsed: boolean };
  rightPanel: { mode: PanelMode; activeView: string | null; width: number };
}

export type ShellLayoutStateUpdater =
  | ShellLayoutState
  | ((prev: ShellLayoutState) => ShellLayoutState);

const DEFAULTS: ShellLayoutState = {
  contextRail: { width: 300, collapsed: false },
  rightPanel: { mode: 'closed', activeView: null, width: 340 },
};

function isShellLayoutState(value: unknown): value is ShellLayoutState {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<ShellLayoutState>;
  if (
    !v.contextRail ||
    typeof v.contextRail.width !== 'number' ||
    typeof v.contextRail.collapsed !== 'boolean'
  ) {
    return false;
  }
  if (!v.rightPanel || typeof v.rightPanel.width !== 'number') return false;
  const validModes: PanelMode[] = ['closed', 'panel', 'expanded', 'fullscreen'];
  if (!validModes.includes(v.rightPanel.mode as PanelMode)) return false;
  if (v.rightPanel.activeView !== null && typeof v.rightPanel.activeView !== 'string') return false;
  return true;
}

interface UseShellLayoutStateArgs {
  workspaceId: string;
  appId: string;
  storage: ShellStorageAdapter;
}

/**
 * Per-(workspaceId, appId) layout state with localStorage persistence.
 *
 * The `storage` adapter must be referentially stable across renders (typically
 * memoized once at the provider level). An inline-constructed adapter would
 * loop the hydration effect and clobber local mutations.
 */
export function useShellLayoutState({
  workspaceId,
  appId,
  storage,
}: UseShellLayoutStateArgs): readonly [ShellLayoutState, (next: ShellLayoutStateUpdater) => void] {
  const key = `meda:shell:${workspaceId}:${appId}`;
  const [state, setStateInternal] = useState<ShellLayoutState>(DEFAULTS);

  // Hydrate after mount. Effect re-runs when key changes (workspace/app switch).
  useEffect(() => {
    const stored = storage.load(key);
    if (isShellLayoutState(stored)) {
      setStateInternal(stored);
    }
  }, [key, storage]);

  const setState = useCallback(
    (next: ShellLayoutStateUpdater) => {
      setStateInternal((prev) => {
        const resolved = typeof next === 'function' ? next(prev) : next;
        storage.save(key, resolved);
        return resolved;
      });
    },
    [key, storage]
  );

  return [state, setState] as const;
}
