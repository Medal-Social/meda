import { fireEvent, render, renderHook, screen } from '@testing-library/react';
import { LayoutGrid, Menu } from 'lucide-react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { ShellStorageAdapter } from './layout-state.js';
import { MedaShellProvider, useMedaShell } from './shell-provider.js';
import type { AppDefinition, MobileBottomNavItem, WorkspaceDefinition } from './types.js';

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
    expect(typeof ctx.panel.setMode).toBe('function');
    expect(typeof ctx.panel.setActiveView).toBe('function');
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
    expect(storage.load).toHaveBeenCalledWith(expect.stringContaining('meda:shell:'));
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
