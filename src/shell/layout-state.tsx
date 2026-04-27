'use client';

export interface ShellStorageAdapter {
  load: (key: string) => unknown;
  save: (key: string, value: unknown) => void;
}

export function createLocalStorageAdapter(): ShellStorageAdapter {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: Record<string, unknown> = {};

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
