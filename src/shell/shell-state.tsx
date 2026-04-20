import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export const DEFAULT_SIDE_PANEL_WIDTH = 360;
export const MIN_SIDE_PANEL_WIDTH = 280;
export const MAX_SIDE_PANEL_WIDTH = 520;

export interface ShellSearchParamsAdapter {
  searchParams: URLSearchParams;
  setSearchParams: (updater: (currentSearchParams: URLSearchParams) => URLSearchParams) => void;
}

export interface ShellStateContextValue {
  activePanelView: string | null;
  lastPanelView: string | null;
  setActivePanelView: (view: string | null) => void;
  closePanelView: () => void;
  restoreLastPanelView: (fallbackView: string | null) => void;
  togglePanelView: (viewId: string) => void;
  sidePanelWidth: number;
  setSidePanelWidth: (width: number) => void;
  activeRail: string;
  setActiveRail: (rail: string) => void;
  selectedEntityId: string | null;
  selectEntity: (entityId: string, options?: { panelView?: string | null }) => void;
  clearEntity: () => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
}

const ShellStateContext = createContext<ShellStateContextValue | null>(null);

export function clampSidePanelWidth(width: number) {
  return Math.min(MAX_SIDE_PANEL_WIDTH, Math.max(MIN_SIDE_PANEL_WIDTH, width));
}

function readStoredSidePanelWidth(storageKey: string) {
  if (typeof window === 'undefined') return DEFAULT_SIDE_PANEL_WIDTH;

  const storedValue =
    typeof window.localStorage?.getItem === 'function' ? window.localStorage.getItem(storageKey) : null;
  const stored = Number(storedValue);
  return Number.isFinite(stored) && stored > 0
    ? clampSidePanelWidth(stored)
    : DEFAULT_SIDE_PANEL_WIDTH;
}

export function ShellStateProvider({
  children,
  adapter,
  initialActiveRail = 'home',
  panelQueryParam = 'panel',
  selectionQueryParam = 'selection',
  sidePanelWidthStorageKey = 'meda.side-panel.width',
}: {
  children: ReactNode;
  adapter: ShellSearchParamsAdapter;
  initialActiveRail?: string;
  panelQueryParam?: string;
  selectionQueryParam?: string;
  sidePanelWidthStorageKey?: string;
}) {
  const { searchParams, setSearchParams } = adapter;
  const [sidePanelWidthState, setSidePanelWidthState] = useState(() =>
    readStoredSidePanelWidth(sidePanelWidthStorageKey)
  );
  const [activeRail, setActiveRail] = useState(initialActiveRail);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const lastPanelViewRef = useRef<string | null>(null);
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const activePanelView = searchParams.get(panelQueryParam);
  const selectedEntityId = searchParams.get(selectionQueryParam);

  useEffect(() => {
    if (activePanelView) {
      lastPanelViewRef.current = activePanelView;
    }
  }, [activePanelView]);

  useEffect(() => {
    return () => {
      clearTimeout(persistTimerRef.current);
    };
  }, []);

  function updateSearchParams(
    mutate: (nextSearchParams: URLSearchParams) => void
  ) {
    setSearchParams((currentSearchParams) => {
      const nextSearchParams = new URLSearchParams(currentSearchParams);
      mutate(nextSearchParams);
      return nextSearchParams;
    });
  }

  function setActivePanelView(view: string | null) {
    if (view) {
      lastPanelViewRef.current = view;
    }

    updateSearchParams((nextSearchParams) => {
      if (view) {
        nextSearchParams.set(panelQueryParam, view);
      } else {
        nextSearchParams.delete(panelQueryParam);
      }
    });
  }

  function closePanelView() {
    updateSearchParams((nextSearchParams) => {
      nextSearchParams.delete(panelQueryParam);
    });
  }

  function restoreLastPanelView(fallbackView: string | null) {
    const nextView = lastPanelViewRef.current ?? fallbackView;
    if (!nextView) return;
    setActivePanelView(nextView);
  }

  function setSidePanelWidth(width: number) {
    const nextWidth = clampSidePanelWidth(width);
    setSidePanelWidthState(nextWidth);

    clearTimeout(persistTimerRef.current);
    persistTimerRef.current = setTimeout(() => {
      if (typeof window !== 'undefined' && typeof window.localStorage?.setItem === 'function') {
        window.localStorage.setItem(sidePanelWidthStorageKey, String(nextWidth));
      }
    }, 300);
  }

  function togglePanelView(viewId: string) {
    if (activePanelView === viewId) {
      closePanelView();
      return;
    }

    setActivePanelView(viewId);
  }

  function selectEntity(entityId: string, options?: { panelView?: string | null }) {
    updateSearchParams((nextSearchParams) => {
      nextSearchParams.set(selectionQueryParam, entityId);

      if (options?.panelView) {
        nextSearchParams.set(panelQueryParam, options.panelView);
      }
    });
  }

  function clearEntity() {
    updateSearchParams((nextSearchParams) => {
      nextSearchParams.delete(selectionQueryParam);
    });
  }

  function openCommandPalette() {
    setCommandPaletteOpen(true);
  }

  function closeCommandPalette() {
    setCommandPaletteOpen(false);
  }

  const value = useMemo<ShellStateContextValue>(
    () => ({
      activePanelView,
      lastPanelView: lastPanelViewRef.current,
      setActivePanelView,
      closePanelView,
      restoreLastPanelView,
      togglePanelView,
      sidePanelWidth: sidePanelWidthState,
      setSidePanelWidth,
      activeRail,
      setActiveRail,
      selectedEntityId,
      selectEntity,
      clearEntity,
      commandPaletteOpen,
      setCommandPaletteOpen,
      openCommandPalette,
      closeCommandPalette,
    }),
    [activePanelView, activeRail, commandPaletteOpen, selectedEntityId, sidePanelWidthState]
  );

  return <ShellStateContext.Provider value={value}>{children}</ShellStateContext.Provider>;
}

export function useShellState() {
  const context = useContext(ShellStateContext);

  if (!context) {
    throw new Error('useShellState must be used within a ShellStateProvider');
  }

  return context;
}
