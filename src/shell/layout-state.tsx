'use client';

import { useEffect, useState } from 'react';
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

const DEFAULTS: ShellLayoutState = {
  contextRail: { width: 300, collapsed: false },
  rightPanel: { mode: 'closed', activeView: null, width: 340 },
};

interface UseShellLayoutStateArgs {
  workspaceId: string;
  appId: string;
  storage: ShellStorageAdapter;
}

export function useShellLayoutState({
  workspaceId,
  appId,
  storage,
}: UseShellLayoutStateArgs): readonly [ShellLayoutState, (next: ShellLayoutState) => void] {
  const key = `meda:shell:${workspaceId}:${appId}`;
  const [state, setStateInternal] = useState<ShellLayoutState>(DEFAULTS);

  // Hydrate after mount. Effect re-runs when key changes (workspace/app switch).
  useEffect(() => {
    const stored = storage.load(key);
    if (stored !== null && typeof stored === 'object') {
      setStateInternal(stored as ShellLayoutState);
    }
  }, [key, storage]);

  const setState = (next: ShellLayoutState) => {
    setStateInternal(next);
    storage.save(key, next);
  };

  return [state, setState] as const;
}
