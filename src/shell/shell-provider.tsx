'use client';

import { LayoutGrid, Menu, PanelTop, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';
import {
  createLocalStorageAdapter,
  type ShellStorageAdapter,
  useShellLayoutState,
} from './layout-state.js';
import type {
  AppDefinition,
  MobileBottomNavItem,
  PanelMode,
  ThemeAdapter,
  WorkspaceDefinition,
} from './types.js';

// ---------------------------------------------------------------------------
// Default mobile bottom nav (canonical 4-item set, per spec §16)
// Full icons ship here; the per-app customisation point is the mobileBottomNav
// prop. For RC.1 the canonical drawer wire-up is a Phase 13 concern — only
// the shape is locked here.
// ---------------------------------------------------------------------------

const defaultMobileBottomNav: MobileBottomNavItem[] = [
  { id: 'menu', label: 'Menu', icon: Menu, opens: 'menu-drawer' },
  { id: 'module', label: 'Module', icon: LayoutGrid, opens: 'module-drawer' },
  { id: 'panels', label: 'Panels', icon: PanelTop, opens: 'panels-drawer' },
  { id: 'ai', label: 'AI', icon: Sparkles, opens: 'ai-drawer' },
];

// ---------------------------------------------------------------------------
// Context value shape
// ---------------------------------------------------------------------------

interface MedaShellContextValue {
  workspace: WorkspaceDefinition;
  workspaces: WorkspaceDefinition[];
  apps: AppDefinition[];
  activeAppId: string;
  setActiveApp: (id: string) => void;
  panel: {
    mode: PanelMode;
    activeView: string | null;
    setMode: (m: PanelMode) => void;
    setActiveView: (v: string | null) => void;
  };
  contextRail: {
    width: number;
    collapsed: boolean;
    setWidth: (w: number) => void;
    setCollapsed: (c: boolean) => void;
  };
  mobileBottomNav: MobileBottomNavItem[];
  commandPaletteHotkey: string;
  /** Selection bridge between main workspace and right panel views (spec §17). */
  selection: unknown | null;
  setSelection: (value: unknown | null) => void;
}

const Ctx = createContext<MedaShellContextValue | null>(null);

export function useMedaShell(): MedaShellContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useMedaShell must be used inside <MedaShellProvider>');
  return v;
}

/**
 * Selection bridge between main workspace and right panel views (spec §17).
 *
 * `T` is consumer-typed: setSelection writes whatever shape you pass; the
 * matching getter narrows to `T | null`. The shell does not validate the
 * shape — coordinate types between writer and readers in your app.
 */
export function useShellSelection<T>(): readonly [T | null, (value: T | null) => void] {
  const ctx = useMedaShell();
  return [ctx.selection as T | null, ctx.setSelection as (value: T | null) => void] as const;
}

// ---------------------------------------------------------------------------
// Provider props
// ---------------------------------------------------------------------------

export interface MedaShellProviderProps {
  workspace: WorkspaceDefinition;
  workspaces?: WorkspaceDefinition[];
  apps: AppDefinition[];
  defaultActiveApp?: string;
  storage?: ShellStorageAdapter;
  mobileBottomNav?: MobileBottomNavItem[];
  commandPaletteHotkey?: string;
  /** Placeholder — theme wiring ships in Phase 11. */
  themeAdapter?: 'default' | 'next-themes' | ThemeAdapter;
  children: ReactNode;
}

// ---------------------------------------------------------------------------
// Provider implementation
// ---------------------------------------------------------------------------

export function MedaShellProvider(props: MedaShellProviderProps) {
  // Guard: apps array must not be empty
  if (props.apps.length === 0) {
    throw new Error('MedaShellProvider: apps must contain at least one AppDefinition');
  }

  // Stable storage reference — prevents useShellLayoutState's hydration
  // effect from looping when an inline adapter would change identity each render.
  const storage = useMemo(() => props.storage ?? createLocalStorageAdapter(), [props.storage]);

  const [activeAppId, setActiveApp] = useState(props.defaultActiveApp ?? props.apps[0]?.id ?? '');

  const [selection, setSelection] = useState<unknown | null>(null);

  const [layoutState, setLayoutState] = useShellLayoutState({
    workspaceId: props.workspace.id,
    appId: activeAppId,
    storage,
  });

  // NOTE: The narrower setters read the closure-captured `layoutState`.
  // Calling two setters in the same tick means only the last write wins.
  // This is acceptable for RC.1; add updater-form support to
  // useShellLayoutState as a follow-up if needed.

  const panel = useMemo(
    () => ({
      mode: layoutState.rightPanel.mode,
      activeView: layoutState.rightPanel.activeView,
      setMode: (mode: PanelMode) =>
        setLayoutState({
          ...layoutState,
          rightPanel: { ...layoutState.rightPanel, mode },
        }),
      setActiveView: (activeView: string | null) =>
        setLayoutState({
          ...layoutState,
          rightPanel: { ...layoutState.rightPanel, activeView },
        }),
    }),
    [layoutState, setLayoutState]
  );

  const contextRail = useMemo(
    () => ({
      width: layoutState.contextRail.width,
      collapsed: layoutState.contextRail.collapsed,
      setWidth: (width: number) =>
        setLayoutState({
          ...layoutState,
          contextRail: { ...layoutState.contextRail, width },
        }),
      setCollapsed: (collapsed: boolean) =>
        setLayoutState({
          ...layoutState,
          contextRail: { ...layoutState.contextRail, collapsed },
        }),
    }),
    [layoutState, setLayoutState]
  );

  const value = useMemo<MedaShellContextValue>(
    () => ({
      workspace: props.workspace,
      workspaces: props.workspaces ?? [props.workspace],
      apps: props.apps,
      activeAppId,
      setActiveApp,
      panel,
      contextRail,
      mobileBottomNav: props.mobileBottomNav ?? defaultMobileBottomNav,
      commandPaletteHotkey: props.commandPaletteHotkey ?? 'mod+k',
      selection,
      setSelection,
    }),
    [
      props.workspace,
      props.workspaces,
      props.apps,
      activeAppId,
      panel,
      contextRail,
      props.mobileBottomNav,
      props.commandPaletteHotkey,
      selection,
    ]
  );

  return <Ctx.Provider value={value}>{props.children}</Ctx.Provider>;
}
