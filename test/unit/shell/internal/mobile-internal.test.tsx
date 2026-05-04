'use client';

import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MedaShellProvider, useMedaShell } from '../../../../src/shell/shell-provider.js';
import type {
  AppDefinition,
  MobileBottomNavItem,
  PanelView,
  WorkspaceDefinition,
} from '../../../../src/shell/types.js';
import { MobileBottomNav } from '../../../../src/shell/internal/mobile-bottom-nav.js';
import { MobileDrawers } from '../../../../src/shell/internal/mobile-drawers.js';
import { MobileHeader } from '../../../../src/shell/internal/mobile-header.js';

// ---------------------------------------------------------------------------
// Mock useShellViewport — defaults to 'mobile', overridden per-test
// ---------------------------------------------------------------------------

vi.mock('../use-shell-viewport.js', () => ({
  useShellViewport: vi.fn(() => 'mobile'),
}));

import { useShellViewport } from '../../../../src/shell/use-shell-viewport.js';

// ---------------------------------------------------------------------------
// Browser stubs
// ---------------------------------------------------------------------------

beforeEach(() => {
  // biome-ignore lint/suspicious/noExplicitAny: test mock
  (useShellViewport as any).mockReturnValue('mobile');
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
  vi.unstubAllGlobals();
  cleanup();
});

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const ws: WorkspaceDefinition = { id: 'ws-test', name: 'Test Corp', icon: null };
const apps: AppDefinition[] = [{ id: 'app-a', label: 'App A', icon: Inbox }];

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <MedaShellProvider workspace={ws} apps={apps} storage={{ load: () => null, save: () => {} }}>
      {children}
    </MedaShellProvider>
  );
}

const NAV_ITEMS: MobileBottomNavItem[] = [
  { id: 'menu', label: 'Menu', icon: Inbox, opens: 'menu-drawer' },
  { id: 'inbox', label: 'Inbox', icon: Inbox, opens: 'module-drawer' },
];

// ---------------------------------------------------------------------------
// MobileHeader tests
// ---------------------------------------------------------------------------

describe('MobileHeader — root mode on mobile', () => {
  it('renders workspace name in root mode', () => {
    render(
      <Wrapper>
        <MobileHeader />
      </Wrapper>
    );

    expect(screen.getByTestId('mobile-header')).toBeInTheDocument();
    expect(screen.getByText('Test Corp')).toBeInTheDocument();
  });

  it('renders globalActions in root mode when provided', () => {
    render(
      <Wrapper>
        <MobileHeader globalActions={<button type="button">Create</button>} />
      </Wrapper>
    );

    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
  });

  it('does not render when viewport is not mobile', () => {
    // biome-ignore lint/suspicious/noExplicitAny: test mock
    (useShellViewport as any).mockReturnValue('desktop');

    render(
      <Wrapper>
        <MobileHeader />
      </Wrapper>
    );

    expect(screen.queryByTestId('mobile-header')).not.toBeInTheDocument();
  });
});

describe('MobileHeader — nested mode', () => {
  it('renders back button with parentLabel and title', () => {
    const onBack = vi.fn();

    render(
      <Wrapper>
        <MobileHeader parentLabel="Inbox" title="Message detail" onBack={onBack} />
      </Wrapper>
    );

    const header = screen.getByTestId('mobile-header');
    expect(header).toHaveAttribute('data-meda-mobile-header', 'nested');
    expect(screen.getByText('Inbox')).toBeInTheDocument();
    expect(screen.getByText('Message detail')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Go back' }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// MobileBottomNav tests
// ---------------------------------------------------------------------------

describe('MobileBottomNav — renders on mobile', () => {
  it('renders nav with items on mobile', () => {
    render(
      <Wrapper>
        <MobileBottomNav items={NAV_ITEMS} />
      </Wrapper>
    );

    expect(screen.getByTestId('mobile-bottom-nav')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Inbox' })).toBeInTheDocument();
  });

  it('does not render when viewport is not mobile', () => {
    // biome-ignore lint/suspicious/noExplicitAny: test mock
    (useShellViewport as any).mockReturnValue('desktop');

    render(
      <Wrapper>
        <MobileBottomNav items={NAV_ITEMS} />
      </Wrapper>
    );

    expect(screen.queryByTestId('mobile-bottom-nav')).not.toBeInTheDocument();
  });

  it('does not render when items list is empty', () => {
    render(
      <Wrapper>
        <MobileBottomNav items={[]} />
      </Wrapper>
    );

    expect(screen.queryByTestId('mobile-bottom-nav')).not.toBeInTheDocument();
  });
});

describe('MobileBottomNav — function label support', () => {
  it('renders the result of a function label', () => {
    const items: MobileBottomNavItem[] = [
      {
        id: 'dynamic',
        label: () => 'Dynamic Label',
        icon: Inbox,
        opens: 'module-drawer',
      },
    ];

    render(
      <Wrapper>
        <MobileBottomNav items={items} />
      </Wrapper>
    );

    expect(screen.getByRole('button', { name: 'Dynamic Label' })).toBeInTheDocument();
  });
});

describe('MobileBottomNav — fullscreen mode hides nav', () => {
  it('does not render when panel is in fullscreen mode', () => {
    function Root() {
      const ctx = useMedaShell();
      return (
        <>
          <button
            type="button"
            data-testid="set-fullscreen"
            onClick={() => ctx.panel.setMode('fullscreen')}
          >
            Fullscreen
          </button>
          <MobileBottomNav items={NAV_ITEMS} />
        </>
      );
    }

    render(
      <Wrapper>
        <Root />
      </Wrapper>
    );

    fireEvent.click(screen.getByTestId('set-fullscreen'));
    expect(screen.queryByTestId('mobile-bottom-nav')).not.toBeInTheDocument();
  });
});

describe('MobileBottomNav — fallback to ctx.mobileBottomNav when items not provided', () => {
  it('renders nav items from context when items prop is omitted', () => {
    // MedaShellProvider default mobileBottomNav includes menu/module/panels items.
    // Render MobileBottomNav without the items prop so it falls back to the context list.
    function Root() {
      return <MobileBottomNav />;
    }

    render(
      <MedaShellProvider
        workspace={ws}
        apps={apps}
        storage={{ load: () => null, save: () => {} }}
        mobileBottomNav={[{ id: 'menu', label: 'Menu', icon: Inbox, opens: 'menu-drawer' }]}
      >
        <Root />
      </MedaShellProvider>
    );

    expect(screen.getByTestId('mobile-bottom-nav')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument();
  });
});

describe('MobileBottomNav — click opens drawer', () => {
  it('clicking a string-opens item opens the corresponding drawer', () => {
    function DrawerProbe() {
      const ctx = useMedaShell();
      return <output data-testid="drawer-state">{ctx.mobileDrawer.open ?? 'closed'}</output>;
    }

    render(
      <Wrapper>
        <MobileBottomNav items={NAV_ITEMS} />
        <DrawerProbe />
      </Wrapper>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Inbox' }));
    expect(screen.getByTestId('drawer-state')).toHaveTextContent('module-drawer');
  });

  it('clicking a render-fn item opens a custom drawer keyed by item id', () => {
    const customItem: MobileBottomNavItem = {
      id: 'custom-drawer',
      label: 'Custom',
      icon: Inbox,
      opens: () => <div>Custom drawer content</div>,
    };

    function DrawerProbe() {
      const ctx = useMedaShell();
      return <output data-testid="drawer-state">{ctx.mobileDrawer.open ?? 'closed'}</output>;
    }

    render(
      <Wrapper>
        <MobileBottomNav items={[customItem]} />
        <DrawerProbe />
      </Wrapper>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Custom' }));
    expect(screen.getByTestId('drawer-state')).toHaveTextContent('custom-drawer');
  });
});

describe('MobileBottomNav — cancelTimer no-op when no timer is set', () => {
  it('pointerDown then pointerUp on a non-menu item does not crash (timer was never set)', () => {
    render(
      <Wrapper>
        <MobileBottomNav items={NAV_ITEMS} />
      </Wrapper>
    );

    // "Inbox" is not the menu item so pointerDown doesn't set a timer.
    // pointerUp calls cancelTimer which should gracefully handle null timer.
    const inboxBtn = screen.getByRole('button', { name: 'Inbox' });

    expect(() => {
      act(() => {
        fireEvent.pointerDown(inboxBtn);
        fireEvent.pointerUp(inboxBtn);
      });
    }).not.toThrow();
  });
});

describe('MobileBottomNav — pointer up/leave/cancel clear long-press timer', () => {
  it('pointerUp before long-press fires cancels the timer', () => {
    vi.useFakeTimers();

    function PaletteProbe() {
      const ctx = useMedaShell();
      return (
        <output data-testid="palette-state">{ctx.commandPalette.open ? 'open' : 'closed'}</output>
      );
    }

    render(
      <Wrapper>
        <MobileBottomNav items={NAV_ITEMS} />
        <PaletteProbe />
      </Wrapper>
    );

    const menuBtn = screen.getByRole('button', { name: 'Menu' });

    act(() => {
      fireEvent.pointerDown(menuBtn);
    });

    act(() => {
      fireEvent.pointerUp(menuBtn);
    });

    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(screen.getByTestId('palette-state')).toHaveTextContent('closed');

    vi.useRealTimers();
  });

  it('pointerLeave before long-press fires cancels the timer', () => {
    vi.useFakeTimers();

    function PaletteProbe() {
      const ctx = useMedaShell();
      return (
        <output data-testid="palette-state">{ctx.commandPalette.open ? 'open' : 'closed'}</output>
      );
    }

    render(
      <Wrapper>
        <MobileBottomNav items={NAV_ITEMS} />
        <PaletteProbe />
      </Wrapper>
    );

    const menuBtn = screen.getByRole('button', { name: 'Menu' });

    act(() => {
      fireEvent.pointerDown(menuBtn);
    });

    act(() => {
      fireEvent.pointerLeave(menuBtn);
    });

    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(screen.getByTestId('palette-state')).toHaveTextContent('closed');

    vi.useRealTimers();
  });

  it('pointerCancel before long-press fires cancels the timer', () => {
    vi.useFakeTimers();

    function PaletteProbe() {
      const ctx = useMedaShell();
      return (
        <output data-testid="palette-state">{ctx.commandPalette.open ? 'open' : 'closed'}</output>
      );
    }

    render(
      <Wrapper>
        <MobileBottomNav items={NAV_ITEMS} />
        <PaletteProbe />
      </Wrapper>
    );

    const menuBtn = screen.getByRole('button', { name: 'Menu' });

    act(() => {
      fireEvent.pointerDown(menuBtn);
    });

    // Cancel before the 500ms long-press threshold
    act(() => {
      fireEvent.pointerCancel(menuBtn);
    });

    // Advance past the long-press window — palette must NOT open
    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(screen.getByTestId('palette-state')).toHaveTextContent('closed');

    vi.useRealTimers();
  });

  it('long-press then click suppresses the regular click action', () => {
    vi.useFakeTimers();

    function DrawerProbe() {
      const ctx = useMedaShell();
      return <output data-testid="drawer-state">{ctx.mobileDrawer.open ?? 'closed'}</output>;
    }

    render(
      <Wrapper>
        <MobileBottomNav items={NAV_ITEMS} />
        <DrawerProbe />
      </Wrapper>
    );

    const menuBtn = screen.getByRole('button', { name: 'Menu' });

    act(() => {
      fireEvent.pointerDown(menuBtn);
    });

    // Advance past long-press threshold to fire the command palette
    act(() => {
      vi.advanceTimersByTime(600);
    });

    // Now fire the synthetic click — should be suppressed
    act(() => {
      fireEvent.click(menuBtn);
    });

    // Drawer must NOT be open (click was suppressed)
    expect(screen.getByTestId('drawer-state')).toHaveTextContent('closed');

    vi.useRealTimers();
  });
});

// ---------------------------------------------------------------------------
// MobileDrawers — workspace menu theme toggle
// ---------------------------------------------------------------------------

describe('MobileDrawers — theme toggle in menu drawer', () => {
  it('clicking the theme toggle changes the theme and closes the drawer', async () => {
    function Root() {
      const ctx = useMedaShell();
      return (
        <>
          <button
            type="button"
            data-testid="open-menu"
            onClick={() => ctx.mobileDrawer.setOpen('menu-drawer')}
          >
            Open menu
          </button>
          <output data-testid="drawer-state">{ctx.mobileDrawer.open ?? 'closed'}</output>
          <MobileDrawers menuItems={[]} />
        </>
      );
    }

    render(
      <Wrapper>
        <Root />
      </Wrapper>
    );

    fireEvent.click(screen.getByTestId('open-menu'));

    // Drawer should be open
    expect(screen.getByTestId('drawer-state')).toHaveTextContent('menu-drawer');

    // The theme button should be in the menu
    const themeBtn = screen.getByRole('button', { name: /switch to .* theme/i });
    expect(themeBtn).toBeInTheDocument();

    // Click the theme toggle
    fireEvent.click(themeBtn);

    // After click, drawer should be closed
    expect(screen.getByTestId('drawer-state')).toHaveTextContent('closed');
  });

  it('renders workspace menu items with array-shaped ReactNode icon', async () => {
    const { WorkspaceMenuItem } = await import('../types.js');
    const item = {
      id: 'compound',
      label: 'Compound Item',
      onClick: vi.fn(),
      // Array-shaped icon (no $$typeof) — exercises the `return icon` path in renderWorkspaceIcon
      icon: [
        <span key="a" data-testid="icon-a">
          a
        </span>,
        <span key="b" data-testid="icon-b">
          b
        </span>,
      ],
    };

    function Root() {
      const ctx = useMedaShell();
      return (
        <>
          <button
            type="button"
            data-testid="open-menu"
            onClick={() => ctx.mobileDrawer.setOpen('menu-drawer')}
          >
            Open
          </button>
          <MobileDrawers
            menuItems={[]}
            workspaceMenuItems={[item as ReturnType<typeof WorkspaceMenuItem>]}
          />
        </>
      );
    }

    render(
      <Wrapper>
        <Root />
      </Wrapper>
    );

    fireEvent.click(screen.getByTestId('open-menu'));
    expect(screen.getByTestId('icon-a')).toBeInTheDocument();
    expect(screen.getByTestId('icon-b')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// MobileDrawers — renderWorkspaceIcon with memo/forwardRef object icon
// ---------------------------------------------------------------------------

describe('MobileDrawers — workspace menu item with memo icon (object with $$typeof)', () => {
  it('renders a workspace menu item with a React.memo icon component', async () => {
    const { memo } = await import('react');
    const MemoIcon = memo(Inbox);

    // biome-ignore lint/suspicious/noExplicitAny: test cast for mock item
    const item: any = {
      id: 'memo-icon-item',
      label: 'Memo Icon Item',
      onClick: vi.fn(),
      icon: MemoIcon,
    };

    function Root() {
      const ctx = useMedaShell();
      return (
        <>
          <button
            type="button"
            data-testid="open-menu-memo"
            onClick={() => ctx.mobileDrawer.setOpen('menu-drawer')}
          >
            Open
          </button>
          <MobileDrawers menuItems={[]} workspaceMenuItems={[item]} />
        </>
      );
    }

    render(
      <Wrapper>
        <Root />
      </Wrapper>
    );

    fireEvent.click(screen.getByTestId('open-menu-memo'));
    expect(screen.getByText('Memo Icon Item')).toBeInTheDocument();
    // Memo icon should render as an SVG
    expect(
      screen.getByText('Memo Icon Item').closest('button')?.querySelector('svg')
    ).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// MobileDrawers — closeAfterLinkClick with non-ReactElement renderLink output
// ---------------------------------------------------------------------------

describe('MobileDrawers — menu drawer with renderLink returning non-element', () => {
  it('renders menu item when renderLink returns a plain string (non-ReactElement passthrough)', () => {
    // biome-ignore lint/suspicious/noExplicitAny: test cast for non-element renderLink
    const items: any[] = [{ id: 'home', label: 'Home', to: '/home', icon: Inbox }];

    function Root() {
      const ctx = useMedaShell();
      return (
        <>
          <button
            type="button"
            data-testid="open-menu-str"
            onClick={() => ctx.mobileDrawer.setOpen('menu-drawer')}
          >
            Open
          </button>
          <MobileDrawers
            menuItems={items}
            // biome-ignore lint/suspicious/noExplicitAny: test cast for non-element renderLink
            renderLink={() => 'plain-string' as any}
          />
        </>
      );
    }

    render(
      <Wrapper>
        <Root />
      </Wrapper>
    );

    fireEvent.click(screen.getByTestId('open-menu-str'));
    // The string is returned as-is — it won't throw
    expect(screen.getByText('Menu')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// MobileDrawers — custom content drawers
// ---------------------------------------------------------------------------

describe('MobileDrawers — custom content drawers', () => {
  it('renders custom drawer content keyed by id', () => {
    const panelViews: PanelView[] = [
      { id: 'inspector', label: 'Inspector', icon: Inbox, render: () => <div>Inspector</div> },
    ];

    function Root() {
      const ctx = useMedaShell();
      return (
        <>
          <button
            type="button"
            data-testid="open-custom"
            onClick={() => ctx.mobileDrawer.setOpen('my-custom-drawer')}
          >
            Open
          </button>
          <MobileDrawers
            panelViews={panelViews}
            customContent={{
              'my-custom-drawer': (close) => (
                <div>
                  <p data-testid="custom-content">Custom drawer</p>
                  <button type="button" onClick={close} data-testid="close-custom">
                    Close
                  </button>
                </div>
              ),
            }}
          />
        </>
      );
    }

    render(
      <Wrapper>
        <Root />
      </Wrapper>
    );

    fireEvent.click(screen.getByTestId('open-custom'));
    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
  });
});
