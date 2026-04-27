import { act, fireEvent, render, screen } from '@testing-library/react';
import { Menu, Star } from 'lucide-react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MedaShellProvider, useMedaShell } from '../shell-provider.js';
import type { MobileBottomNavItem } from '../types.js';
import { MobileBottomNav } from './mobile-bottom-nav.js';

// ---------------------------------------------------------------------------
// Mock useShellViewport — default 'mobile'
// ---------------------------------------------------------------------------

vi.mock('../use-shell-viewport.js', () => ({
  useShellViewport: vi.fn(() => 'mobile'),
}));

import { useShellViewport } from '../use-shell-viewport.js';

// ---------------------------------------------------------------------------
// Global browser stubs
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
  // biome-ignore lint/suspicious/noExplicitAny: test mock
  (useShellViewport as any).mockReturnValue('mobile');
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const defaultApps = [{ id: 'app-a', label: 'App A', icon: Menu }];
const defaultWorkspace = { id: 'ws1', name: 'Acme', icon: null };

function Wrapper({
  children,
  mobileBottomNav,
}: {
  children: ReactNode;
  mobileBottomNav?: MobileBottomNavItem[];
}) {
  return (
    <MedaShellProvider
      workspace={defaultWorkspace}
      apps={defaultApps}
      mobileBottomNav={mobileBottomNav}
    >
      {children}
    </MedaShellProvider>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('MobileBottomNav — renders 4 buttons from default mobileBottomNav', () => {
  it('renders 4 nav buttons', () => {
    render(<MobileBottomNav />, { wrapper: Wrapper });
    const nav = screen.getByRole('navigation', { name: 'Mobile navigation' });
    expect(nav).toBeInTheDocument();
    const buttons = nav.querySelectorAll('button');
    expect(buttons.length).toBe(4);
  });

  it('renders labels Menu, Module, Panels, AI', () => {
    render(<MobileBottomNav />, { wrapper: Wrapper });
    expect(screen.getByText('Menu')).toBeInTheDocument();
    expect(screen.getByText('Module')).toBeInTheDocument();
    expect(screen.getByText('Panels')).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();
  });
});

describe('MobileBottomNav — clicking button opens drawer', () => {
  it('clicking Menu button sets mobileDrawer.open to menu-drawer', () => {
    function DrawerStateReader() {
      const ctx = useMedaShell();
      return <span data-testid="drawer-state">{ctx.mobileDrawer.open ?? 'null'}</span>;
    }

    render(
      <MedaShellProvider workspace={defaultWorkspace} apps={defaultApps}>
        <MobileBottomNav />
        <DrawerStateReader />
      </MedaShellProvider>
    );

    expect(screen.getByTestId('drawer-state').textContent).toBe('null');
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }));
    expect(screen.getByTestId('drawer-state').textContent).toBe('menu-drawer');
  });

  it('clicking AI button sets mobileDrawer.open to ai-drawer', () => {
    function DrawerStateReader() {
      const ctx = useMedaShell();
      return <span data-testid="drawer-state">{ctx.mobileDrawer.open ?? 'null'}</span>;
    }

    render(
      <MedaShellProvider workspace={defaultWorkspace} apps={defaultApps}>
        <MobileBottomNav />
        <DrawerStateReader />
      </MedaShellProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'AI' }));
    expect(screen.getByTestId('drawer-state').textContent).toBe('ai-drawer');
  });
});

describe('MobileBottomNav — hides on non-mobile viewport', () => {
  it('returns null on desktop', () => {
    // biome-ignore lint/suspicious/noExplicitAny: test mock
    (useShellViewport as any).mockReturnValue('desktop');
    render(<MobileBottomNav />, { wrapper: Wrapper });
    expect(screen.queryByRole('navigation', { name: 'Mobile navigation' })).toBeNull();
  });
});

describe('MobileBottomNav — hides when panel mode is fullscreen', () => {
  it('returns null when panel.mode is fullscreen', () => {
    function FullscreenSetter() {
      const ctx = useMedaShell();
      return (
        <button
          type="button"
          data-testid="set-fullscreen"
          onClick={() => ctx.panel.setMode('fullscreen')}
        >
          set fullscreen
        </button>
      );
    }

    render(
      <MedaShellProvider workspace={defaultWorkspace} apps={defaultApps}>
        <FullscreenSetter />
        <MobileBottomNav />
      </MedaShellProvider>
    );

    expect(screen.getByRole('navigation', { name: 'Mobile navigation' })).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('set-fullscreen'));
    expect(screen.queryByRole('navigation', { name: 'Mobile navigation' })).toBeNull();
  });
});

describe('MobileBottomNav — height', () => {
  it('has h-[var(--shell-bottom-nav-height)] class', () => {
    render(<MobileBottomNav />, { wrapper: Wrapper });
    const nav = screen.getByRole('navigation', { name: 'Mobile navigation' });
    expect(nav.className).toContain('h-[var(--shell-bottom-nav-height)]');
  });
});

describe('MedaShellProvider — mobileBottomNav prop overrides defaults', () => {
  it('renders only the custom item when mobileBottomNav prop is passed', () => {
    const customNav: MobileBottomNavItem[] = [
      { id: 'foo', label: 'Foo', icon: Star, opens: 'menu-drawer' },
    ];

    render(<MobileBottomNav />, {
      wrapper: ({ children }: { children: ReactNode }) => (
        <Wrapper mobileBottomNav={customNav}>{children}</Wrapper>
      ),
    });

    const nav = screen.getByRole('navigation', { name: 'Mobile navigation' });
    const buttons = nav.querySelectorAll('button');
    expect(buttons.length).toBe(1);
    expect(screen.getByText('Foo')).toBeInTheDocument();
    expect(screen.queryByText('Menu')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Task 14.3: Mobile long-press on Menu opens command palette
// ---------------------------------------------------------------------------

describe('MobileBottomNav — long-press on Menu opens command palette', () => {
  it('long-press (500ms) on Menu opens command palette', () => {
    vi.useFakeTimers();

    function PaletteStateReader() {
      const ctx = useMedaShell();
      return <span data-testid="palette-open">{String(ctx.commandPalette.open)}</span>;
    }

    render(
      <MedaShellProvider workspace={defaultWorkspace} apps={defaultApps}>
        <PaletteStateReader />
        <MobileBottomNav />
      </MedaShellProvider>
    );

    expect(screen.getByTestId('palette-open').textContent).toBe('false');

    const menuBtn = screen.getByRole('button', { name: 'Menu' });
    fireEvent.pointerDown(menuBtn);

    // Before 500ms — palette still closed
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(screen.getByTestId('palette-open').textContent).toBe('false');

    // After 500ms — palette opens
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(screen.getByTestId('palette-open').textContent).toBe('true');

    vi.useRealTimers();
  });

  it('short-press on Menu (pointerup before 500ms) opens menu drawer, not command palette', () => {
    vi.useFakeTimers();

    function StateReader() {
      const ctx = useMedaShell();
      return (
        <>
          <span data-testid="palette-open">{String(ctx.commandPalette.open)}</span>
          <span data-testid="drawer-open">{ctx.mobileDrawer.open ?? 'null'}</span>
        </>
      );
    }

    render(
      <MedaShellProvider workspace={defaultWorkspace} apps={defaultApps}>
        <StateReader />
        <MobileBottomNav />
      </MedaShellProvider>
    );

    const menuBtn = screen.getByRole('button', { name: 'Menu' });

    // Short-press: pointerdown then pointerup within 200ms
    fireEvent.pointerDown(menuBtn);
    vi.advanceTimersByTime(200);
    fireEvent.pointerUp(menuBtn);
    fireEvent.click(menuBtn);

    expect(screen.getByTestId('palette-open').textContent).toBe('false');
    expect(screen.getByTestId('drawer-open').textContent).toBe('menu-drawer');

    vi.useRealTimers();
  });

  it('pointer cancel mid-long-press does NOT open palette', () => {
    vi.useFakeTimers();

    function PaletteStateReader() {
      const ctx = useMedaShell();
      return <span data-testid="palette-open">{String(ctx.commandPalette.open)}</span>;
    }

    render(
      <MedaShellProvider workspace={defaultWorkspace} apps={defaultApps}>
        <PaletteStateReader />
        <MobileBottomNav />
      </MedaShellProvider>
    );

    const menuBtn = screen.getByRole('button', { name: 'Menu' });

    // Start press, then pointer leaves before 500ms
    fireEvent.pointerDown(menuBtn);
    vi.advanceTimersByTime(300);
    fireEvent.pointerLeave(menuBtn);

    // Advance past 500ms — timer should have been cancelled
    vi.advanceTimersByTime(300);
    expect(screen.getByTestId('palette-open').textContent).toBe('false');

    vi.useRealTimers();
  });
});
