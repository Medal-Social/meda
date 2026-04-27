import { fireEvent, render, screen } from '@testing-library/react';
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
