'use client';

import { LayoutGrid, Menu, PanelTop, Sparkles } from 'lucide-react';
import {
  createContext,
  lazy,
  type ReactNode,
  Suspense,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  createLocalStorageAdapter,
  type ShellStorageAdapter,
  useShellLayoutState,
} from './layout-state.js';
import { DefaultThemeProvider, ThemeCtx } from './theme.js';
import type {
  AppDefinition,
  MobileBottomNavItem,
  PanelMode,
  ThemeAdapter,
  WorkspaceDefinition,
} from './types.js';

// ---------------------------------------------------------------------------
// MobileDrawer types
// ---------------------------------------------------------------------------

export type MobileDrawerKind =
  | 'menu-drawer'
  | 'module-drawer'
  | 'panels-drawer'
  | 'ai-drawer'
  | (string & {})
  | null;

// ---------------------------------------------------------------------------
// Theme adapter wiring
// ---------------------------------------------------------------------------

// Lazy-loaded so that importing next-themes only happens when the consumer
// passes themeAdapter='next-themes'. Default-adapter consumers never trigger
// the import.
const NextThemesAdapter = lazy(() =>
  import('./theme-next-themes.js').then((m) => ({ default: m.NextThemesAdapter }))
);

function CustomThemeBridge({ adapter, children }: { adapter: ThemeAdapter; children: ReactNode }) {
  return <ThemeCtx.Provider value={adapter}>{children}</ThemeCtx.Provider>;
}

function pickTheme(
  themeAdapter: 'default' | 'next-themes' | ThemeAdapter | undefined,
  children: ReactNode
): ReactNode {
  const adapter = themeAdapter ?? 'default';
  if (adapter === 'default') {
    return <DefaultThemeProvider>{children}</DefaultThemeProvider>;
  }
  if (adapter === 'next-themes') {
    return (
      <Suspense fallback={null}>
        <NextThemesAdapter>{children}</NextThemesAdapter>
      </Suspense>
    );
  }
  // Custom ThemeAdapter object
  return <CustomThemeBridge adapter={adapter}>{children}</CustomThemeBridge>;
}

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
    width: number;
    setMode: (m: PanelMode) => void;
    setActiveView: (v: string | null) => void;
    setWidth: (w: number) => void;
    /** Opens panel + switches to viewId in one call.
     * Sugar for app keyboard shortcuts (e.g. Cmd+J → panel.focus('ai')).
     * If already open in 'panel', 'expanded', or 'fullscreen', the existing
     * mode is preserved — only flips closed → panel. */
    focus: (viewId: string) => void;
  };
  contextRail: {
    width: number;
    collapsed: boolean;
    setWidth: (w: number) => void;
    setCollapsed: (c: boolean) => void;
  };
  mobileBottomNav: MobileBottomNavItem[];
  mobileDrawer: {
    open: MobileDrawerKind;
    setOpen: (kind: MobileDrawerKind) => void;
  };
  commandPalette: {
    open: boolean;
    setOpen: (open: boolean) => void;
  };
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

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<MobileDrawerKind>(null);

  const mobileDrawer = useMemo(
    () => ({
      open: mobileDrawerOpen,
      setOpen: setMobileDrawerOpen,
    }),
    [mobileDrawerOpen]
  );

  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const commandPalette = useMemo(
    () => ({
      open: commandPaletteOpen,
      setOpen: setCommandPaletteOpen,
    }),
    [commandPaletteOpen]
  );

  const [layoutState, setLayoutState] = useShellLayoutState({
    workspaceId: props.workspace.id,
    appId: activeAppId,
    storage,
  });

  const panel = useMemo(
    () => ({
      mode: layoutState.rightPanel.mode,
      activeView: layoutState.rightPanel.activeView,
      width: layoutState.rightPanel.width,
      setMode: (mode: PanelMode) =>
        setLayoutState((prev) => ({
          ...prev,
          rightPanel: { ...prev.rightPanel, mode },
        })),
      setActiveView: (activeView: string | null) =>
        setLayoutState((prev) => ({
          ...prev,
          rightPanel: { ...prev.rightPanel, activeView },
        })),
      setWidth: (width: number) =>
        setLayoutState((prev) => ({
          ...prev,
          rightPanel: { ...prev.rightPanel, width },
        })),
      // focus(viewId) — opens panel + switches to view in one call.
      // Only flips closed → panel; preserves expanded / fullscreen modes.
      focus: (viewId: string) =>
        setLayoutState((prev) => {
          const nextMode: PanelMode =
            prev.rightPanel.mode === 'closed' ? 'panel' : prev.rightPanel.mode;
          return {
            ...prev,
            rightPanel: { ...prev.rightPanel, mode: nextMode, activeView: viewId },
          };
        }),
    }),
    [layoutState, setLayoutState]
  );

  const contextRail = useMemo(
    () => ({
      width: layoutState.contextRail.width,
      collapsed: layoutState.contextRail.collapsed,
      setWidth: (width: number) =>
        setLayoutState((prev) => ({
          ...prev,
          contextRail: { ...prev.contextRail, width },
        })),
      setCollapsed: (collapsed: boolean) =>
        setLayoutState((prev) => ({
          ...prev,
          contextRail: { ...prev.contextRail, collapsed },
        })),
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
      mobileDrawer,
      commandPalette,
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
      mobileDrawer,
      commandPalette,
      props.commandPaletteHotkey,
      selection,
    ]
  );

  return <Ctx.Provider value={value}>{pickTheme(props.themeAdapter, props.children)}</Ctx.Provider>;
}
