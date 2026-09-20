import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Menu, User } from 'lucide-react';
import { memo } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AppTabs,
  PanelToggle,
  ShellHeader,
  WorkspaceSwitcher,
} from '../../../src/shell/shell-header.js';
import { MedaShellProvider } from '../../../src/shell/shell-provider.js';
import type { AppDefinition, WorkspaceDefinition } from '../../../src/shell/types.js';

// ---------------------------------------------------------------------------
// Mock useShellViewport — default 'desktop', overridden per-test where needed
// ---------------------------------------------------------------------------

vi.mock('../../../src/shell/use-shell-viewport.js', () => ({
  useShellViewport: vi.fn(() => 'desktop'),
}));

import { useShellViewport } from '../../../src/shell/use-shell-viewport.js';

// ---------------------------------------------------------------------------
// Browser stubs — DefaultThemeProvider reads localStorage + matchMedia
// ---------------------------------------------------------------------------

beforeEach(() => {
  // biome-ignore lint/suspicious/noExplicitAny: test mock
  (useShellViewport as any).mockReturnValue('desktop');
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
  cleanup();
});

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const ws: WorkspaceDefinition = { id: 'ws-test', name: 'Acme Corp', icon: null };
const ws2: WorkspaceDefinition = { id: 'ws-other', name: 'Beta LLC', icon: null };
const apps: AppDefinition[] = [
  { id: 'app-a', label: 'Analytics', icon: Menu },
  { id: 'app-b', label: 'Billing', icon: Menu },
];

function renderWithProvider(
  ui: React.ReactNode,
  opts: {
    workspaces?: WorkspaceDefinition[];
    defaultActiveApp?: string;
    apps?: AppDefinition[];
  } = {}
) {
  return render(
    <MedaShellProvider
      workspace={ws}
      workspaces={opts.workspaces ?? [ws, ws2]}
      apps={opts.apps ?? apps}
      defaultActiveApp={opts.defaultActiveApp}
    >
      {ui}
    </MedaShellProvider>
  );
}

// ---------------------------------------------------------------------------
// ShellHeader
// ---------------------------------------------------------------------------

describe('ShellHeader — renders WorkspaceSwitcher and PanelToggle from context', () => {
  it('shows workspace name and panel toggle button', () => {
    renderWithProvider(<ShellHeader />);

    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /open right panel|close right panel/i })
    ).toBeInTheDocument();
  });
});

describe('ShellHeader — renders globalActions before PanelToggle', () => {
  it('globalActions node appears in DOM order before the panel toggle', () => {
    renderWithProvider(<ShellHeader globalActions={<button type="button">Custom</button>} />);

    const customBtn = screen.getByRole('button', { name: 'Custom' });
    const panelBtn = screen.getByRole('button', { name: /open right panel|close right panel/i });

    // compareDocumentPosition: 4 = DOCUMENT_POSITION_FOLLOWING (panelBtn comes after customBtn)
    expect(customBtn.compareDocumentPosition(panelBtn) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });
});

describe('ShellHeader — has h-[var(--shell-header-height)] class', () => {
  it('root element has the 56px height class', () => {
    const { container } = renderWithProvider(<ShellHeader />);

    const header = container.querySelector('header');
    expect(header?.className).toContain('h-[var(--shell-header-height)]');
  });
});

describe('ShellHeader — headerCenter slot', () => {
  it('renders provided center content instead of default app tabs', () => {
    renderWithProvider(<ShellHeader headerCenter={<nav aria-label="Section tabs">Inbox</nav>} />);

    expect(screen.getByRole('navigation', { name: 'Section tabs' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Applications' })).not.toBeInTheDocument();
  });

  it('renders the default app tabs when headerCenter is omitted', () => {
    renderWithProvider(<ShellHeader />);

    expect(screen.getByRole('navigation', { name: 'Applications' })).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// WorkspaceSwitcher
// ---------------------------------------------------------------------------

describe('WorkspaceSwitcher — renders icon, name, chevron', () => {
  it('displays workspace name and a chevron button', () => {
    renderWithProvider(<WorkspaceSwitcher />);

    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    // The trigger button wraps name + chevron
    const trigger = screen.getByRole('button', { name: /acme corp/i });
    expect(trigger).toBeInTheDocument();
  });
});

describe('WorkspaceSwitcher — click opens menu with workspace list + Settings/Profile/Sign out', () => {
  it('shows workspace items + fixed actions after click', () => {
    renderWithProvider(<WorkspaceSwitcher />);

    fireEvent.click(screen.getByRole('button', { name: /acme corp/i }));

    expect(screen.getByText('Beta LLC')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Sign out')).toBeInTheDocument();
  });
});

describe('WorkspaceSwitcher — empty workspaces array still shows Settings/Profile/Sign out', () => {
  it('omits workspace list but keeps fixed actions', () => {
    renderWithProvider(<WorkspaceSwitcher />, { workspaces: [] });

    fireEvent.click(screen.getByRole('button', { name: /acme corp/i }));

    expect(screen.queryByText('Beta LLC')).not.toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Sign out')).toBeInTheDocument();
  });
});

describe('WorkspaceSwitcher — workspaceMenuFooter slot renders extra items', () => {
  it('footer node is rendered inside the menu', () => {
    renderWithProvider(<WorkspaceSwitcher workspaceMenuFooter={<div>Footer Item</div>} />);

    fireEvent.click(screen.getByRole('button', { name: /acme corp/i }));

    expect(screen.getByText('Footer Item')).toBeInTheDocument();
  });

  it('menuFooter is the preferred alias and wins when both are supplied', () => {
    renderWithProvider(
      <WorkspaceSwitcher
        menuFooter={<div>New Footer</div>}
        workspaceMenuFooter={<div>Legacy Footer</div>}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /acme corp/i }));

    expect(screen.getByText('New Footer')).toBeInTheDocument();
    expect(screen.queryByText('Legacy Footer')).not.toBeInTheDocument();
  });
});

describe('WorkspaceSwitcher — menuItems replaces hardcoded defaults', () => {
  it('renders configured items in order, drops the default ones', () => {
    const handleSettings = vi.fn();
    const handleSignOut = vi.fn();

    renderWithProvider(
      <WorkspaceSwitcher
        menuItems={[
          { id: 'settings', label: 'Account settings', onClick: handleSettings },
          { id: 'profile', label: 'View profile', href: '/profile', separatorAfter: true },
          { id: 'sign-out', label: 'Log out', onClick: handleSignOut, variant: 'destructive' },
        ]}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /acme corp/i }));

    // Configured items render
    expect(screen.getByText('Account settings')).toBeInTheDocument();
    expect(screen.getByText('View profile')).toBeInTheDocument();
    expect(screen.getByText('Log out')).toBeInTheDocument();

    // Default items DO NOT render
    expect(screen.queryByText('Manage workspaces')).not.toBeInTheDocument();
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
    expect(screen.queryByText('Profile')).not.toBeInTheDocument();
    expect(screen.queryByText('Sign out')).not.toBeInTheDocument();

    // onClick wires through
    fireEvent.click(screen.getByText('Account settings'));
    expect(handleSettings).toHaveBeenCalledTimes(1);
  });

  it('renders href items as anchor links', () => {
    renderWithProvider(
      <WorkspaceSwitcher menuItems={[{ id: 'profile', label: 'View profile', href: '/profile' }]} />
    );

    fireEvent.click(screen.getByRole('button', { name: /acme corp/i }));

    const profileLink = screen.getByRole('menuitem', { name: 'View profile' });
    expect(profileLink).toHaveAttribute('href', '/profile');
  });

  it('renders lucide icons without runtime errors', () => {
    renderWithProvider(
      <WorkspaceSwitcher
        menuItems={[{ id: 'profile', label: 'View profile', href: '/profile', icon: User }]}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /acme corp/i }));

    expect(screen.getByText('View profile')).toBeInTheDocument();
  });

  it('preserves icon when item is rendered as an anchor link', () => {
    renderWithProvider(
      <WorkspaceSwitcher
        menuItems={[{ id: 'profile', label: 'View profile', href: '/profile', icon: User }]}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /acme corp/i }));

    const link = screen.getByRole('menuitem', { name: 'View profile' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/profile');
    expect(link.querySelector('svg')).not.toBeNull();
  });

  it('renders memoized icon components without falling through', () => {
    const MemoIcon = memo(User);
    renderWithProvider(
      <WorkspaceSwitcher
        menuItems={[{ id: 'profile', label: 'View profile', onClick: () => {}, icon: MemoIcon }]}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /acme corp/i }));

    const item = screen.getByRole('menuitem', { name: /view profile/i });
    expect(item.querySelector('svg')).not.toBeNull();
  });

  it('renders array-shaped icon ReactNodes as-is without crashing', () => {
    renderWithProvider(
      <WorkspaceSwitcher
        menuItems={[
          {
            id: 'compound',
            label: 'Compound',
            onClick: () => {},
            icon: [
              <span key="a" data-testid="icon-a">
                a
              </span>,
              <span key="b" data-testid="icon-b">
                b
              </span>,
            ],
          },
        ]}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /acme corp/i }));

    expect(screen.getByTestId('icon-a')).toBeInTheDocument();
    expect(screen.getByTestId('icon-b')).toBeInTheDocument();
  });

  it('still inserts the theme toggle between configured items and footer', () => {
    renderWithProvider(
      <WorkspaceSwitcher
        menuItems={[{ id: 'a', label: 'Item A', onClick: () => {} }]}
        menuFooter={<div>Custom footer</div>}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /acme corp/i }));

    // Theme toggle text is one of three possible based on current theme; just
    // assert that some "Switch to ... theme" item is present in the menu.
    expect(screen.getByText(/switch to .* theme/i)).toBeInTheDocument();
    expect(screen.getByText('Custom footer')).toBeInTheDocument();
  });

  it('renders destructive variant with the destructive class hint', () => {
    renderWithProvider(
      <WorkspaceSwitcher
        menuItems={[{ id: 'danger', label: 'Delete', variant: 'destructive', onClick: () => {} }]}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /acme corp/i }));

    const destructiveItem = screen.getByText('Delete').closest('[data-variant]');
    expect(destructiveItem).toHaveAttribute('data-variant', 'destructive');
  });

  it('empty menuItems array hides defaults and renders only the theme toggle', () => {
    renderWithProvider(<WorkspaceSwitcher menuItems={[]} />);

    fireEvent.click(screen.getByRole('button', { name: /acme corp/i }));

    expect(screen.queryByText('Manage workspaces')).not.toBeInTheDocument();
    expect(screen.queryByText('Sign out')).not.toBeInTheDocument();
    expect(screen.getByText(/switch to .* theme/i)).toBeInTheDocument();
  });
});

describe('WorkspaceSwitcher — theme toggle cycles theme on click', () => {
  it('clicking the theme toggle item changes the theme', () => {
    renderWithProvider(<WorkspaceSwitcher />);

    fireEvent.click(screen.getByRole('button', { name: /acme corp/i }));

    // ThemeToggleMenuItem renders a "Switch to ... theme" menu item
    const themeItem = screen.getByText(/switch to .* theme/i);
    const labelBefore = themeItem.textContent;

    fireEvent.click(themeItem);

    // After click the menu closes, re-open to check new theme label
    fireEvent.click(screen.getByRole('button', { name: /acme corp/i }));

    const labelAfter = screen.getByText(/switch to .* theme/i).textContent;
    expect(labelAfter).not.toBe(labelBefore);
  });
});

describe('WorkspaceSwitcher — Escape closes the menu', () => {
  it('pressing Escape after opening removes menu items from DOM', () => {
    renderWithProvider(<WorkspaceSwitcher />);

    fireEvent.click(screen.getByRole('button', { name: /acme corp/i }));
    expect(screen.getByText('Sign out')).toBeInTheDocument();

    fireEvent.keyDown(document.activeElement ?? document.body, {
      key: 'Escape',
      code: 'Escape',
    });

    expect(screen.queryByText('Sign out')).not.toBeInTheDocument();
  });
});

describe('WorkspaceSwitcher — outside click closes the menu', () => {
  it('clicking outside the menu hides menu items', () => {
    renderWithProvider(<WorkspaceSwitcher />);

    fireEvent.click(screen.getByRole('button', { name: /acme corp/i }));
    expect(screen.getByText('Sign out')).toBeInTheDocument();

    fireEvent.pointerDown(document.body);

    expect(screen.queryByText('Sign out')).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// AppTabs
// ---------------------------------------------------------------------------

describe('AppTabs — renders one button per app inside a nav', () => {
  it('shows a button for each app inside nav[aria-label="Applications"]', () => {
    const { container } = renderWithProvider(<AppTabs />);

    const nav = container.querySelector('nav[aria-label="Applications"]');
    expect(nav).toBeInTheDocument();

    // Plain buttons — NOT role="tab"
    expect(screen.getByRole('button', { name: /analytics/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /billing/i })).toBeInTheDocument();

    // Must NOT have role="tab"
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });
});

describe('AppTabs — active tab has border-b-2 border-primary and aria-current="page"', () => {
  it('first app button has active styles and aria-current="page" by default', () => {
    renderWithProvider(<AppTabs />, { defaultActiveApp: 'app-a' });

    const activeBtn = screen.getByRole('button', { name: /analytics/i });
    expect(activeBtn).toHaveAttribute('aria-current', 'page');
    expect(activeBtn.className).toContain('border-b-2');
    expect(activeBtn.className).toContain('border-primary');
    expect(activeBtn.className).toContain('text-foreground');
  });
});

describe('AppTabs — clicking inactive tab calls setActiveApp(id)', () => {
  it('clicking Billing tab activates it', () => {
    renderWithProvider(<AppTabs />, { defaultActiveApp: 'app-a' });

    const billingBtn = screen.getByRole('button', { name: /billing/i });
    fireEvent.click(billingBtn);

    // After click, Billing should have active styles
    expect(billingBtn.className).toContain('border-b-2');
    expect(billingBtn.className).toContain('border-primary');
    expect(billingBtn).toHaveAttribute('aria-current', 'page');
  });
});

describe('AppTabs — renderLink routing integration', () => {
  it('renders app tabs through renderLink and keeps active app state in sync', () => {
    const routedApps: AppDefinition[] = [
      { id: 'app-a', label: 'Analytics', icon: Menu, to: '/analytics' },
      { id: 'app-b', label: 'Billing', icon: Menu, to: '/billing' },
    ];

    renderWithProvider(
      <AppTabs
        renderLink={({ app, linkProps }) => (
          <a {...linkProps} data-testid={`app-tab-link-${app.id}`} />
        )}
      />,
      { apps: routedApps, defaultActiveApp: 'app-a' }
    );

    const billingLink = screen.getByTestId('app-tab-link-app-b');
    expect(billingLink).toHaveAttribute('href', '/billing');

    fireEvent.click(billingLink);

    expect(billingLink).toHaveAttribute('aria-current', 'page');
    expect(billingLink.className).toContain('border-primary');
  });

  it('falls back to a button when an app has no route target', () => {
    const renderLink = vi.fn(({ app, linkProps }) => (
      <a {...linkProps} data-testid={`app-tab-link-${app.id}`} />
    ));

    renderWithProvider(<AppTabs renderLink={renderLink} />, {
      apps: [
        { id: 'app-a', label: 'Analytics', icon: Menu, to: '/analytics' },
        { id: 'app-b', label: 'Billing', icon: Menu },
      ],
      defaultActiveApp: 'app-a',
    });

    expect(screen.getByTestId('app-tab-link-app-a')).toHaveAttribute('href', '/analytics');
    expect(screen.getByRole('button', { name: /billing/i })).toBeInTheDocument();
    expect(renderLink).toHaveBeenCalledTimes(1);
  });
});

describe('AppTabs — supports non-Lucide icon shapes', () => {
  it('renders ReactNode app icons without treating them as components', () => {
    renderWithProvider(<AppTabs />, {
      apps: [
        {
          id: 'custom',
          label: 'Custom',
          icon: <span data-testid="custom-app-icon">C</span>,
        },
      ],
      defaultActiveApp: 'custom',
    });

    expect(screen.getByTestId('custom-app-icon')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /custom/i })).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// PanelToggle
// ---------------------------------------------------------------------------

describe('PanelToggle — toggles panel mode closed → panel', () => {
  it('clicking while closed sets mode to panel (aria-label flips)', () => {
    renderWithProvider(<PanelToggle />);

    const btn = screen.getByRole('button', { name: 'Open right panel' });
    fireEvent.click(btn);

    expect(screen.getByRole('button', { name: 'Close right panel' })).toBeInTheDocument();
  });
});

describe('PanelToggle — toggles panel mode panel → closed', () => {
  it('clicking while open sets mode to closed (aria-label flips back)', () => {
    renderWithProvider(<PanelToggle />);

    const openBtn = screen.getByRole('button', { name: 'Open right panel' });
    fireEvent.click(openBtn);

    const closeBtn = screen.getByRole('button', { name: 'Close right panel' });
    fireEvent.click(closeBtn);

    expect(screen.getByRole('button', { name: 'Open right panel' })).toBeInTheDocument();
  });
});

describe('PanelToggle — active state styled when panel is open', () => {
  it('button has bg-accent class when panel mode is not closed', () => {
    renderWithProvider(<PanelToggle />);

    fireEvent.click(screen.getByRole('button', { name: 'Open right panel' }));

    const btn = screen.getByRole('button', { name: 'Close right panel' });
    expect(btn.className).toContain('bg-accent');
  });
});

describe('PanelToggle — renders PanelRightOpen icon when closed, PanelRightClose when open', () => {
  it('aria-label reflects the next action correctly', () => {
    renderWithProvider(<PanelToggle />);

    // Closed → label says "Open right panel"
    expect(screen.getByRole('button', { name: 'Open right panel' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Open right panel' }));

    // Open → label says "Close right panel"
    expect(screen.getByRole('button', { name: 'Close right panel' })).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Phase 13 carry-forward — mobile auto-hide
// ---------------------------------------------------------------------------

describe('ShellHeader — hides on mobile viewport', () => {
  it('returns null when viewport is mobile', () => {
    // biome-ignore lint/suspicious/noExplicitAny: test mock
    (useShellViewport as any).mockReturnValue('mobile');
    renderWithProvider(<ShellHeader />);
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
  });
});

describe('ShellHeader — renders on desktop viewport', () => {
  it('renders the header element when viewport is desktop', () => {
    // biome-ignore lint/suspicious/noExplicitAny: test mock
    (useShellViewport as any).mockReturnValue('desktop');
    renderWithProvider(<ShellHeader />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// data-meda-shell-header — stable hook on BOTH layouts
// ---------------------------------------------------------------------------

describe('ShellHeader — data-meda-shell-header hook', () => {
  it('marks the default split header', () => {
    const { container } = renderWithProvider(<ShellHeader />);

    const header = container.querySelector('[data-meda-shell-header]');
    expect(header?.tagName).toBe('HEADER');
    expect(header).toHaveAttribute('data-meda-header-layout', 'split');
  });

  it('marks the split header that has a headerCenter', () => {
    const { container } = renderWithProvider(<ShellHeader headerCenter={<span>Centre</span>} />);

    expect(container.querySelector('[data-meda-shell-header]')).toHaveAttribute(
      'data-meda-header-layout',
      'split'
    );
  });

  it('marks the rail header', () => {
    const { container } = renderWithProvider(<ShellHeader headerLayout="rail" />);

    expect(container.querySelector('[data-meda-shell-header]')).toHaveAttribute(
      'data-meda-header-layout',
      'rail'
    );
  });
});

// ---------------------------------------------------------------------------
// headerLayout="rail"
// ---------------------------------------------------------------------------

describe('ShellHeader — headerLayout="rail"', () => {
  it('defaults to the split layout, leaving the existing markup untouched', () => {
    const { container } = renderWithProvider(<ShellHeader />);

    const header = container.querySelector('header');
    expect(header?.className).toContain('flex');
    expect(header?.className).not.toContain('--shell-rail-width');
    // The chip switcher, not the tile.
    expect(screen.getByRole('button', { name: /acme corp/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Acme Corp workspace menu' })).toBeNull();
  });

  it('sizes column 1 to the icon-only rail width by default', () => {
    const { container } = renderWithProvider(<ShellHeader headerLayout="rail" />);

    const header = container.querySelector('header');
    expect(header?.className).toContain('grid-cols-[var(--shell-rail-width)_minmax(0,1fr)_auto]');
    // No left padding; right padding only.
    expect(header?.className).toContain('pr-4');
    expect(header?.className).not.toContain('px-4');
  });

  it('sizes column 1 to the labelled rail width when the rail shows labels', () => {
    const { container } = renderWithProvider(
      <ShellHeader headerLayout="rail" railLabelVisibility="visible" />
    );

    expect(container.querySelector('header')?.className).toContain(
      'grid-cols-[var(--shell-rail-label-width)_minmax(0,1fr)_auto]'
    );
  });

  it('renders the switcher as a tile and gives headerLeading the fill column', () => {
    renderWithProvider(
      <ShellHeader headerLayout="rail" headerLeading={<nav aria-label="Section tabs">Inbox</nav>} />
    );

    expect(screen.getByRole('button', { name: 'Acme Corp workspace menu' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Section tabs' })).toBeInTheDocument();
  });

  it('ignores headerCenter and never renders the default app tabs', () => {
    renderWithProvider(
      <ShellHeader headerLayout="rail" headerCenter={<nav aria-label="Centre tabs">Nope</nav>} />
    );

    expect(screen.queryByRole('navigation', { name: 'Centre tabs' })).toBeNull();
    expect(screen.queryByRole('navigation', { name: 'Applications' })).toBeNull();
  });

  it('renders globalActions before the panel toggle in the actions column', () => {
    renderWithProvider(
      <ShellHeader headerLayout="rail" globalActions={<button type="button">Custom</button>} />
    );

    const customBtn = screen.getByRole('button', { name: 'Custom' });
    const panelBtn = screen.getByRole('button', { name: /open right panel/i });
    expect(customBtn.compareDocumentPosition(panelBtn) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it('honours showPanelToggle={false}', () => {
    renderWithProvider(<ShellHeader headerLayout="rail" showPanelToggle={false} />);

    expect(screen.queryByRole('button', { name: /right panel/i })).toBeNull();
  });

  it('hides the tile label in icon-only rail mode and shows it in labelled mode', () => {
    const { unmount } = renderWithProvider(<ShellHeader headerLayout="rail" />);
    expect(screen.queryByText('Acme Corp')).toBeNull();
    unmount();

    renderWithProvider(<ShellHeader headerLayout="rail" railLabelVisibility="visible" />);
    expect(screen.getByText('Acme Corp')).toHaveAttribute('data-slot', 'icon-rail-label');
  });
});

// ---------------------------------------------------------------------------
// WorkspaceSwitcher — tile variant
// ---------------------------------------------------------------------------

describe('WorkspaceSwitcher — tile variant', () => {
  it('names the trigger "<workspace> workspace menu" and shows the name beneath the mark', () => {
    renderWithProvider(<WorkspaceSwitcher variant="tile" />);

    const trigger = screen.getByRole('button', { name: 'Acme Corp workspace menu' });
    expect(trigger).toHaveAttribute('data-meda-workspace-switcher', 'tile');
    expect(screen.getByText('Acme Corp')).toHaveAttribute('data-slot', 'icon-rail-label');
  });

  it('falls back to the workspace initial when the workspace has no icon', () => {
    renderWithProvider(<WorkspaceSwitcher variant="tile" />);

    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('renders the workspace icon in the mark when one is set', () => {
    render(
      <MedaShellProvider
        workspace={{
          id: 'ws-icon',
          name: 'Iconic WS',
          icon: <span data-testid="tile-icon">I</span>,
        }}
        apps={apps}
      >
        <WorkspaceSwitcher variant="tile" />
      </MedaShellProvider>
    );

    expect(screen.getByTestId('tile-icon')).toBeInTheDocument();
  });

  it('hides the name when showLabel is false', () => {
    renderWithProvider(<WorkspaceSwitcher variant="tile" showLabel={false} />);

    expect(screen.getByRole('button', { name: 'Acme Corp workspace menu' })).toBeInTheDocument();
    expect(screen.queryByText('Acme Corp')).toBeNull();
  });

  it('opens the same dropdown content as the chip', () => {
    renderWithProvider(<WorkspaceSwitcher variant="tile" />);

    fireEvent.click(screen.getByRole('button', { name: 'Acme Corp workspace menu' }));

    expect(screen.getByText('Beta LLC')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Sign out')).toBeInTheDocument();
    expect(screen.getByText(/switch to .* theme/i)).toBeInTheDocument();
  });

  it('forwards menuItems and menuFooter exactly like the chip', () => {
    renderWithProvider(
      <WorkspaceSwitcher
        variant="tile"
        menuItems={[{ id: 'a', label: 'Item A', onClick: () => {} }]}
        menuFooter={<div>Tile footer</div>}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Acme Corp workspace menu' }));

    expect(screen.getByText('Item A')).toBeInTheDocument();
    expect(screen.getByText('Tile footer')).toBeInTheDocument();
    expect(screen.queryByText('Manage workspaces')).toBeNull();
  });

  it('closes on Escape like the chip', () => {
    renderWithProvider(<WorkspaceSwitcher variant="tile" />);

    fireEvent.click(screen.getByRole('button', { name: 'Acme Corp workspace menu' }));
    expect(screen.getByText('Sign out')).toBeInTheDocument();

    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape', code: 'Escape' });

    expect(screen.queryByText('Sign out')).toBeNull();
  });

  it('marks the default chip trigger for symmetry', () => {
    renderWithProvider(<WorkspaceSwitcher />);

    expect(screen.getByRole('button', { name: /acme corp/i })).toHaveAttribute(
      'data-meda-workspace-switcher',
      'chip'
    );
  });
});

// ---------------------------------------------------------------------------
// WorkspaceSwitcher tile — bounded metrics + tooltip
//
// The tile has to fit inside `--shell-header-height` whatever a consumer sets
// that token to; the web app runs a 52px header under its window-tab strip.
// Budget: mark 28 + gap 2 + ONE 14px label line = 44px, and no vertical
// padding that could push past it.
// ---------------------------------------------------------------------------

const LONG_WS: WorkspaceDefinition = {
  id: 'ws-long',
  name: 'Nordisk Medieproduksjon og Kommunikasjon AS',
  icon: null,
};

describe('WorkspaceSwitcher tile — fits the header height', () => {
  it('renders the workspace name on ONE truncated line, never a 2-line clamp', () => {
    renderWithProvider(<WorkspaceSwitcher variant="tile" />);

    const label = screen.getByText('Acme Corp');
    expect(label).toHaveAttribute('data-slot', 'icon-rail-label');
    // Single line: truncate (overflow-hidden + ellipsis + nowrap).
    expect(label.className).toContain('truncate');
    expect(label.className).not.toContain('line-clamp');
    // 14px line box — two of these would already overflow a 52px header.
    expect(label.className).toContain('leading-[14px]');
  });

  it('keeps a long workspace name on one line too', () => {
    render(
      <MedaShellProvider workspace={LONG_WS} apps={apps}>
        <WorkspaceSwitcher variant="tile" />
      </MedaShellProvider>
    );

    const label = screen.getByText(LONG_WS.name);
    expect(label.className).toContain('truncate');
    expect(label.className).not.toContain('line-clamp');
    expect(label.className).toContain('max-w-full');
  });

  it('bounds the trigger: compact mark, no vertical padding, max-h-full', () => {
    renderWithProvider(<WorkspaceSwitcher variant="tile" />);

    const trigger = screen.getByRole('button', { name: 'Acme Corp workspace menu' });
    expect(trigger.className).toContain('max-h-full');
    expect(trigger.className).toContain('gap-0.5');
    // No `py-*` / `pt-*` / `pb-*` — vertical padding is what spilled the tile
    // past a 64px header in the first place.
    expect(trigger.className).not.toMatch(/(^|\s)p[ytb]-/);
    // size-7 mark (28px), not size-8.
    const mark = trigger.querySelector('span > span');
    expect(mark?.className).toContain('size-7');
  });

  it('leaves the chip variant metrics alone', () => {
    renderWithProvider(<WorkspaceSwitcher />);

    const trigger = screen.getByRole('button', { name: /acme corp/i });
    expect(trigger.className).toContain('py-2');
    expect(trigger.querySelector('span')?.className).toContain('truncate');
  });
});

describe('WorkspaceSwitcher tile — tooltip carries the full name', () => {
  async function hoverTile(container: HTMLElement) {
    const tooltipTrigger = container.querySelector('[data-slot="tooltip-trigger"]');
    expect(tooltipTrigger).not.toBeNull();
    await act(async () => {
      fireEvent.mouseEnter(tooltipTrigger as Element);
    });
  }

  it('shows the workspace name on hover when the label is visible but may truncate', async () => {
    const { container } = render(
      <MedaShellProvider workspace={LONG_WS} apps={apps}>
        <WorkspaceSwitcher variant="tile" />
      </MedaShellProvider>
    );

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    await hoverTile(container);
    expect(screen.getByRole('tooltip')).toHaveTextContent(LONG_WS.name);
  });

  it('shows the workspace name on hover when showLabel is false', async () => {
    const { container } = renderWithProvider(
      <WorkspaceSwitcher variant="tile" showLabel={false} />
    );

    expect(screen.queryByText('Acme Corp')).toBeNull();
    await hoverTile(container);
    expect(screen.getByRole('tooltip')).toHaveTextContent('Acme Corp');
  });

  it('is reachable in the icon-only rail header, where the tile label is hidden', async () => {
    const { container } = renderWithProvider(<ShellHeader headerLayout="rail" />);

    expect(screen.queryByText('Acme Corp')).toBeNull();
    await hoverTile(container);
    expect(screen.getByRole('tooltip')).toHaveTextContent('Acme Corp');
  });

  it('does not add a tooltip to the chip variant', () => {
    const { container } = renderWithProvider(<WorkspaceSwitcher />);

    expect(container.querySelector('[data-slot="tooltip-trigger"]')).toBeNull();
  });
});

describe('WorkspaceSwitcher — workspace.icon renders in trigger when set', () => {
  it('shows a workspace icon span when workspace.icon is a ReactNode', () => {
    const wsWithIcon: import('../../../src/shell/types.js').WorkspaceDefinition = {
      id: 'ws-icon',
      name: 'Iconic WS',
      icon: <span data-testid="ws-icon">WS</span>,
    };

    render(
      <MedaShellProvider workspace={wsWithIcon} apps={apps}>
        <WorkspaceSwitcher />
      </MedaShellProvider>
    );

    expect(screen.getByTestId('ws-icon')).toBeInTheDocument();
  });

  it('shows icon for workspace in the dropdown list when workspace.icon is set', () => {
    const wsIconEntry: import('../../../src/shell/types.js').WorkspaceDefinition = {
      id: 'ws-with-icon',
      name: 'Icon WS',
      icon: <span data-testid="list-ws-icon">X</span>,
    };

    render(
      <MedaShellProvider workspace={ws} workspaces={[ws, wsIconEntry]} apps={apps}>
        <WorkspaceSwitcher />
      </MedaShellProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /acme corp/i }));
    expect(screen.getByTestId('list-ws-icon')).toBeInTheDocument();
  });
});
