import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { LayoutGrid, Menu } from 'lucide-react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ShellStorageAdapter } from './layout-state.js';
import { MedaShellProvider, useMedaShell, useShellSelection } from './shell-provider.js';
import { useTheme } from './theme.js';
import type {
  AppDefinition,
  MobileBottomNavItem,
  ThemeAdapter,
  WorkspaceDefinition,
} from './types.js';

// ---------------------------------------------------------------------------
// Global browser stubs — DefaultThemeProvider reads localStorage + matchMedia
// ---------------------------------------------------------------------------

beforeEach(() => {
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
    // contextRail shape
    expect(typeof ctx.contextRail.width).toBe('number');
    expect(typeof ctx.contextRail.collapsed).toBe('boolean');
    expect(typeof ctx.contextRail.setWidth).toBe('function');
    expect(typeof ctx.contextRail.setCollapsed).toBe('function');
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
    // next-themes uses the deprecated addListener/removeListener matchMedia API
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

    // Children render (may need a tick for Suspense + lazy to resolve)
    await screen.findByTestId('child');
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
