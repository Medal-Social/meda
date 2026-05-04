import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { LayoutGrid, Menu } from 'lucide-react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ShellStorageAdapter } from '../../../src/shell/../../src/shell/layout-state.js';

vi.mock('../../../src/shell/use-shell-viewport.js', () => ({
  useShellViewport: vi.fn(() => 'desktop'),
}));

import {
  MedaShellProvider,
  useMedaShell,
  useShellSelection,
} from '../../../src/shell/../../src/shell/shell-provider.js';
import { useTheme } from '../../../src/shell/../../src/shell/theme.js';
import type {
  AppDefinition,
  MobileBottomNavItem,
  ThemeAdapter,
  WorkspaceDefinition,
} from '../../../src/shell/../../src/shell/types.js';
import { useShellViewport } from '../../../src/shell/../../src/shell/use-shell-viewport.js';

// ---------------------------------------------------------------------------
// Global browser stubs — DefaultThemeProvider reads localStorage + matchMedia
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.mocked(useShellViewport).mockReturnValue('desktop');
  vi.stubGlobal('localStorage', {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  });
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  );
});

afterEach(() => {
  document.documentElement.classList.remove('dark');
  vi.unstubAllGlobals();
});

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const workspace: WorkspaceDefinition = { id: 'ws1', name: 'Test Workspace', icon: null };
const apps: AppDefinition[] = [
  { id: 'app-a', label: 'App A', icon: Menu },
  { id: 'app-b', label: 'App B', icon: LayoutGrid },
];

function makeStubStorage(loadReturn: unknown = null): ShellStorageAdapter {
  return {
    load: vi.fn(() => loadReturn),
    save: vi.fn(),
  };
}

function setShellViewport(viewport: 'mobile' | 'desktop') {
  vi.mocked(useShellViewport).mockReturnValue(viewport);
}

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <MedaShellProvider workspace={workspace} apps={apps}>
      {children}
    </MedaShellProvider>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useMedaShell', () => {
  it('throws outside provider', () => {
    // Suppress React's console.error for expected thrown errors
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      renderHook(() => useMedaShell());
    }).toThrow('useMedaShell must be used inside <MedaShellProvider>');
    spy.mockRestore();
  });
});

describe('MedaShellProvider', () => {
  it('throws when apps is empty', () => {
    // suppress React's expected error log noise
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(
        <MedaShellProvider workspace={workspace} apps={[]}>
          <div />
        </MedaShellProvider>
      )
    ).toThrow(/at least one AppDefinition/);
    errSpy.mockRestore();
  });

  it('exposes workspace, apps, activeApp, panel state via useMedaShell', () => {
    const { result } = renderHook(() => useMedaShell(), { wrapper: Wrapper });
    const ctx = result.current;

    // workspace
    expect(ctx.workspace).toEqual(workspace);
    // workspaces defaults to [workspace]
    expect(ctx.workspaces).toEqual([workspace]);
    // apps
    expect(ctx.apps).toEqual(apps);
    // activeAppId defaults to first app
    expect(ctx.activeAppId).toBe('app-a');
    // setActiveApp is a function
    expect(typeof ctx.setActiveApp).toBe('function');
    // panel shape
    expect(ctx.panel.mode).toBe('closed');
    expect(ctx.panel.activeView).toBeNull();
    expect(ctx.panel.width).toBe(340);
    expect(typeof ctx.panel.setMode).toBe('function');
    expect(typeof ctx.panel.setActiveView).toBe('function');
    expect(typeof ctx.panel.setWidth).toBe('function');
    expect(typeof ctx.panel.open).toBe('function');
    expect(typeof ctx.panel.close).toBe('function');
    expect(typeof ctx.panel.toggle).toBe('function');
    // contextRail shape
    expect(typeof ctx.contextRail.width).toBe('number');
    expect(typeof ctx.contextRail.collapsed).toBe('boolean');
    expect(typeof ctx.contextRail.setWidth).toBe('function');
    expect(typeof ctx.contextRail.setCollapsed).toBe('function');
    expect(typeof ctx.contextRail.toggle).toBe('function');
    // commandPaletteHotkey default
    expect(ctx.commandPaletteHotkey).toBe('mod+k');
  });

  it('switching activeApp writes data-meda-app to root via context (consumed by AppShell)', () => {
    // The provider exposes activeAppId; <AppShell> (Phase 5) applies
    // data-meda-app={activeAppId} to its root element. This test simulates
    // that pattern with a stub consumer.
    function Consumer() {
      const ctx = useMedaShell();
      return (
        <div>
          <div data-testid="app-attr" data-meda-app={ctx.activeAppId} />
          <button type="button" onClick={() => ctx.setActiveApp('app-b')}>
            switch
          </button>
        </div>
      );
    }

    render(
      <MedaShellProvider workspace={workspace} apps={apps} defaultActiveApp="app-a">
        <Consumer />
      </MedaShellProvider>
    );

    expect(screen.getByTestId('app-attr')).toHaveAttribute('data-meda-app', 'app-a');

    fireEvent.click(screen.getByText('switch'));

    expect(screen.getByTestId('app-attr')).toHaveAttribute('data-meda-app', 'app-b');
  });

  it('accepts custom storage adapter', () => {
    const storage = makeStubStorage(null);

    renderHook(() => useMedaShell(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <MedaShellProvider workspace={workspace} apps={apps} storage={storage}>
          {children}
        </MedaShellProvider>
      ),
    });

    // useShellLayoutState calls storage.load exactly once after mount
    expect(storage.load).toHaveBeenCalledTimes(1);
    expect(storage.load).toHaveBeenCalledWith('meda:shell:ws1:app-a');
  });

  it('accepts custom mobileBottomNav array', () => {
    const customNav: MobileBottomNavItem[] = [
      {
        id: 'foo',
        label: 'Foo',
        icon: Menu,
        opens: 'menu-drawer',
      },
    ];

    const { result } = renderHook(() => useMedaShell(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <MedaShellProvider workspace={workspace} apps={apps} mobileBottomNav={customNav}>
          {children}
        </MedaShellProvider>
      ),
    });

    expect(result.current.mobileBottomNav).toEqual(customNav);
  });

  it('accepts commandPaletteHotkey prop', () => {
    const { result } = renderHook(() => useMedaShell(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <MedaShellProvider workspace={workspace} apps={apps} commandPaletteHotkey="mod+shift+k">
          {children}
        </MedaShellProvider>
      ),
    });

    expect(result.current.commandPaletteHotkey).toBe('mod+shift+k');
  });
});

// ---------------------------------------------------------------------------
// useShellSelection
// ---------------------------------------------------------------------------

describe('useShellSelection', () => {
  it('getter/setter pair; null by default', () => {
    const { result } = renderHook(() => useShellSelection<{ id: string }>(), {
      wrapper: Wrapper,
    });

    // null by default
    expect(result.current[0]).toBeNull();

    // set a value
    act(() => {
      result.current[1]({ id: 'foo' });
    });
    expect(result.current[0]).toEqual({ id: 'foo' });

    // reset to null
    act(() => {
      result.current[1](null);
    });
    expect(result.current[0]).toBeNull();
  });

  it('multiple subscribers see same value', () => {
    type Sel = { id: string };

    function ConsumerA() {
      const [sel] = useShellSelection<Sel>();
      return <span data-testid="a">{JSON.stringify(sel)}</span>;
    }

    function ConsumerB() {
      const [sel] = useShellSelection<Sel>();
      return <span data-testid="b">{JSON.stringify(sel)}</span>;
    }

    function Trigger() {
      const [, setSelection] = useShellSelection<Sel>();
      return (
        <button type="button" onClick={() => setSelection({ id: 'x' })}>
          trigger
        </button>
      );
    }

    render(
      <MedaShellProvider workspace={workspace} apps={apps}>
        <ConsumerA />
        <ConsumerB />
        <Trigger />
      </MedaShellProvider>
    );

    // both start null
    expect(screen.getByTestId('a').textContent).toBe('null');
    expect(screen.getByTestId('b').textContent).toBe('null');

    fireEvent.click(screen.getByText('trigger'));

    expect(screen.getByTestId('a').textContent).toBe(JSON.stringify({ id: 'x' }));
    expect(screen.getByTestId('b').textContent).toBe(JSON.stringify({ id: 'x' }));
  });
});

// ---------------------------------------------------------------------------
// MedaShellProvider — themeAdapter prop
// ---------------------------------------------------------------------------

describe('MedaShellProvider — themeAdapter prop selects correct provider', () => {
  const baseProps = { workspace, apps };

  it('themeAdapter prop selects correct provider', () => {
    // Case 1: undefined (no themeAdapter) — DefaultThemeProvider, initial theme is 'system'
    const { result: defaultResult } = renderHook(() => useTheme(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <MedaShellProvider {...baseProps}>{children}</MedaShellProvider>
      ),
    });
    act(() => {});
    expect(defaultResult.current.theme).toBe('system');

    // Case 2: explicit 'default' — same behavior
    const { result: explicitDefaultResult } = renderHook(() => useTheme(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <MedaShellProvider {...baseProps} themeAdapter="default">
          {children}
        </MedaShellProvider>
      ),
    });
    act(() => {});
    expect(explicitDefaultResult.current.theme).toBe('system');

    // Case 3: custom adapter object — useTheme returns the custom values
    const customAdapter: ThemeAdapter = {
      theme: 'dark',
      setTheme: vi.fn(),
      resolvedTheme: 'dark',
    };
    const { result: customResult } = renderHook(() => useTheme(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <MedaShellProvider {...baseProps} themeAdapter={customAdapter}>
          {children}
        </MedaShellProvider>
      ),
    });
    act(() => {});
    expect(customResult.current.theme).toBe('dark');
    expect(customResult.current.resolvedTheme).toBe('dark');
  });

  it("themeAdapter='next-themes' renders children without crashing", async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))
    );

    render(
      <MedaShellProvider {...baseProps} themeAdapter="next-themes">
        <span data-testid="child">ok</span>
      </MedaShellProvider>
    );

    // Children render (may need a tick for Suspense + lazy to resolve).
    // Bumped timeout from default 1000ms — the compatibility adapter chunk is
    // lazy-loaded and can miss the default window under heavy concurrent
    // test load (e.g. the pre-commit hook running the full suite).
    await screen.findByTestId('child', undefined, { timeout: 5000 });
    expect(screen.getByTestId('child').textContent).toBe('ok');
  });
});

// ---------------------------------------------------------------------------
// MedaShellProvider — panel.width / panel.setWidth round-trip
// ---------------------------------------------------------------------------

describe('MedaShellProvider — panel.width / panel.setWidth round-trip via useShellLayoutState', () => {
  it('panel.width defaults to 340 (DEFAULTS in layout-state)', () => {
    const { result } = renderHook(() => useMedaShell(), { wrapper: Wrapper });
    expect(result.current.panel.width).toBe(340);
  });

  it('panel.setWidth updates panel.width in context', () => {
    const { result } = renderHook(() => useMedaShell(), { wrapper: Wrapper });

    act(() => {
      result.current.panel.setWidth(420);
    });

    expect(result.current.panel.width).toBe(420);
  });

  it('panel.setWidth persists width to storage adapter', () => {
    const storage = makeStubStorage(null);

    const { result } = renderHook(() => useMedaShell(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <MedaShellProvider workspace={workspace} apps={apps} storage={storage}>
          {children}
        </MedaShellProvider>
      ),
    });

    act(() => {
      result.current.panel.setWidth(460);
    });

    expect(storage.save).toHaveBeenCalled();
    // biome-ignore lint/suspicious/noExplicitAny: accessing vi.fn().mock in test
    const saveSpy = storage.save as any;
    const savedState = saveSpy.mock.calls[saveSpy.mock.calls.length - 1][1];
    expect((savedState as { rightPanel: { width: number } }).rightPanel.width).toBe(460);
  });
});

// ---------------------------------------------------------------------------
// MedaShellProvider — mobileDrawer slice
// ---------------------------------------------------------------------------

describe('MedaShellProvider — mobileDrawer.open / setOpen round-trip', () => {
  it('mobileDrawer.open is null by default', () => {
    const { result } = renderHook(() => useMedaShell(), { wrapper: Wrapper });
    expect(result.current.mobileDrawer.open).toBeNull();
  });

  it('setOpen updates mobileDrawer.open', () => {
    const { result } = renderHook(() => useMedaShell(), { wrapper: Wrapper });

    act(() => {
      result.current.mobileDrawer.setOpen('menu-drawer');
    });
    expect(result.current.mobileDrawer.open).toBe('menu-drawer');
  });

  it('setOpen(null) resets mobileDrawer.open', () => {
    const { result } = renderHook(() => useMedaShell(), { wrapper: Wrapper });

    act(() => {
      result.current.mobileDrawer.setOpen('ai-drawer');
    });
    expect(result.current.mobileDrawer.open).toBe('ai-drawer');

    act(() => {
      result.current.mobileDrawer.setOpen(null);
    });
    expect(result.current.mobileDrawer.open).toBeNull();
  });

  it('accepts arbitrary string drawer kind', () => {
    const { result } = renderHook(() => useMedaShell(), { wrapper: Wrapper });

    act(() => {
      result.current.mobileDrawer.setOpen('custom-drawer');
    });
    expect(result.current.mobileDrawer.open).toBe('custom-drawer');
  });
});

// ---------------------------------------------------------------------------
// MedaShellProvider — panel.focus sugar method
// ---------------------------------------------------------------------------

describe('MedaShellProvider — panel.focus', () => {
  function makePanelWrapper(initialMode: 'closed' | 'panel' | 'expanded' | 'fullscreen') {
    const storage = makeStubStorage({
      rightPanel: { mode: initialMode, activeView: null, width: 340 },
      contextRail: { width: 240, collapsed: false },
    });
    return ({ children }: { children: ReactNode }) => (
      <MedaShellProvider workspace={workspace} apps={apps} storage={storage}>
        {children}
      </MedaShellProvider>
    );
  }

  it('panel.focus — opens panel from closed and sets activeView', () => {
    const { result } = renderHook(() => useMedaShell(), {
      wrapper: makePanelWrapper('closed'),
    });

    act(() => {
      result.current.panel.focus('ai');
    });

    expect(result.current.panel.mode).toBe('panel');
    expect(result.current.panel.activeView).toBe('ai');
  });

  it('panel.focus identity remains stable after focus updates layout state', () => {
    const { result } = renderHook(() => useMedaShell(), {
      wrapper: makePanelWrapper('closed'),
    });

    const firstFocus = result.current.panel.focus;

    act(() => {
      result.current.panel.focus('ai');
    });

    expect(result.current.panel.activeView).toBe('ai');
    expect(result.current.panel.focus).toBe(firstFocus);
  });

  it('panel action identities remain stable after panel state updates', () => {
    const { result } = renderHook(() => useMedaShell(), {
      wrapper: makePanelWrapper('closed'),
    });

    const firstActions = {
      setMode: result.current.panel.setMode,
      setActiveView: result.current.panel.setActiveView,
      setWidth: result.current.panel.setWidth,
      open: result.current.panel.open,
      close: result.current.panel.close,
      toggle: result.current.panel.toggle,
      focus: result.current.panel.focus,
    };

    act(() => {
      result.current.panel.setWidth(460);
      result.current.panel.focus('ai');
      result.current.panel.toggle();
    });

    expect(result.current.panel.setMode).toBe(firstActions.setMode);
    expect(result.current.panel.setActiveView).toBe(firstActions.setActiveView);
    expect(result.current.panel.setWidth).toBe(firstActions.setWidth);
    expect(result.current.panel.open).toBe(firstActions.open);
    expect(result.current.panel.close).toBe(firstActions.close);
    expect(result.current.panel.toggle).toBe(firstActions.toggle);
    expect(result.current.panel.focus).toBe(firstActions.focus);
  });

  it('panel.focus preserves same-tick panel width updates', () => {
    const { result } = renderHook(() => useMedaShell(), {
      wrapper: makePanelWrapper('closed'),
    });

    act(() => {
      result.current.panel.setWidth(480);
      result.current.panel.focus('ai');
    });

    expect(result.current.panel.width).toBe(480);
    expect(result.current.panel.mode).toBe('panel');
    expect(result.current.panel.activeView).toBe('ai');
  });

  it('panel.focus — preserves expanded mode when already open', () => {
    const { result } = renderHook(() => useMedaShell(), {
      wrapper: makePanelWrapper('expanded'),
    });

    act(() => {
      result.current.panel.focus('inspector');
    });

    expect(result.current.panel.mode).toBe('expanded');
    expect(result.current.panel.activeView).toBe('inspector');
  });

  it('panel.focus — preserves fullscreen mode when already open', () => {
    const { result } = renderHook(() => useMedaShell(), {
      wrapper: makePanelWrapper('fullscreen'),
    });

    act(() => {
      result.current.panel.focus('notes');
    });

    expect(result.current.panel.mode).toBe('fullscreen');
    expect(result.current.panel.activeView).toBe('notes');
  });
});

// ---------------------------------------------------------------------------
// MedaShellProvider — panel helper methods
// ---------------------------------------------------------------------------

describe('MedaShellProvider — panel helper methods', () => {
  function makePanelWrapper(initialMode: 'closed' | 'panel' | 'expanded' | 'fullscreen') {
    const storage = makeStubStorage({
      rightPanel: { mode: initialMode, activeView: 'inspector', width: 420 },
      contextRail: { width: 240, collapsed: false },
    });
    return ({ children }: { children: ReactNode }) => (
      <MedaShellProvider workspace={workspace} apps={apps} storage={storage}>
        {children}
      </MedaShellProvider>
    );
  }

  it('panel.open opens closed to panel', () => {
    const { result } = renderHook(() => useMedaShell(), {
      wrapper: makePanelWrapper('closed'),
    });

    act(() => {
      result.current.panel.open();
    });

    expect(result.current.panel.mode).toBe('panel');
    expect(result.current.panel.activeView).toBe('inspector');
    expect(result.current.panel.width).toBe(420);
    expect(result.current.mobileDrawer.open).toBeNull();
  });

  it('panel.open opens the mobile panels drawer', () => {
    setShellViewport('mobile');
    const { result } = renderHook(() => useMedaShell(), {
      wrapper: makePanelWrapper('closed'),
    });

    act(() => {
      result.current.panel.open();
    });

    expect(result.current.mobileDrawer.open).toBe('panels-drawer');
  });

  it('panel.open preserves expanded', () => {
    const { result } = renderHook(() => useMedaShell(), {
      wrapper: makePanelWrapper('expanded'),
    });

    act(() => {
      result.current.panel.open();
    });

    expect(result.current.panel.mode).toBe('expanded');
    expect(result.current.panel.activeView).toBe('inspector');
    expect(result.current.panel.width).toBe(420);
  });

  it('panel.close preserves activeView', () => {
    const { result } = renderHook(() => useMedaShell(), {
      wrapper: makePanelWrapper('panel'),
    });

    act(() => {
      result.current.panel.close();
    });

    expect(result.current.panel.mode).toBe('closed');
    expect(result.current.panel.activeView).toBe('inspector');
    expect(result.current.panel.width).toBe(420);
  });

  it('panel.close closes the mobile panels drawer', () => {
    setShellViewport('mobile');
    const { result } = renderHook(() => useMedaShell(), {
      wrapper: makePanelWrapper('panel'),
    });

    act(() => {
      result.current.mobileDrawer.setOpen('panels-drawer');
    });

    act(() => {
      result.current.panel.close();
    });

    expect(result.current.mobileDrawer.open).toBeNull();
  });

  it('panel.close preserves unrelated mobile drawers', () => {
    setShellViewport('mobile');
    const { result } = renderHook(() => useMedaShell(), {
      wrapper: makePanelWrapper('panel'),
    });

    act(() => {
      result.current.mobileDrawer.setOpen('menu-drawer');
    });

    act(() => {
      result.current.panel.close();
    });

    expect(result.current.mobileDrawer.open).toBe('menu-drawer');
  });

  it('panel.toggle opens closed then closes open', () => {
    const { result } = renderHook(() => useMedaShell(), {
      wrapper: makePanelWrapper('closed'),
    });

    act(() => {
      result.current.panel.toggle();
    });

    expect(result.current.panel.mode).toBe('panel');

    act(() => {
      result.current.panel.toggle();
    });

    expect(result.current.panel.mode).toBe('closed');
    expect(result.current.panel.activeView).toBe('inspector');
    expect(result.current.panel.width).toBe(420);
  });

  it('panel.toggle opens and closes the mobile panels drawer', () => {
    setShellViewport('mobile');
    const { result } = renderHook(() => useMedaShell(), {
      wrapper: makePanelWrapper('closed'),
    });

    act(() => {
      result.current.panel.toggle();
    });

    expect(result.current.mobileDrawer.open).toBe('panels-drawer');

    act(() => {
      result.current.panel.toggle();
    });

    expect(result.current.mobileDrawer.open).toBeNull();
  });
});

describe('MedaShellProvider — panelViews.register identity', () => {
  const routeViews = [
    {
      id: 'route-view',
      label: 'Route View',
      icon: Menu,
      render: () => <div>Route view</div>,
    },
  ];

  it('panelViews.register identity remains stable after registrations change', () => {
    const { result } = renderHook(() => useMedaShell(), { wrapper: Wrapper });

    const firstRegister = result.current.panelViews.register;
    let cleanup: (() => void) | undefined;

    act(() => {
      cleanup = result.current.panelViews.register('route', routeViews, 'route-view');
    });

    expect(result.current.panelViews.registrations).toHaveLength(1);
    expect(result.current.panelViews.register).toBe(firstRegister);

    act(() => {
      cleanup?.();
    });

    expect(result.current.panelViews.registrations).toHaveLength(0);
    expect(result.current.panelViews.register).toBe(firstRegister);
  });
});

// ---------------------------------------------------------------------------
// MedaShellProvider — contextRail same-tick updates
// ---------------------------------------------------------------------------

describe('MedaShellProvider — contextRail same-tick updates', () => {
  it('preserves width when collapsed in the same tick', () => {
    const { result } = renderHook(() => useMedaShell(), { wrapper: Wrapper });

    act(() => {
      result.current.contextRail.setWidth(420);
      result.current.contextRail.setCollapsed(true);
    });

    expect(result.current.contextRail.width).toBe(420);
    expect(result.current.contextRail.collapsed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// MedaShellProvider — contextRail helper methods
// ---------------------------------------------------------------------------

describe('MedaShellProvider — contextRail helper methods', () => {
  it('contextRail.toggle flips collapsed state and preserves width across two toggles', () => {
    const { result } = renderHook(() => useMedaShell(), { wrapper: Wrapper });

    act(() => {
      result.current.contextRail.setWidth(420);
    });

    act(() => {
      result.current.contextRail.toggle();
    });

    expect(result.current.contextRail.collapsed).toBe(true);
    expect(result.current.contextRail.width).toBe(420);

    act(() => {
      result.current.contextRail.toggle();
    });

    expect(result.current.contextRail.collapsed).toBe(false);
    expect(result.current.contextRail.width).toBe(420);
  });
});

// ---------------------------------------------------------------------------
// MedaShellProvider — commandPalette slice
// ---------------------------------------------------------------------------

describe('MedaShellProvider — commandPalette.open / setOpen round-trip', () => {
  it('commandPalette.open is false by default', () => {
    const { result } = renderHook(() => useMedaShell(), { wrapper: Wrapper });
    expect(result.current.commandPalette.open).toBe(false);
  });

  it('setOpen(true) opens command palette', () => {
    const { result } = renderHook(() => useMedaShell(), { wrapper: Wrapper });

    act(() => {
      result.current.commandPalette.setOpen(true);
    });
    expect(result.current.commandPalette.open).toBe(true);
  });

  it('setOpen(false) closes command palette', () => {
    const { result } = renderHook(() => useMedaShell(), { wrapper: Wrapper });

    act(() => {
      result.current.commandPalette.setOpen(true);
    });
    expect(result.current.commandPalette.open).toBe(true);

    act(() => {
      result.current.commandPalette.setOpen(false);
    });
    expect(result.current.commandPalette.open).toBe(false);
  });

  it('commandPalette.setOpen is a stable function reference (memoised)', () => {
    const { result, rerender } = renderHook(() => useMedaShell(), { wrapper: Wrapper });
    const setOpenRef = result.current.commandPalette.setOpen;
    rerender();
    expect(result.current.commandPalette.setOpen).toBe(setOpenRef);
  });
});

// ---------------------------------------------------------------------------
// MedaShellProvider — panelViews re-registration (update existing entry)
// ---------------------------------------------------------------------------

describe('MedaShellProvider — panelViews re-registration updates existing entry', () => {
  it('re-registering the same id with new views replaces the entry', () => {
    const viewsV1 = [{ id: 'v1', label: 'View 1', icon: Menu, render: () => <div>V1</div> }];
    const viewsV2 = [{ id: 'v2', label: 'View 2', icon: Menu, render: () => <div>V2</div> }];

    const { result } = renderHook(() => useMedaShell(), { wrapper: Wrapper });

    // Register the first version
    act(() => {
      result.current.panelViews.register('section', viewsV1, 'v1');
    });

    expect(result.current.panelViews.registrations).toHaveLength(1);
    expect(result.current.panelViews.registrations[0].views).toBe(viewsV1);

    // Re-register the same id with different views — exercises the map update branch (line 233)
    act(() => {
      result.current.panelViews.register('section', viewsV2, 'v2');
    });

    expect(result.current.panelViews.registrations).toHaveLength(1);
    expect(result.current.panelViews.registrations[0].views).toBe(viewsV2);
  });

  it('re-registering with identical views and defaultView is a no-op (idempotency guard)', () => {
    const views = [{ id: 'v1', label: 'View 1', icon: Menu, render: () => <div>V1</div> }];
    const { result } = renderHook(() => useMedaShell(), { wrapper: Wrapper });

    let cleanup1: (() => void) | undefined;

    act(() => {
      cleanup1 = result.current.panelViews.register('section', views, 'v1');
    });

    const regsBefore = result.current.panelViews.registrations;

    // Re-register with exact same views + defaultView — should return same prev (idempotency)
    act(() => {
      result.current.panelViews.register('section', views, 'v1');
    });

    // Registrations array reference stays the same (early return from idempotency check)
    expect(result.current.panelViews.registrations).toBe(regsBefore);

    cleanup1?.();
  });

  it('calling cleanup twice does not crash (second call is a no-op)', () => {
    const views = [{ id: 'v1', label: 'View 1', icon: Menu, render: () => <div>V1</div> }];
    const { result } = renderHook(() => useMedaShell(), { wrapper: Wrapper });

    let cleanup: (() => void) | undefined;

    act(() => {
      cleanup = result.current.panelViews.register('section', views, 'v1');
    });

    expect(result.current.panelViews.registrations).toHaveLength(1);

    // First cleanup removes the registration
    act(() => {
      cleanup?.();
    });

    expect(result.current.panelViews.registrations).toHaveLength(0);

    // Second cleanup is a no-op (exercises the false branch of prev.some(...))
    expect(() => {
      act(() => {
        cleanup?.();
      });
    }).not.toThrow();
  });
});
