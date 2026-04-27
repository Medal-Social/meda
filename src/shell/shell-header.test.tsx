import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Menu } from 'lucide-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppTabs, PanelToggle, ShellHeader, WorkspaceSwitcher } from './shell-header.js';
import { MedaShellProvider } from './shell-provider.js';
import type { AppDefinition, WorkspaceDefinition } from './types.js';

// ---------------------------------------------------------------------------
// Mock useShellViewport — default 'desktop', overridden per-test where needed
// ---------------------------------------------------------------------------

vi.mock('./use-shell-viewport.js', () => ({
  useShellViewport: vi.fn(() => 'desktop'),
}));

import { useShellViewport } from './use-shell-viewport.js';

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
  } = {}
) {
  return render(
    <MedaShellProvider
      workspace={ws}
      workspaces={opts.workspaces ?? [ws, ws2]}
      apps={apps}
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

describe('ShellHeader — has no center slot', () => {
  it('renders only left and right regions (no third div in between)', () => {
    const { container } = renderWithProvider(<ShellHeader />);

    const header = container.querySelector('header');
    // Direct div children of the header — should be 2 (left, right) not 3
    const divChildren = Array.from(header?.children ?? []).filter((c) => c.tagName === 'DIV');
    expect(divChildren.length).toBe(2);
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
